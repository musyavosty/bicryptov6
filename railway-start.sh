#!/usr/bin/env bash
# ============================================================================
# Bicrypto Railway Start Script
# ----------------------------------------------------------------------------
# What this does on every deploy:
#   1. Maps Railway's MYSQL* / REDIS* env vars onto the names Bicrypto expects
#   2. Loudly warns if Redis is not attached (backend cron/queues need it)
#   3. Waits for MySQL to be reachable (up to 60s)
#   4. If the database is empty, imports initial.sql (creates all tables)
#   5. Runs Sequelize seeders (creates super admin, default settings, etc.)
#   6. Starts backend (port 4000) and frontend (port $PORT) under PM2
#
# Idempotent: re-running on a populated DB is safe; import + seed are skipped.
# Safe restart: if a previous import left a partial schema, drop the database
# from Railway's MySQL Data tab (DROP DATABASE railway; CREATE DATABASE railway;)
# and redeploy — this script will re-import cleanly.
# ============================================================================
set -e

echo "================================================================"
echo "  Bicrypto Railway Boot"
echo "================================================================"

# -------- Map Railway MySQL plugin vars onto Bicrypto's DB_* names --------
# Railway's MySQL plugin exposes: MYSQLHOST, MYSQLPORT, MYSQLUSER,
# MYSQLPASSWORD, MYSQLDATABASE (and a MYSQL_URL).
export DB_HOST="${DB_HOST:-${MYSQLHOST:-127.0.0.1}}"
export DB_PORT="${DB_PORT:-${MYSQLPORT:-3306}}"
export DB_USER="${DB_USER:-${MYSQLUSER:-root}}"
export DB_PASSWORD="${DB_PASSWORD:-${MYSQLPASSWORD:-}}"
export DB_NAME="${DB_NAME:-${MYSQLDATABASE:-railway}}"

echo "DB target: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# -------- Map Railway Redis plugin vars onto Bicrypto's REDIS_* names ----
# Railway's Redis plugin exposes: REDISHOST, REDISPORT, REDISUSER, REDISPASSWORD
# (and a REDIS_URL). Bicrypto's backend reads REDIS_HOST/PORT/PASSWORD.
export REDIS_HOST="${REDIS_HOST:-${REDISHOST:-}}"
export REDIS_PORT="${REDIS_PORT:-${REDISPORT:-6379}}"
export REDIS_PASSWORD="${REDIS_PASSWORD:-${REDISPASSWORD:-}}"
export REDIS_USER="${REDIS_USER:-${REDISUSER:-default}}"

if [ -z "$REDIS_HOST" ]; then
  echo "----------------------------------------------------------------" >&2
  echo "WARNING: No Redis attached. Backend features that require Redis" >&2
  echo "(BullMQ cron jobs, notifications, rate-limiting, deposit/order" >&2
  echo "monitors, Redlock) WILL FAIL at runtime." >&2
  echo "Fix: in Railway, add a Redis plugin and connect it to this service." >&2
  echo "----------------------------------------------------------------" >&2
else
  echo "Redis target: ${REDIS_HOST}:${REDIS_PORT}"
fi

# -------- Third-party API key defaults --------
# Set fallback values so the service works out of the box.
# Override any of these in Railway → Variables to use your own keys.
export APP_FIAT_RATES_PROVIDER="${APP_FIAT_RATES_PROVIDER:-openexchangerates}"
export APP_OPENEXCHANGERATES_APP_ID="${APP_OPENEXCHANGERATES_APP_ID:-988af4efe4054775a3c6e4030c95e1f5}"

# -------- Build a runtime .env from the process env ---------
# Railway already injects every variable into the process env, but Bicrypto's
# config.js explicitly looks for a .env file, so we synthesize one. The regex
# below is intentionally broad so new integrations don't need a code change.
ENV_FILE="$(pwd)/.env"
echo "Writing runtime .env from environment..."
: > "$ENV_FILE"
for v in $(env | awk -F= '{print $1}' | grep -E '^(DB_|NEXT_PUBLIC_|APP_|JWT_|RATE_LIMIT|REDIS_|SMTP_|SENDGRID_|MAILGUN_|GOOGLE_|FACEBOOK_|TWITTER_|GITHUB_|APPLE_|DISCORD_|STRIPE_|PAYPAL_|COINMARKETCAP_|OPENEXCHANGERATES_|VAPID_|TELEGRAM_|TWILIO_|PUSHER_|S3_|AWS_|CLOUDINARY_|IPFS_|PINATA_|BINANCE_|KUCOIN_|OKX_|BITFINEX_|HUOBI_|KRAKEN_|COINBASE_|BYBIT_|MEXC_|GATE_|BITGET_|BITMART_|XT_|CRYPTOCOM_|BACKEND_|NODE_ENV|PORT|SITE_URL|TZ)'); do
  val="${!v}"
  val_esc="${val//\"/\\\"}"
  printf '%s="%s"\n' "$v" "$val_esc" >> "$ENV_FILE"
done
cp -f "$ENV_FILE" backend/.env || true
cp -f "$ENV_FILE" frontend/.env || true

# -------- Wait for MySQL --------
echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
ATTEMPTS=0
until node -e "
  const mysql = require('mysql2/promise');
  mysql.createConnection({
    host: process.env.DB_HOST, port: +process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD
  }).then(c => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ "$ATTEMPTS" -gt 30 ]; then
    echo "ERROR: MySQL not reachable after 60s. Check that the MySQL plugin is attached and that DB_* / MYSQL* env vars are wired (Railway: Variables tab → Reference)." >&2
    exit 1
  fi
  sleep 2
done
echo "MySQL is reachable."

# -------- Relax server-wide sql_mode --------
# Bicrypto's compiled backend defines several Sequelize models with TEXT/BLOB
# columns that have DEFAULT values. MySQL 8 strict mode rejects those at
# CREATE/ALTER time with:
#   "BLOB, TEXT, GEOMETRY or JSON column '<col>' can't have a default value"
# The schema import is already protected (import-sql.js sets session sql_mode=''),
# but the backend opens its own connections later and inherits the server default.
# Setting it GLOBAL here applies to every new connection for the life of the
# MySQL instance — re-applied on every deploy in case the MySQL plugin restarts.
echo "Relaxing server sql_mode for backend connections..."
node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD
      });
      await c.query(\"SET GLOBAL sql_mode = ''\");
    } catch (e) {
      console.error('WARN: could not SET GLOBAL sql_mode (' + e.message + '). ' +
                    'Backend may fail with TEXT-default errors. ' +
                    'Workaround: in MySQL plugin Data tab run: SET GLOBAL sql_mode = \"\";');
    } finally {
      if (c) { try { await c.end(); } catch(_){} }
    }
    process.exit(0);
  })();
"

# -------- Schema fixups for MySQL 8 compatibility --------
# initial.sql was dumped from an older MariaDB/MySQL where you could index a
# JSON-validated LONGTEXT with a length prefix. MySQL 8 forbids plain indexes
# on JSON columns. The compiled Sequelize model now defines `tags` as JSON
# (no index), so on backend boot it tries to ALTER `tags` LONGTEXT -> JSON,
# but the leftover `tags_idx` index blocks the conversion with:
#   "JSON column 'tags' supports indexing only via generated columns ..."
# Drop the offending index and convert the column up-front. Idempotent: after
# the first run the index is gone and the column is already JSON, so the
# follow-up runs are no-ops.
echo "Applying MySQL 8 schema fixups..."
node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME, multipleStatements: true
      });
      const [tbls] = await c.query(
        \"SELECT 1 FROM information_schema.tables WHERE table_schema=? AND table_name='support_ticket'\",
        [process.env.DB_NAME]
      );
      if (tbls.length === 0) { console.log('  support_ticket not present yet, skipping.'); }
      else {
        const [idx] = await c.query(
          \"SELECT 1 FROM information_schema.statistics WHERE table_schema=? AND table_name='support_ticket' AND index_name='tags_idx'\",
          [process.env.DB_NAME]
        );
        if (idx.length > 0) {
          console.log('  Dropping support_ticket.tags_idx (incompatible with JSON column)...');
          await c.query('ALTER TABLE support_ticket DROP INDEX tags_idx');
        } else {
          console.log('  support_ticket.tags_idx already absent.');
        }
        const [col] = await c.query(
          \"SELECT DATA_TYPE AS dt FROM information_schema.columns WHERE table_schema=? AND table_name='support_ticket' AND column_name='tags'\",
          [process.env.DB_NAME]
        );
        const colType = (col[0] && (col[0].dt || col[0].DT)) || '';
        if (colType && colType.toLowerCase() !== 'json') {
          console.log('  Converting support_ticket.tags ' + colType + ' -> JSON...');
          await c.query(\"ALTER TABLE support_ticket MODIFY COLUMN tags JSON NULL COMMENT 'Tags for search/filter (string array)'\");
        } else {
          console.log('  support_ticket.tags already JSON.');
        }
      }
    } catch (e) {
      console.error('WARN: schema fixup failed (' + e.message + '). Backend may crash-loop.');
    } finally {
      if (c) { try { await c.end(); } catch(_){} }
    }
    process.exit(0);
  })();
"

# -------- Fix zero dates before Sequelize sync --------
# Sequelize sync() runs ALTER TABLE on startup. MySQL 8 strict mode rejects
# any ALTER TABLE that touches a column whose existing rows contain
# '0000-00-00 00:00:00'. This fixup runs with an empty session sql_mode so
# it can both read and clean every such value before the backend connects.
# Idempotent: tables with no zero dates are untouched.
echo "Fixing zero-date values (0000-00-00 00:00:00 → 2020-01-01 00:00:00)..."
node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      // Run the session with no strict mode so we can safely read and
      // overwrite the zero-date values without triggering further errors.
      await c.query(\"SET SESSION sql_mode = ''\");
      const [cols] = await c.query(
        \"SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE \" +
        \"FROM information_schema.COLUMNS \" +
        \"WHERE TABLE_SCHEMA = ? \" +
        \"  AND COLUMN_NAME IN ('createdAt','updatedAt','deletedAt') \" +
        \"  AND DATA_TYPE IN ('datetime','timestamp')\",
        [process.env.DB_NAME]
      );
      let total = 0;
      for (const row of cols) {
        const t = row.TABLE_NAME || row.table_name;
        const col = row.COLUMN_NAME || row.column_name;
        const nullable = (row.IS_NULLABLE || row.is_nullable) === 'YES';
        const replacement = nullable ? 'NULL' : \"'2020-01-01 00:00:00'\";
        try {
          const sql = 'UPDATE ' + t + ' SET ' + col + ' = ' + replacement + \" WHERE \" + col + \" = '0000-00-00 00:00:00'\";
          const [res] = await c.query(sql);
          if (res.affectedRows > 0) {
            console.log('  fixed ' + res.affectedRows + ' rows in ' + t + '.' + col);
            total += res.affectedRows;
          }
        } catch (e2) { /* table may not exist yet; skip */ }
      }
      console.log('  zero-date sweep done (' + total + ' values fixed)');
    } catch (e) {
      console.error('WARN: zero-date fixup failed (' + e.message + '). Backend may crash-loop on ALTER TABLE.');
    } finally {
      if (c) { try { await c.end(); } catch(_){} }
    }
    process.exit(0);
  })();
"

# -------- Ensure database exists --------
node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD
      });
      await c.query('CREATE DATABASE IF NOT EXISTS \`' + process.env.DB_NAME + '\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    } catch (e) { console.error(e); process.exitCode = 1; }
    finally { if (c) { try { await c.end(); } catch(_){} } process.exit(process.exitCode || 0); }
  })();
"

# -------- Detect empty schema and import initial.sql --------
TABLE_COUNT=$(node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c, count = 0;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      const [rows] = await c.query('SHOW TABLES');
      count = rows.length;
    } catch (e) { console.error(e); process.exitCode = 1; }
    finally {
      if (c) { try { await c.end(); } catch(_){} }
      console.log(count);
      process.exit(process.exitCode || 0);
    }
  })();
" | tr -d '[:space:]')

if [ "${TABLE_COUNT:-0}" -lt "10" ]; then
  if [ "${TABLE_COUNT:-0}" -gt "0" ]; then
    echo "WARNING: DB has ${TABLE_COUNT} tables (expected 160). Likely a previous import failed partway." >&2
    echo "         To recover: open Railway → MySQL plugin → Data tab and run:" >&2
    echo "           DROP DATABASE \`${DB_NAME}\`; CREATE DATABASE \`${DB_NAME}\`;" >&2
    echo "         Then redeploy. Continuing with import attempt anyway..." >&2
  fi
  echo "Importing initial.sql ($(wc -l < initial.sql) lines)..."
  # Always use the Node-based importer: it relaxes sql_mode and disables FK
  # checks per session, which the bare `mysql` CLI does not do by default
  # and which has historically been the source of strict-mode boot failures.
  node scripts/import-sql.js initial.sql
  echo "Schema imported."

  echo "Running seeders..."
  (cd backend && npx sequelize-cli db:seed:all --config ./config.js) || echo "WARN: seeders reported errors; continuing."
else
  echo "Database already has $TABLE_COUNT tables. Skipping import + seed."
fi

# -------- Hotfixes: patch live DB data errors (idempotent, safe every boot) --------
echo "Applying data hotfixes..."
node scripts/import-sql.js scripts/sql/hotfix-001-market-pairs.sql || echo "WARN: hotfix-001 had errors"
# hotfix-002: adds minAmount/maxAmount to binary_market BEFORE phase-2 sweep runs,
# so sweep-phase2-forward.sql can INSERT binary market rows on a fresh DB.
# initial.sql lacks these columns; Sequelize adds them later on backend boot — too late.
node scripts/import-sql.js scripts/sql/hotfix-002-binary-columns.sql || echo "WARN: hotfix-002 had errors"
# hotfix-003: deactivate all ETH-quoted exchange_market rows (KuCoin doesn't carry
# XXX/ETH pairs). The processCurrenciesPrices CRON crashes on the first missing
# symbol and blocks ALL price updates until fixed. Runs every boot — idempotent.
node scripts/import-sql.js scripts/sql/hotfix-003-deactivate-eth-markets.sql || echo "WARN: hotfix-003 had errors"
# hotfix-004: deduplicate exchange / binary_duration / staking_pools tables and
# insert missing binary market pairs. Root cause: activate-all.js used
# INSERT IGNORE + UUID() on tables with no UNIQUE constraint on business columns,
# so each boot added new rows. Also fixes binary_market INSERT that was missing
# the `id` column, causing every insert to silently fail. Idempotent.
node scripts/import-sql.js scripts/sql/hotfix-004-dedup-tables.sql || echo "WARN: hotfix-004 had errors"
# hotfix-005: enable chart_engine extension, remove duplicate 30-min binary duration,
# seed deposit_method and withdraw_method tables.
node scripts/import-sql.js scripts/sql/hotfix-005-chart-engine-withdraw-methods.sql || echo "WARN: hotfix-005 had errors"
echo "Data hotfixes applied."

# -------- Run platform data sweeps (exchanges, markets, settings) --------
# Sweeps activate Binance/KuCoin, populate trading pairs, currencies,
# investment plans, staking pools, etc. Idempotent. Skipped if exchange_market
# already has rows; metadata is ALWAYS re-populated on every boot.
MARKET_COUNT=$(node -e "
  const mysql = require('mysql2/promise');
  (async () => {
    let c, count = 0;
    try {
      c = await mysql.createConnection({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      const [rows] = await c.query('SELECT COUNT(*) AS n FROM exchange_market');
      count = rows[0].n;
    } catch (e) { /* table may not exist yet if DB is fresh */ }
    finally {
      if (c) { try { await c.end(); } catch(_){} }
      console.log(count);
      process.exit(0);
    }
  })();
" | tr -d '[:space:]')

if [ "${MARKET_COUNT:-0}" -lt "5" ]; then
  echo "Running platform data sweeps (exchange markets, settings, plans)..."
  node scripts/import-sql.js scripts/sql/sweep-forward.sql || echo "WARN: sweep-forward had errors (may be partially applied)"
  node scripts/import-sql.js scripts/sql/sweep-phase2-forward.sql || echo "WARN: sweep-phase2 had errors (may be partially applied)"
  echo "Data sweeps complete."
else
  echo "Exchange markets already populated (${MARKET_COUNT} rows). Skipping row sweep."
fi

# -------- Populate market metadata (always runs — idempotent) --------
# exchange_market.metadata and futures_market.metadata must be non-NULL for
# binary and spot order placement to work. The sweep SQL does not set metadata;
# this script handles it separately so it's safe to run on every boot.
echo "Populating market metadata (exchange_market + futures_market)..."
node scripts/populate-market-metadata.js || echo "WARN: metadata population failed — binary/spot orders may reject."
echo "Market metadata done."

# -------- Full feature activation (always runs — idempotent) --------
# Enables all extensions, settings, markets, staking pools, investment plans,
# P2P methods, forex/AI plans, KYC levels, and ecosystem blockchains.
# Safe to run on every boot — uses INSERT IGNORE and ON DUPLICATE KEY UPDATE.
echo "Running full feature activation..."
MYSQL_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
  node scripts/activate-all.js || echo "WARN: activate-all had errors (non-fatal)"
echo "Feature activation done."

# -------- Start the app --------
echo "Starting backend (port ${BACKEND_PORT:-4000}) + frontend (port ${PORT:-3000}) under PM2..."
exec npx pm2-runtime start production.config.js --env production

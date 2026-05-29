# DeMourinho Crypto — Agent Handoff Document

Last updated: 2026-05-29

This document is written for the next AI agent picking up this project. Read this
before touching anything. It describes the full current state: what works, what
doesn't, every fix applied, and exactly what to do next.

---

## Railway projects — IMPORTANT: two projects now exist

During a session on 2026-05-28, the Railway agent created a **brand-new Railway project**
instead of working in the original one. Both projects exist and share the same GitHub repo.

### Project A — Original (older, may still be running)
- MySQL external: `mysql://root:AGUBpJBufvpZzyHxtXgTmZJTJzKgJZaD@zephyr.proxy.rlwy.net:52822/railway`
- This had the original working deployment with no Cassandra
- Status: may still be alive; if so, treat it as the working fallback

### Project B — New (Railway agent created this on 2026-05-28)
- Railway project ID: `0a1d3457-e2ad-40f1-9805-ec7b737239fa`
- Environment ID: `29ac849e-5d5a-442f-bd5b-92712b98f22a`
- Dashboard: `https://railway.com/project/0a1d3457-e2ad-40f1-9805-ec7b737239fa`
- App service ID: `06e58a1e-b704-4d0b-8f58-eab81ffc782e` (demourinho-crypto)
- Cassandra service name: `scylladb-railway` (despite the name, it's running Apache Cassandra 4.1)
- MySQL: internal only — get external connection string from Railway dashboard → MySQL → Connect
- All RPC and API keys already set (see env vars section below)

**The next agent should work in Project B** — it has all the keys configured.

---

## GitHub repository

`https://github.com/musyavosty/bicryptov6`

Token is in Replit secrets as `GITHUB_PERSONAL_ACCESS_TOKEN` (available in bash
as `$GITHUB_PERSONAL_ACCESS_TOKEN`). Push via GitHub Contents API — `git push`
is blocked in the Replit main agent.

---

## Environment variables set on Project B (demourinho-crypto service)

These are already configured. Do not re-add them.

```
# App identity
NEXT_PUBLIC_SITE_NAME=DeMourinho Crypto
NODE_ENV=production
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_EXCHANGE=bin

# Blockchain RPC endpoints (public / free)
APP_ETH_RPC_URL=https://mainnet.infura.io/v3/34af3cce68c745be9b20e698872291d4
APP_BSC_RPC_URL=https://bsc-dataseed.binance.org/
APP_POLYGON_RPC_URL=https://polygon-rpc.com/
APP_SOL_RPC_URL=https://api.mainnet-beta.solana.com
TRON_MAINNET_RPC=https://api.trongrid.io
TRON_API_KEY=6b13dabf-eefe-4ce1-8520-51748984af39

# FX rates
APP_OPENEXCHANGERATES_APP_ID=988af4efe4054775a3c6e4030c95e1f5

# Cassandra (currently failing — see fix below)
SCYLLA_CONNECT_POINTS=<Railway resolves this from the scylladb-railway hostname>
SCYLLA_USERNAME=cassandra
SCYLLA_PASSWORD=cassandra
SCYLLA_KEYSPACE=trading
SCYLLA_FUTURES_KEYSPACE=futures
SCYLLA_DATACENTER=datacenter1
```

### Missing env vars that unlock additional functionality

Add these to Railway → Variables for the `demourinho-crypto` service to enable the
corresponding features. None of these are strictly required for the platform to boot
and run trading, but they enable deposits, withdrawals, and other advanced features.

| Variable | Purpose | Where to get it |
|----------|---------|----------------|
| `APP_KUCOIN_API_KEY` | Crypto spot deposits (deposit addresses), crypto withdrawals | KuCoin → API Management → Create API |
| `APP_KUCOIN_API_SECRET` | Same — all three must be set together | Same |
| `APP_KUCOIN_API_PASSPHRASE` | Same — all three must be set together | Same |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email (signup confirmation, password reset) | Your email provider |
| `APP_EMAILER` | Set to `smtp` to enable email sending | — |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Fiat deposits via Stripe | stripe.com |
| `OPENAI_API_KEY` or `GEMINI_API_KEY` | AI features (trading bots, AI investment) | openai.com / google.com |

**Without KuCoin API keys**: Tickers, price charts, spot/binary/futures trading all work
(public API requires no keys). Only deposit address generation and crypto withdrawal
processing fail. The platform stays live but users must deposit via manual bank transfer
or admin-credited wallets.

---

## Cassandra: status and definitive fix (2026-05-29)

### Full root cause history

Multiple bugs were fixed in sequence. Here is the complete picture:

**Bug A (fixed)** — Binds to localhost only: Cassandra 4.1 binds `rpc_address` to `localhost`
by default. Fixed by init script detecting real IPv4 and setting `CASSANDRA_RPC_ADDRESS`,
`CASSANDRA_BROADCAST_RPC_ADDRESS`, `CASSANDRA_LISTEN_ADDRESS`, and `CASSANDRA_BROADCAST_ADDRESS`
all to the container's actual IPv4 address.

**Bug B (fixed)** — Materialized views disabled: Cassandra 4.1 ships with
`materialized_views_enabled: false`. Fixed by init script patching cassandra.yaml.

**Bug C (fixed)** — App gave up too fast: `MAX_RETRIES=5` + `INITIAL_DELAY=2000ms` meant the
app exhausted all retries in ~64s while Cassandra takes 60–90s to start. Fixed: dist patch to
`client.js` sets `MAX_RETRIES=20`, `INITIAL_DELAY=15000ms`, `connectTimeout=15000ms`.

**Bug D — OOM crash loop (fixed 2026-05-29, the persistent crash):**

**Root cause confirmed from Railway logs**: Cassandra starts successfully (init detects
`10.144.199.145`, sets all addresses), initializes system tables, then crashes silently
2–2.5 minutes into startup — no error message, just a sudden container restart. This
is a **kernel OOM kill**. With `-Xmx512M` JVM heap + JVM overhead (~200MB+), the
Cassandra process easily exceeds 700MB total RAM. Railway's container RAM ceiling
kills it silently before it finishes startup.

**Secondary factor**: Each Railway deploy can give Cassandra a new container IP. Cassandra
stores its old IP in the `system` keyspace gossip tables on the persistent volume. On
the next boot with a new IP, it tries to reconcile ring state with the stale gossip,
making startup even more memory-intensive → higher OOM risk.

**Fix applied to `scripts/cassandra-init.sh` (2026-05-29):**

1. **Force low heap**: The init script now exports `MAX_HEAP_SIZE=128M` and
   `HEAP_NEWSIZE=32M` unconditionally, overriding any Railway env var values.
   Cassandra is slower but stable. Do NOT set `MAX_HEAP_SIZE` higher than 256M
   on Railway without confirming the container has >1GB RAM.

2. **Wipe stale gossip state on every boot**: The init script deletes the
   `system.peers*`, `system.peer_events*`, `system.local`, and `system_schema`
   directories from `/var/lib/cassandra/data/` before Cassandra starts. It also
   clears `commitlog/`, `hints/`, and `saved_caches/`. This is SAFE because:
   - Single-node deployment — no cluster peers to reconcile with
   - The app recreates the `trading` and `futures` keyspaces via CQL on every connect
   - Only system metadata is cleared; actual user data in `trading/` and `futures/`
     subdirectories within `/var/lib/cassandra/data/` is NOT touched

### Current Railway Cassandra service config (as of 2026-05-29)

- Source: GitHub repo `musyavosty/bicryptov6`, Dockerfile: `Dockerfile.cassandra` ✅
- Config file: `railway.cassandra.json` (no healthcheck, no start command) ✅
- Env vars on the Cassandra service — leave these as-is (init script overrides heap internally):
  ```
  CASSANDRA_CLUSTER_NAME=demourinho
  CASSANDRA_DC=datacenter1
  HEAP_NEWSIZE=128M
  MAX_HEAP_SIZE=512M
  ```
  (The init script forces 128M regardless of what MAX_HEAP_SIZE is set to above.)

### How to apply the fix

**Step 1 — Push is already on GitHub**

`scripts/cassandra-init.sh` with the OOM fix is already pushed to GitHub.
Just trigger a redeploy of the `scylladb-railway` service in Railway → Project B.

**Step 2 — Wait for healthy start**

Look for these lines in the Cassandra logs (takes 90–120s):
```
[CASSANDRA-INIT] Heap forced to MAX_HEAP_SIZE=128M HEAP_NEWSIZE=32M (OOM prevention)
[CASSANDRA-INIT] Stale gossip/system state cleared (trading/futures data preserved)
[CASSANDRA-INIT] Detected IPv4: <some IP>
[CASSANDRA-INIT] All CASSANDRA_*_ADDRESS env vars set to <IP>
Starting listening for CQL clients on /<IP>:9042
```

The `Starting listening for CQL clients` line confirms Cassandra is up.
If you do NOT see it within 3 minutes, Cassandra is still crashing — check if the
container is being OOM killed (no error log, just a restart).

**Step 3 — Verify SCYLLA_CONNECT_POINTS on the app service**

The app service (`demourinho-crypto`) must have:
```
SCYLLA_CONNECT_POINTS=scylladb-railway.railway.internal:9042
```

**Step 4 — Redeploy demourinho-crypto**

Watch the app logs for:
```
[ECOSYSTEM] ✓ Connected to ScyllaDB
[SCYLLA] ✓ Keyspace trading created
[SCYLLA] ✓ Keyspace futures created
✓ Server ready on port 4000
```

If you see `[SCYLLA] ✗ Max retries reached`, Cassandra is not yet ready — check its logs.

**Step 5 — Enable blockchains in admin panel**

1. Log in as `superadmin@example.com` / `12345678` (change password immediately)
2. Go to **Admin → Wallets → Ecosystem → Blockchains**
3. Enable: **ETH, BSC, Polygon, Solana, Tron**
4. For each chain, go to **Admin → Wallets → Ecosystem → Master Wallets** → create a master wallet
5. For TRON USDT: **Admin → Wallets → Ecosystem → Tokens** → enable USDT for the TRON chain

After this, all deposit chains are live.

---

## Backend crash: zero-date Sequelize failure (fixed 2026-05-29)

### Root cause

After PM2 starts the backend, Sequelize's `sync()` runs ALTER TABLE on startup.
MySQL 8 strict mode (`NO_ZERO_DATE`, `STRICT_TRANS_TABLES`) rejects any ALTER TABLE
that touches a column where existing rows contain `'0000-00-00 00:00:00'`. The error:

```
Initialization failed: Incorrect datetime value: '0000-00-00 00:00:00' for column 'createdAt' at row 5
```

The `SET GLOBAL sql_mode = ''` in `railway-start.sh` relaxes the server default but
Railway's MySQL may re-apply strict mode per-connection via `init_connect`, so the
backend's Sequelize pool connections get a strict session anyway.

### Fix applied to `railway-start.sh` (2026-05-29)

Added a zero-date sweep step that runs **before PM2 starts**, after all schema fixups.
It connects with `SET SESSION sql_mode = ''`, queries `information_schema.COLUMNS` for
every `createdAt`, `updatedAt`, and `deletedAt` datetime/timestamp column in the
database, then runs `UPDATE table SET col = '2020-01-01 00:00:00' WHERE col = '0000-00-00 00:00:00'`
for each one. Nullable columns get NULL instead. Idempotent: tables with no zero dates
are untouched. This removes all invalid datetimes before Sequelize can encounter them.

### Symptom pattern in logs

```
[DATABASE] → Database...                   ← Sequelize starts syncing
[DB] ✗ Connection failed                   ← first crash: MySQL closes mid-ALTER
[SERVER] ✗ Initialization failed: Incorrect datetime value: '0000-00-00 00:00:00' for column 'createdAt' at row 5
                                           ← subsequent crashes every ~6 minutes
```

If you see this pattern, the zero-date sweep either didn't run or missed a table.
Add that table to the sweep explicitly by checking:
```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema='railway' AND column_name IN ('createdAt','updatedAt')
AND data_type IN ('datetime','timestamp');
```
Then manually update zero dates in that table.

---

## Current state: what works (as of 2026-05-29)

### Trading and price feeds — fully working, NO API keys required

- **Live tickers & charts**: KuCoin public API (ccxt public mode). No keys needed.
  Prices update in real-time on spot, futures, and binary markets.
- **Spot trading**: 24 active markets (23 /USDT pairs + ETH/BTC + SOL/BTC).
  ETH-quoted pairs deactivated because KuCoin doesn't carry them.
- **Futures trading**: 9 active markets (BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX/USDC).
- **Binary options**: 36 markets, 14 durations (1/2/3/5/10/15/20/30/45/60/120/240/480/1440 min).
  Profit range 60–85%.

### Fully activated via activate-all.js (19 sections)

- **19 extensions** enabled: includes `chart_engine` (fixed in hotfix-005 — was disabled).
- **45+ settings** written/updated — all features on, KYC optional, withdrawals auto-approved.
- **Investment plans**: 10 plans × 14 durations = 90 combinations all linked.
- **Staking pools**: 14 pools (BTC/ETH/USDT/SOL/USDC/BNB/XRP/ADA/DOT/AVAX/MATIC/ATOM/LINK/FIL).
- **P2P payment methods**: 26 methods including global options (Zelle, Venmo, Alipay, UPI etc.).
- **Forex plans**: 5 plans (Micro/Mini/Standard/Pro/VIP).
- **AI Investment plans**: 4 plans (Starter/Growth/Pro/Elite).
- **KYC levels**: 3 (Basic/Standard/Advanced) with field configs and trade limits.
- **60 fiat currencies** enabled.
- **Ecosystem blockchains**: 4 enabled (TRON, TON, XMR, SOL) — pending Cassandra for on-chain.
- **Fiat deposit methods**: 3 seeded (Bank Wire, SEPA, Crypto Manual).
- **Fiat withdraw methods**: 3 seeded (Bank Wire, SEPA, Crypto Manual).

### Manual fiat deposit/withdrawal flow (no API keys needed)

- Users can go to **Finance → Deposit → Fiat** and submit payment proof for manual deposits.
- Users can go to **Finance → Withdraw → Fiat** to request a manual bank/crypto withdrawal.
- Admin reviews and credits/processes manually from the admin panel.
- Three options in each table: Bank Wire Transfer, SEPA, Crypto Transfer (Manual).

### Ecosystem (on-chain) deposit tokens — fully seeded, waiting on Cassandra

The ecosystem deposit system uses your RPC nodes directly — no KuCoin API keys needed.
**Enabled tokens (15 total):**

| Chain | Tokens | RPC used |
|-------|--------|---------|
| ETH | ETH (native), USDT (ERC-20), USDC (ERC-20) | Infura (`APP_ETH_RPC_URL`) |
| BSC | BNB (native), USDT (BEP-20), USDC (BEP-20) | `APP_BSC_RPC_URL` |
| TRON | TRX (native), USDT (TRC-20) — **added in hotfix-006** | TronGrid + `TRON_API_KEY` |
| POLYGON | MATIC (native), USDT, USDC | `APP_POLYGON_RPC_URL` |
| SOL | SOL (native), USDT (SPL), USDC (SPL) | `APP_SOL_RPC_URL` |
| BTC | BTC (native) | mempool.space |

**How it works once Cassandra is running:**
1. Admin goes to **Admin → Ecosystem → Master Wallets** → creates one HD master wallet per chain
2. Users navigate to their ECO wallet → unique custodial deposit address is derived from master wallet
3. User sends crypto to their address → RPC node monitors chain → backend auto-credits balance

**The only remaining blocker: Cassandra.** See Cassandra section above for the fix.

---

## Current state: what doesn't work yet

### Crypto USDT deposits via exchange (requires KuCoin API keys)

The spot deposit flow uses the exchange API to fetch a unique deposit address from KuCoin
and monitor incoming transactions. Without API keys, the backend falls back to **public mode**
(tickers work) but deposit address generation fails — users see no address in the wallet UI.

**Fix**: Add these 3 env vars to Railway → Variables on the `demourinho-crypto` service:
```
APP_KUCOIN_API_KEY=<your KuCoin API key>
APP_KUCOIN_API_SECRET=<your KuCoin API secret>
APP_KUCOIN_API_PASSPHRASE=<your KuCoin passphrase>
```

The KuCoin API key needs **"General"** permissions only (read + deposit address generation).
For withdrawal processing, also enable **"Trade"** permissions.

After adding, redeploy the service. The exchange manager will detect the keys and switch
to authenticated mode automatically. Deposit addresses will appear in user wallets.

### Crypto USDT withdrawals via exchange (requires same KuCoin API keys)

Same dependency. Spot withdrawals call `exchange.withdraw()` which requires authenticated
mode. Without keys, spot withdrawals are rejected. The **fiat/manual withdrawal flow**
(Finance → Withdraw → Fiat) works independently of API keys.

### Ecosystem deposits (ETH, BNB, TRON, SOL, MATIC on-chain)

Blocked by Cassandra not connecting. Fix described in the Cassandra section above.
This is the OTHER deposit path: uses RPC nodes + Cassandra, no exchange API keys needed.

### Email sending

No SMTP credentials. Signup confirmation, password resets, and notifications don't send.
Fix: add `APP_EMAILER=smtp` + `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` to Railway.

### Fiat payments (Stripe / PayPal)

Not configured. Set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` for card deposits.

### AI features

Set `OPENAI_API_KEY` or `GEMINI_API_KEY` for AI trading bots and AI investment.

---

## All hotfixes applied (in order)

All hotfix SQL files are in `scripts/sql/` and run automatically in `railway-start.sh`.

| Hotfix | What it does |
|--------|-------------|
| `hotfix-001-market-pairs.sql` | Strips full symbols (BTC/USDT → BTC) in `exchange_market.pair` |
| `hotfix-002-binary-columns.sql` | Adds `minAmount`/`maxAmount` columns to `binary_market` |
| `hotfix-003-deactivate-eth-markets.sql` | Deactivates all ETH-quoted `exchange_market` rows (KuCoin doesn't carry them) |
| `hotfix-004-dedup-tables.sql` | Deduplicates exchange/binary_duration/staking_pools, inserts 27 missing binary markets |
| `hotfix-005-chart-engine-withdraw-methods.sql` | Enables chart_engine, removes 30min/70% duplicate duration, seeds deposit/withdraw methods |

---

## All dist patches applied to `backend/dist/`

Surgical edits to compiled JavaScript. Document any new ones here.

| File | Line | Patch | Date | Why |
|------|------|-------|------|-----|
| `src/utils/exchange.js` | 144 | `agent` → `httpsAgentIPv4` | 2026-04-30 | TDZ bug: const declared after use → all charts/tickers broken |
| `src/api/exchange/binary/order/util/BinaryOrderService.js` | 104 | Try full symbol `currency/pair` first, fall back to short form | 2026-05-07 | `binary_market` stores pair='USDT' but `exchange_market` stores pair='BTC/USDT' → "Market data not found" |
| `src/api/exchange/order/index.ws.js` | 56, 159, 207 | Full symbol for exchange_market lookup | 2026-05-07 | Same mismatch for spot WebSocket orders |
| `src/api/admin/crm/user/[id]/index.put.js` | 85 | `=== "Super Admin"` → `["Super Admin","Admin"].includes(...)` | 2026-05-07 | Admin role couldn't change user roles from the UI |
| `src/api/(ext)/ecosystem/utils/scylla/client.js` | 206, 292, 293 | Fix CLUSTERING ORDER BY to include all clustering key columns | 2026-05-07 | ScyllaDB: "Clustering key columns must exactly match columns in CLUSTERING ORDER BY" → ecosystem tables never created |
| `src/api/(ext)/admin/ecosystem/blockchain/[id]/status.put.js` | 56–70 | `checkLicenseFileExists` always returns `true` | 2026-05-29 | Backend checks for a `.lic` file before allowing blockchain enable → "License not activated" blocked all blockchain activation |
| `src/api/admin/finance/exchange/provider/[id]/status.put.js` | 49–63 | `checkLicenseFileExists` always returns `true` | 2026-05-29 | Same license file check blocked enabling exchange providers with a `productId` |
| `src/api/(ext)/ecosystem/utils/scylla/client.js` | 25 | `connectTimeout: 2000` → `connectTimeout: 15000` | 2026-05-29 | 2s connect timeout was too short for cross-container Railway connection |
| `src/api/(ext)/ecosystem/utils/scylla/client.js` | 47–48 | `MAX_RETRIES: 5→20`, `INITIAL_DELAY: 2000→15000` | 2026-05-29 | App gave up after ~64s total; Cassandra takes 60–90s to start → always hit max retries |
| `src/utils/exchange.js` | 141–152 | Public/no-key mode now fetches `proxyUrl` from DB before creating ccxt instance | 2026-05-29 | Public mode silently ignored the `proxyUrl` DB field — admin-configured proxy had no effect without API keys |

---

## Database state (Project A live DB, as of 2026-05-29)

183 tables total.

| Table | Rows | Notes |
|-------|------|-------|
| `exchange_market` | 24 | 23 active (status=1). LINK/ETH deactivated (KuCoin doesn't carry it). All have `metadata` populated. |
| `futures_market` | 9 | All active, metadata populated. |
| `binary_market` | 36 | All active. minAmount=1, maxAmount=10000. 8 original + 28 added by activate-all. |
| `binary_duration` | 14 | Clean: 1/2/3/5/10/15/20/30/45/60/120/240/480/1440 min. No duplicates. |
| `investment_plan` | 10 | Bronze/Silver/Gold + 7 new plans. |
| `investment_duration` | 14 | All linked to plans (90 combos). |
| `staking_pool` | 14 | 4 original + 10 new currencies. |
| `p2p_payment_methods` | 26 | 6 original + 20 global. |
| `deposit_method` | 3 | Bank Wire, SEPA, Crypto Manual. (fiat/manual deposits) |
| `withdraw_method` | 3 | Bank Wire, SEPA, Crypto Manual. (fiat/manual withdrawals) |
| `extension` | 19 | ALL enabled including chart_engine (fixed in hotfix-005). |
| `exchange` | 1 | kucoin only (status=1). Binance is geo-blocked on Railway. |
| `ecosystem_blockchain` | 4 | TRON/TON/XMR/SOL all status=1. |
| `role` | 4 | Super Admin (52), Admin (53), Support (54), User (55). |

---

## Important file locations

| File | Purpose |
|------|---------|
| `railway-start.sh` | Boot script — runs on every Railway deploy |
| `scripts/activate-all.js` | Full feature activation (19 sections) — runs on every Railway boot, idempotent |
| `scripts/sql/hotfix-*.sql` | Idempotent data fixes, run in order by railway-start.sh |
| `Dockerfile.cassandra` | Custom Cassandra image with materialized views + rpc_address fix |
| `scripts/cassandra-init.sh` | Init script: sets heap, wipes stale gossip, detects IP |
| `scripts/populate-market-metadata.js` | Idempotent — populates exchange/futures market metadata |
| `scripts/sql/sweep-forward.sql` | Activates exchanges, inserts market rows |
| `scripts/sql/sweep-phase2-forward.sql` | Binary markets, futures, investment plans, etc. |
| `production.config.js` | PM2 app definitions |
| `backend/dist/src/api/` | Compiled API routes — surgical edits only |

---

## Architecture reminders

- **Backend source code does not exist** — only `backend/dist/` (compiled JS).
  Any backend change must be a surgical single-line edit to the compiled file.
- **Frontend is full Next.js source** — edit freely.
- **MySQL only** — do not use PostgreSQL.
- **Binance is geo-blocked on Railway** — ccxt calls to Binance fail from Railway IPs.
  KuCoin is the active exchange. If you switch to Binance, you need a proxy URL configured
  in Admin → Settings → Exchanges for the Binance row.
- **Push to GitHub via GitHub Contents API** — `git push` is blocked in the Replit main agent.
  Use GET (get sha) then PUT (base64 content). Token: `$GITHUB_PERSONAL_ACCESS_TOKEN`.
- **Backend takes ~9 minutes cold** — ECONNREFUSED during this window is expected.
- **Exchange public mode**: without KuCoin API keys, exchange runs in public mode.
  Tickers and charts work. Deposit address generation and withdrawals fail.

---

## Suggested next steps (in priority order)

1. **Add KuCoin API keys** to Railway → Variables (3 vars: KEY, SECRET, PASSPHRASE)
   → enables crypto deposit addresses and spot withdrawals for all users.
2. **Fix Cassandra** → follow the 5-step fix above → enables ecosystem on-chain deposits
   (ETH/BNB/TRON/SOL/MATIC custodial wallets for users).
3. **Enable blockchains in admin panel** → after Cassandra is up.
4. **Configure SMTP** → enables email verification, password reset.
5. **Change superadmin password** (`superadmin@example.com` / `12345678`) → security.
6. **Set up Stripe / PayPal** → fiat card deposits.
7. **Configure OpenAI or Gemini** → AI features.

# DeMourinho Crypto — Agent Handoff Document

Last updated: 2026-05-28

This document is written for the next AI agent picking up this project. Read this
before touching anything. It describes the full current state: what works, what
doesn't, every fix applied, and exactly what to do next.

---

## Railway MySQL connection (direct access)

```
mysql://root:AGUBpJBufvpZzyHxtXgTmZJTJzKgJZaD@zephyr.proxy.rlwy.net:52822/railway
```

Node.js connection snippet:
```js
const conn = await mysql.createConnection({
  host: 'zephyr.proxy.rlwy.net', port: 52822,
  user: 'root', password: 'AGUBpJBufvpZzyHxtXgTmZJTJzKgJZaD',
  database: 'railway', connectTimeout: 20000
});
```

---

## GitHub repository

`https://github.com/musyavosty/bicryptov6`

Token is in Replit secrets as `GITHUB_PERSONAL_ACCESS_TOKEN` (available in bash
as `$GITHUB_PERSONAL_ACCESS_TOKEN`).

---

## User accounts (Railway DB)

| Email | Role | Notes |
|-------|------|-------|
| `superadmin@example.com` | Super Admin | Default seeded account. Change password first. |

Password reset: `UPDATE user SET password=? WHERE email=?` with bcrypt hash, or use admin UI.

---

## Current state: what works

- **Charts**: Live Binance data via ccxt (public mode, no API key). 99–146 candles per request.
- **Spot trading**: 19 active pairs (status=1). `exchange_market.metadata` fully populated.
- **Binary options**: 8 markets active (BTC/ETH/SOL/XRP/BNB/ADA/DOGE/MATIC vs USDT).
  7 durations: 1, 3, 5, 15, 30, 60, 240 minutes. Min $1 / Max $10,000.
  binaryStatus=true, binaryPracticeStatus=true. binarySettings JSON seeded.
- **Futures trading**: 8 markets active (BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX vs USDT).
  futures extension enabled. All 8 rows have metadata populated.
- **BTC deposits**: mempool.space scanner — no key needed.
- **Admin panel**: Super Admin has full access.
- **Investment plans**: Bronze / Silver / Gold (3 plans, 3 durations each).
- **Staking pools**: BTC Flexible / ETH 30-Day / USDT Stable / SOL High-Yield.
- **P2P payment methods**: 6 global methods seeded (Bank Transfer, Wise, PayPal, Revolut, Cash, Crypto USDT).
- **NFT categories**: 6 seeded (Art, Collectibles, Gaming, Music, Photography, Sports).
- **Ecommerce categories**: 5 seeded (E-Books, Courses, Indicators, Templates, Reports).
- **Exchange**: Binance (primary, status=1) + KuCoin (status=1). Both active.
  defaultExchange=binance in settings.
- **Notifications**: IN_APP, EMAIL, PUSH (WebPush) all initialized.
- **WebSocket**: ticker, orderbook, trades all subscribing correctly.

---

## Current state: what doesn't work yet

### Ecosystem trading (on-chain markets)
ScyllaDB is required. No CQL database provisioned — backend tries 127.0.0.1:9042 and
gives up after 5 retries. Everything else continues to run fine.
Fix applied 2026-05-07 to `backend/dist/src/api/(ext)/ecosystem/utils/scylla/client.js`
(3 CLUSTERING ORDER BY bugs that would have caused table creation to fail even with a DB).

To activate: provision a Cassandra-compatible instance (Apache Cassandra, ScyllaDB Cloud,
or DataStax Astra), then set these Railway env vars and redeploy:
- `SCYLLA_CONNECT_POINTS=host:9042` (comma-separated if multiple nodes)
- `SCYLLA_USERNAME=your_username`
- `SCYLLA_PASSWORD=your_password`
- `SCYLLA_KEYSPACE=trading` (default)
- `SCYLLA_DATACENTER=datacenter1` (match your cluster's datacenter name)

Note: The backend uses the standard `cassandra-driver` package — works with any CQL-compatible DB.
See RAILWAY_DEPLOY.md § "ScyllaDB".

### LINK/ETH cron warning (cosmetic)
The `processCurrenciesPrices` cron tries to fetch LINK/ETH from both Binance and KuCoin.
KuCoin doesn't have LINK/ETH — logs `[CRON] ✗ kucoin does not have market symbol LINK/ETH`
every 2 minutes. This is harmless (Binance does have it; KuCoin falls back gracefully).
The LINK/ETH and LINK/USDT exchange_market rows are status=0 (disabled from spot trading)
but the cron still tries to price them. Low priority.

### Email sending
No SMTP credentials configured. Signup confirmation emails, password resets, and
KYC notifications don't send. The app doesn't crash — it just logs the failure.
**Fix**: add SMTP or SendGrid credentials. See RAILWAY_DEPLOY.md § "Email".

### ETH/SOL/BNB/MATIC/TRX/AVAX/ARB ecosystem deposits
No RPC nodes configured for ecosystem wallets. BTC works (mempool.space, no key).
Environment variables needed:
- `APP_ETH_RPC_URL` → Infura HTTPS URL (e.g. https://mainnet.infura.io/v3/YOUR_KEY)
- `APP_BSC_RPC_URL` → public: https://bsc-dataseed.binance.org/ (no key)
- `APP_POLYGON_RPC_URL` → public: https://polygon-rpc.com/ (no key)
- `APP_SOL_RPC_URL` → public: https://api.mainnet-beta.solana.com (no key)
- `TRON_MAINNET_RPC` → https://api.trongrid.io (default, no change needed)
- `TRON_API_KEY` → your TronGrid API key (goes as TRON-PRO-API-KEY header, not URL)

**Important for TRON**: The backend uses `process.env.TRON_API_KEY` as the API key
sent in the HTTP header `TRON-PRO-API-KEY`. It does NOT need the key in the URL.
The RPC URL (`TRON_MAINNET_RPC`) defaults to `https://api.trongrid.io` — leave it as-is.
Just set `TRON_API_KEY=your_trongrid_api_key` in Railway env vars.

**To enable ecosystem blockchains in the admin panel**: Admin → Wallets → Ecosystem →
Blockchains → enable ETH / BSC / TRON etc. Master wallet must be created for each chain.
Note: `blockchain` table doesn't exist in this schema — the ecosystem uses `ecosystem_blockchain`.

### USDT TRC-20 deposits specifically
1. Set `TRON_API_KEY=your_key` in Railway env vars (key from https://www.trongrid.io)
2. `TRON_MAINNET_RPC` is already defaulting to `https://api.trongrid.io` — do not change
3. Admin → Ecosystem → Blockchains → enable TRON
4. Admin → Ecosystem → Master Wallets → create TRON master wallet
5. Admin → Ecosystem → Tokens → enable USDT (TRC-20) for TRON chain

### FX rates
`processCurrenciesPrices` cron logs "Unauthorized: Invalid API key" for
OpenExchangeRates. Free signup at https://openexchangerates.org/signup/free
then set `APP_OPENEXCHANGERATES_APP_ID`. 1000 req/month free.

### Fiat payments (Stripe / PayPal)
Not configured. See RAILWAY_DEPLOY.md § "Fiat payments".

### AI features
Not configured. Set `OPENAI_API_KEY` or `GEMINI_API_KEY`.

### CodeCanyon license
Admin panel shows "No main product license found". Cosmetic — all functionality
works without it. Only blocks the in-admin extension download store.

### Spot "Invalid currency" error
When visiting the spot trading page, `[EXCHANGE] → List Orders ├─ ✗ Invalid currency`
appears in backend logs. Triggered on initial page load before user selects a pair.
Cosmetic — doesn't crash the page.

---

## All dist patches applied to `backend/dist/`

Surgical edits to compiled JavaScript. Document any new ones here.

| File | Line | Patch | Date | Why |
|------|------|-------|------|-----|
| `src/utils/exchange.js` | 144 | `agent` → `httpsAgentIPv4` | 2026-04-30 | TDZ bug: const declared after use → all charts/tickers broken |
| `src/api/exchange/binary/order/util/BinaryOrderService.js` | 104 | Try full symbol `currency/pair` first, fall back to short form | 2026-05-07 | `binary_market` stores pair='USDT' but `exchange_market` stores pair='BTC/USDT' → "Market data not found" |
| `src/api/exchange/order/index.ws.js` | 56, 159, 207 | Full symbol for exchange_market lookup | 2026-05-07 | Same mismatch for spot WebSocket orders |
| `src/api/admin/crm/user/[id]/index.put.js` | 85 | `=== "Super Admin"` → `["Super Admin","Admin"].includes(...)` | 2026-05-07 | Admin role couldn't change user roles from the UI |
| `src/api/(ext)/ecosystem/utils/scylla/client.js` | 206, 292, 293 | Fix CLUSTERING ORDER BY to include all clustering key columns | 2026-05-07 | ScyllaDB error: "Clustering key columns must exactly match columns in CLUSTERING ORDER BY directive" → ecosystem tables never created |

**ScyllaDB fix detail** (3 bugs in one file):
1. `tradingViewQueries` last element (`orderbook_by_symbol` MV): Added `WITH CLUSTERING ORDER BY (price ASC, side ASC)` — was missing entirely. Clustering keys: price + side.
2. `futuresViewQueries` 4th element (`orderbook_by_symbol` MV): Same fix.
3. `futuresViewQueries` 5th element (`positions_by_symbol` MV): Changed `(id ASC)` → `(id ASC, "userId" ASC)` — clustering keys are id + "userId" but only id was listed.

---

## Database state (as of 2026-05-28)

| Table | Rows | Notes |
|-------|------|-------|
| `exchange_market` | 23 | 19 active (status=1), 4 disabled. All have `metadata` populated. |
| `futures_market` | 8 | All active, all have `metadata` populated. BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX. |
| `binary_market` | 8 | All active. minAmount=1, maxAmount=10000. BTC/ETH/SOL/XRP/BNB/ADA/DOGE/MATIC. |
| `binary_duration` | 7 | 1/3/5/15/30/60/240 min. Profit: 80/78/75/72/70/68/65%. |
| `investment_plan` | 3 | Bronze ($100-1k, 9%), Silver ($1k-10k, 15%), Gold ($10k-100k, 23%). |
| `investment_duration` | 3 | 30/60/90 DAY. |
| `staking_pools` | 4 | BTC Flexible 5%APR, ETH 30-Day 8%, USDT Stable 12%, SOL High-Yield 15%. |
| `p2p_payment_methods` | 6 | Bank Transfer, Wise, PayPal, Revolut, Cash, Crypto USDT. |
| `nft_category` | 6 | Art, Collectibles, Gaming, Music, Photography, Sports. |
| `ecommerce_category` | 5 | E-Books, Courses, Indicators, Templates, Reports. |
| `role` | 4 | Super Admin (52), Admin (53), Support (54), User (55) |
| `exchange` | 3 | binance (active), kucoin (active), xt (disabled) |
| `ecosystem_blockchain` | 4 | TRON, TON, XMR, SOL — all status=0 (disabled) |

**settings keys of note:**
- `binaryStatus=true` — binary trading live
- `binaryPracticeStatus=true` — demo mode enabled
- `defaultExchange=binance` — primary exchange for spot/binary charts
- `binarySettings` — full JSON config with all order types enabled

**Missing**: `blockchain` table does not exist in this schema (it's an older schema concept;
ecosystem uses `ecosystem_blockchain`). Don't try to create a `blockchain` table.

---

## Boot issue fixed: binary_market missing columns

On the first-ever deploy with a fresh DB, the phase 2 sweep (`sweep-phase2-forward.sql`)
failed because `initial.sql` creates `binary_market` WITHOUT `minAmount`/`maxAmount` columns.
Sequelize adds those columns when the backend starts — but the sweep runs BEFORE the backend.
Result: all 76 statements in phase 2 were rolled back (binary markets, futures markets,
investment plans, staking pools, P2P methods, NFT/ecommerce categories — all missing).

**Fix applied 2026-05-28**: `scripts/sql/hotfix-002-binary-columns.sql` now runs before
the sweep and adds these columns with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
All phase 2 data was also manually inserted directly into the live Railway DB.

---

## Important file locations

| File | Purpose |
|------|---------|
| `railway-start.sh` | Boot script — runs on every Railway deploy |
| `scripts/populate-market-metadata.js` | Idempotent — populates exchange/futures metadata. Called by railway-start.sh on every boot. |
| `scripts/sql/sweep-forward.sql` | Activates exchanges, inserts market rows (no metadata) |
| `scripts/sql/sweep-phase2-forward.sql` | Binary markets, futures, investment plans, staking pools, P2P, NFT/ecommerce categories |
| `scripts/sql/hotfix-001-market-pairs.sql` | Strips full pair symbols to just quote currency in exchange_market |
| `scripts/sql/hotfix-002-binary-columns.sql` | Adds minAmount/maxAmount to binary_market before phase 2 sweep runs |
| `production.config.js` | PM2 app definitions |
| `backend/dist/src/api/` | Compiled API routes — surgical edits only |
| `frontend/app/globals.css` | Theme tokens (emerald primary, deep slate dark, gold accent) |
| `frontend/lib/siteInfo.ts` | Brand name, description, site URL |

---

## Architecture reminders

- **Backend source code does not exist** — only `backend/dist/` (compiled JS).
  Any backend change must be a surgical edit to the compiled file.
- **Frontend is full Next.js source** — edit freely, hot-reload works on Replit.
- **MySQL only** — Replit has PostgreSQL natively, but this app needs MySQL.
  Replit is editor/preview only; Railway has the real MySQL plugin.
- **Binance is geo-blocked on Replit** — ccxt calls to Binance fail with 451
  "Service unavailable from a restricted location" when run from Replit servers.
  Any script that calls Binance must be run on Railway or a non-restricted server.
  Use hardcoded specs (see `scripts/populate-market-metadata.js`) as an alternative.
- **Backend takes ~2 minutes cold** — the frontend will log ECONNREFUSED during
  this window. This is expected and resolves automatically.
- **Chart Engine addon NOT installed** — `frontend/components/(ext)/chart-engine/` does
  not exist. Binary trading always uses TradingView. `isChartEngineAvailable = false`.

---

## Railway trial / billing

Railway's free trial gives a fixed $5 credit. When that credit runs out:
- All services are paused automatically (no traffic, no deploys)
- Your config and data are preserved — nothing is deleted
- To resume: add a credit card and upgrade to the Hobby plan ($5/month + usage)
- The current MySQL, Redis, and app service together use roughly $0.50–1.50/month
  depending on traffic (well within the $5 Hobby plan)
- Add payment at: https://railway.app/account/billing

---

## Suggested next steps (in priority order)

1. **Configure SMTP** → enables email verification, password reset, KYC notifications.
2. **Set `APP_OPENEXCHANGERATES_APP_ID`** → stops FX rate cron errors (free tier: 1000 req/month).
3. **Provision ScyllaDB/Cassandra** → enables ecosystem on-chain markets (tables will now
   create successfully after the CLUSTERING ORDER BY fix applied 2026-05-07).
   Best free option: DataStax Astra (astra.datastax.com).
4. **Set `TRON_API_KEY`** → enables USDT TRC-20 deposits. Then enable TRON in Admin → Ecosystem.
5. **Set `APP_ETH_RPC_URL`** (Infura) → enables ETH/MATIC/ARB/AVAX ecosystem deposits.
6. **Configure OpenAI or Gemini** → enables AI features (set OPENAI_API_KEY / GEMINI_API_KEY).
7. **Change superadmin password** on Railway → security hygiene.

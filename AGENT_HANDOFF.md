# DeMourinho Crypto — Agent Handoff Document

Last updated: 2026-05-07

This document is written for the next AI agent picking up this project. Read this
before touching anything. It describes the full current state: what works, what
doesn't, every fix applied, and exactly what to do next.

---

## Railway MySQL connection (direct access)

```
mysql://root:DgepiThwzwHKgQlUWxAwfvEEDyAXRBxf@switchyard.proxy.rlwy.net:46340/railway
```

Node.js connection snippet:
```js
const conn = await mysql.createConnection({
  host: 'switchyard.proxy.rlwy.net', port: 46340,
  user: 'root', password: 'DgepiThwzwHKgQlUWxAwfvEEDyAXRBxf',
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
| `joeshady69@gmail.com` | Admin | Promoted manually 2026-05-07. Can also change user roles. |

Password reset: `UPDATE user SET password=? WHERE email=?` with bcrypt hash, or use admin UI.

---

## Current state: what works

- **Charts**: Live Binance data via ccxt (public mode, no API key). 99–146 candles per request.
- **Spot trading**: 24 pairs active. `exchange_market.metadata` fully populated.
- **Binary options**: 8 markets active. Order placement and resolution work (WIN/LOSS logged).
  Entry price line now drawn on TradingView chart (patch applied 2026-05-07).
- **Futures trading**: 9 markets active (BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX/ARB).
- **BTC deposits**: mempool.space scanner — no key needed.
- **Admin panel**: Super Admin and Admin roles both have full access.
- **Role changes**: Admin can now update user roles from the UI (dist patch applied).
- **Role permissions**: 585 permissions seeded for Super Admin (52) and Admin (53).
  Support (54) has 276 view/access permissions.
- **WebSocket**: ticker, orderbook, trades all subscribing correctly.
- **Binary demo balance**: Now syncs from server on page load if server has a higher balance
  (catches WINs that were processed while WS was disconnected). Patch in `use-binary-store.ts`.

---

## Current state: what doesn't work yet

### Ecosystem trading (on-chain markets)
ScyllaDB is required. The extension boots and tries to create tables, but previously failed
with a clustering key mismatch error. **Fix applied 2026-05-07** in
`backend/dist/src/api/(ext)/ecosystem/utils/scylla/client.js` (3 CLUSTERING ORDER BY bugs).
To activate: provision a ScyllaDB Cloud instance, set `SCYLLA_HOSTS`, `SCYLLA_USERNAME`,
`SCYLLA_PASSWORD`, `SCYLLA_KEYSPACE=bicrypto` in Railway → redeploy.
See RAILWAY_DEPLOY.md § "ScyllaDB".

### Binary order WS broadcast
After a binary order resolves (WIN/LOSS), the backend tries to broadcast to
`/api/exchange/binary/order` WebSocket route. If the client has disconnected (navigated
away or network blip), the broadcast logs "No clients connected" and the frontend doesn't
get notified in real-time.
- **Partial fix applied**: `fetchWalletData` in `use-binary-store.ts` now syncs
  `demoBalance` from server if server wallet has more (WIN was credited to DB even if WS failed).
- **Remaining gap**: real-time balance popup won't appear. User must navigate away and back
  (or switch trading mode) to trigger `fetchWalletData` and see the updated balance.
- **Full fix** would require WS auto-reconnect with order re-subscription on reconnect,
  or server-sent events as fallback.

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
appears in backend logs. This is triggered when the orders list endpoint is called
with an empty or invalid currency parameter (likely on initial page load before the
user has selected a trading pair). This is likely cosmetic (doesn't crash the page)
but warrants further investigation. The endpoint is `GET /api/exchange/order` and
the currency validation happens in `backend/dist/src/api/exchange/order/index.get.js`.

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

## Frontend patches applied

| File | Change | Date | Why |
|------|--------|------|-----|
| `frontend/store/trade/use-binary-store.ts` | `fetchWalletData`: also sync `demoBalance` from server in demo mode when server balance > local | 2026-05-07 | WS broadcast fails after binary WIN → local demoBalance stuck at wrong value; server SPOT USDT wallet IS credited even for demo orders |
| `frontend/components/blocks/tradingview-chart/index.tsx` | Added `useEffect` to call `chart.createOrderLine()` for each PENDING binary order | 2026-05-07 | TradingView chart (default binary chart) didn't draw entry price lines; Chart Engine addon is not installed so TradingView is always used |

---

## Database state (as of 2026-05-07)

| Table | Rows | Notes |
|-------|------|-------|
| `exchange_market` | 24 | All have `metadata` populated |
| `futures_market` | 9 | All have `metadata` populated. ARB added 2026-05-07. |
| `binary_market` | 8 | minAmount=1, maxAmount=10000 for all |
| `role` | 4 | Super Admin (52), Admin (53), Support (54), User (55) |
| `role_permission` | 1446 | Seeded 2026-05-07: 585 for SA, 585 for Admin, 276 for Support |
| `permission` | 585 | All platform permissions |
| `wallet` (SPOT USDT) | 2 | Created 2026-05-07 for superadmin and joeshady69, balance=10000 each |
| `ecosystem_blockchain` | 4 | TRON, TON, XMR, SOL — all status=0 (disabled) |
| `ecosystem_token` | 1000s | All status=0; enable per-chain via admin panel |

**Missing**: `blockchain` table does not exist in this schema (it's an older schema concept;
ecosystem uses `ecosystem_blockchain`). Don't try to create a `blockchain` table.

---

## Important file locations

| File | Purpose |
|------|---------|
| `railway-start.sh` | Boot script — runs on every Railway deploy |
| `scripts/populate-market-metadata.js` | Idempotent — populates exchange/futures metadata. Called by railway-start.sh on every boot. |
| `scripts/sql/sweep-forward.sql` | Activates exchanges, inserts market rows (no metadata) |
| `scripts/sql/sweep-phase2-forward.sql` | Investment plans, staking pools, P2P settings |
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
- **Backend takes ~8 minutes cold** — the frontend will log ECONNREFUSED during
  this window. This is expected and resolves automatically.
- **Chart Engine addon NOT installed** — `frontend/components/(ext)/chart-engine/` does
  not exist. Binary trading always uses TradingView. `isChartEngineAvailable = false`.
  Entry price lines are now handled by the TradingView patch above.

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

1. **Set `TRON_API_KEY`** in Railway env vars → enables USDT TRC-20 deposits (user asked).
   Then enable TRON blockchain in Admin → Ecosystem → Blockchains.
2. **Set `APP_ETH_RPC_URL`** (Infura) → enables ETH/MATIC/ARB/AVAX ecosystem deposits.
3. **Configure SMTP** → enables email verification, password reset, KYC notifications.
4. **Configure OpenExchangeRates** (`APP_OPENEXCHANGERATES_APP_ID`) → stops FX rate errors.
5. **Provision ScyllaDB** → enables ecosystem on-chain markets extension (tables will now
   create successfully after the CLUSTERING ORDER BY fix applied 2026-05-07).
6. **Investigate spot "Invalid currency"** → find and fix the empty currency parameter
   on initial spot page load (see `backend/dist/src/api/exchange/order/index.get.js`).
7. **Binary WS reconnect** → implement WS auto-reconnect in `use-binary-store.ts`
   `initOrderWebSocket` so balance updates in real-time even after network blips.
8. **Change superadmin password** on Railway → security hygiene.

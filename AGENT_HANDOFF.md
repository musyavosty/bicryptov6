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
| `joeshady69@gmail.com` | Admin | Promoted manually 2026-05-07. Can also change user roles now. |
| All others | User | Regular users. |

---

## Current state: what works

- **Charts**: Live Binance data via ccxt (public mode, no API key). 99–146 candles per request.
- **Spot trading**: 24 pairs active. `exchange_market.metadata` is now fully populated.
- **Binary options**: 8 markets active (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, MATIC).
  Order placement should work — metadata populated, pair format patched.
- **Futures trading**: 9 markets active (BTC, ETH, SOL, XRP, BNB, MATIC, DOGE, AVAX, ARB).
  ARB was added 2026-05-07. All have metadata.
- **BTC deposits**: mempool.space scanner running — no key needed.
- **Admin panel**: accessible to Super Admin and Admin roles.
- **Role changes**: Super Admin and Admin can both update user roles from the UI.
- **Role permissions**: All 585 permissions seeded for Super Admin (52) and Admin (53).
  Support (54) has 276 view/access permissions.
- **WebSocket**: ticker, orderbook, trades all subscribing correctly.
- **Backend startup**: ~8 minutes cold (schema is large). Normal.

---

## Current state: what doesn't work yet

### Ecosystem trading (on-chain markets)
ScyllaDB is required. The extension boots and tries to create tables, fails with
a clustering key mismatch error. **Fix**: provision a ScyllaDB Cloud instance,
set `SCYLLA_HOSTS`, `SCYLLA_USERNAME`, `SCYLLA_PASSWORD`, `SCYLLA_KEYSPACE=bicrypto`
in Railway → redeploy. See RAILWAY_DEPLOY.md § "ScyllaDB".

### Email sending
No SMTP credentials configured. Signup confirmation emails, password resets, and
KYC notifications don't send. The app doesn't crash — it just logs the failure.
**Fix**: add SMTP or SendGrid credentials. See RAILWAY_DEPLOY.md § "Email".

### ETH/SOL/BNB/MATIC/TRX/AVAX/ARB deposits
No RPC nodes configured. BTC works (mempool.space, no key). All other chains
need an RPC URL. The easiest path:
- ETH/MATIC/ARB/AVAX: Infura free tier (https://infura.io)
- SOL/BNB: public RPCs (no key needed, already listed in RAILWAY_DEPLOY.md)
- TRX (for USDT TRC-20): TronGrid free (https://www.trongrid.io)
**Fix**: see RAILWAY_DEPLOY.md § "Credential acquisition guide".

### USDT TRC-20 deposits specifically
User asked about this. Steps:
1. `TRON_RPC_URL=https://api.trongrid.io` in Railway variables
2. Redeploy
3. Admin → Wallets → Blockchains → enable TRON
4. Admin → Wallets → Tokens → USDT → TRC-20 should appear
Full details in RAILWAY_DEPLOY.md § "USDT TRC-20 deposit flow".

### FX rates
`processCurrenciesPrices` cron logs "Unauthorized: Invalid API key" for
OpenExchangeRates. Free signup at https://openexchangerates.org/signup/free
then set `APP_OPENEXCHANGERATES_APP_ID`. 1000 req/month free.

### Fiat payments (Stripe / PayPal)
Not configured. See RAILWAY_DEPLOY.md § "Fiat payments".

### AI features
Not configured. Set `OPENAI_API_KEY` or `GEMINI_API_KEY`.

### CodeCanyon license
Admin panel shows "No main product license found". Cosmetic. All functionality
works without it. It only blocks the in-admin extension download store.

---

## All dist patches applied to `backend/dist/`

These are surgical edits to compiled JavaScript. Document any new ones here.

| File | Line | Patch | Date | Why |
|------|------|-------|------|-----|
| `src/utils/exchange.js` | 144 | `agent` → `httpsAgentIPv4` | 2026-04-30 | TDZ bug: const declared after use in public-mode branch → all charts/tickers broken |
| `src/api/exchange/binary/order/util/BinaryOrderService.js` | 104 | Try full symbol `currency/pair` first, fall back to short form | 2026-05-07 | `binary_market` stores pair='USDT' but `exchange_market` stores pair='BTC/USDT' → "Market data not found" on all binary orders |
| `src/api/exchange/order/index.ws.js` | 56, 159, 207 | Full symbol for exchange_market lookup | 2026-05-07 | Same mismatch for spot WebSocket orders |
| `src/api/admin/crm/user/[id]/index.put.js` | 85 | `=== "Super Admin"` → `["Super Admin", "Admin"].includes(...)` | 2026-05-07 | Admin role could not change user roles from the UI |

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
| `user` | 11 | See "User accounts" table above |

---

## Important file locations

| File | Purpose |
|------|---------|
| `railway-start.sh` | Boot script — runs on every Railway deploy |
| `scripts/populate-market-metadata.js` | Idempotent — populates exchange/futures metadata. Called by railway-start.sh on every boot. |
| `scripts/sql/sweep-forward.sql` | Activates exchanges, inserts market rows (no metadata) |
| `scripts/sql/sweep-phase2-forward.sql` | Investment plans, staking pools, P2P settings |
| `scripts/sql/hotfix-001-market-pairs.sql` | Fixes legacy market pair format entries |
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

---

## Suggested next steps (in priority order)

1. **Configure RPC nodes** → enables ETH/SOL/BNB/MATIC deposits. Infura free
   tier covers ETH/MATIC/ARB/AVAX in one signup. BNB/SOL need no key.
2. **Configure TRON RPC** → enables USDT TRC-20 deposits (user specifically asked)
3. **Configure SMTP** → enables email verification, password reset, KYC notifications
4. **Configure OpenExchangeRates** → stops FX rate cron from logging errors
5. **Configure Stripe/PayPal** → enables fiat deposits/withdrawals
6. **Provision ScyllaDB** → enables ecosystem on-chain markets extension
7. **Change superadmin password** on Railway → security hygiene
8. **Push changes to GitHub** if not already done via the API token

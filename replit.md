# DeMourinho Crypto — Project Overview

## What this project is

**DeMourinho Crypto** is a rebranded fork of Bicrypto v6.3.0 — a full-stack
cryptocurrency exchange platform. Stack: **Next.js 16 frontend** (full source) +
**compiled Node.js backend** (`backend/dist/` only, no TypeScript source) +
**MySQL 8** (160-table schema, `initial.sql`).

## Directory layout

```
backend/             Compiled Node.js API (dist/), Sequelize models, seeders.
frontend/            Next.js 16 app (full source). Tailwind + Radix UI.
scripts/             Boot and utility scripts.
  populate-market-metadata.js  Populates exchange/futures market metadata on boot.
  import-sql.js      Imports SQL files with sql_mode relaxation.
  replit-dev-env.js  Writes demo .env for Replit dev preview.
  stub-backend.js    Minimal mock backend for Replit preview (port 4000).
  sql/               Data sweep SQL files (sweep-forward.sql, etc.)
initial.sql          160-table MySQL schema.
database_export.sql.gz  Larger seeded dump (alternative to initial.sql).
railway-start.sh     Boot script for Railway (maps env vars, imports schema,
                     runs seeders, populates metadata, starts PM2).
production.config.js PM2 app definitions (backend + frontend).
railway.json         Railway build/start config.
nixpacks.toml        Node 22 + pnpm + MySQL client for Railway.
RAILWAY_DEPLOY.md    Full Railway deployment guide.
AGENT_HANDOFF.md     State + context doc for the next AI agent.
```

## How we run it

### On Replit (editor / preview only)

- **Frontend** runs as the `Frontend` workflow on port **5000** (Next.js dev server).
- **Stub backend** (`scripts/stub-backend.js`) on port 4000 — returns minimal JSON
  so the frontend doesn't spam connection-refused. No real functionality.
- Home page shows a loading spinner because it waits for real backend data.
  This is **expected** on Replit; the full experience lives on Railway.

### On Railway (the live demo)

See `RAILWAY_DEPLOY.md` for the step-by-step guide.

- `railway-start.sh` runs on boot: maps env vars → waits for MySQL → imports
  schema if empty → runs seeders → populates metadata → starts PM2.
- Backend on port 4000, frontend on `$PORT` (Railway-injected).
- Default superadmin: `superadmin@example.com` / `12345678`.

## What works out of the box (no extra keys)

- Login / signup / 2FA
- Admin panel (super admin + admin roles)
- Live BTC/ETH/etc. charts and prices via Binance public API (ccxt, no key)
- Binary option order placement (8 markets: BTC/ETH/SOL/XRP/BNB/ADA/DOGE/MATIC)
- 7 trade durations: 1/3/5/15/30/60/240 minutes; profit 65–80%
- Spot trading (19 active pairs)
- Futures trading (8 markets: BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX)
- Wallet UI (balances, deposit addresses — BTC deposits via mempool.space)
- Investment plans: Bronze / Silver / Gold
- Staking pools: BTC / ETH / USDT / SOL
- P2P trading with 6 global payment methods
- NFT marketplace (6 categories), ecommerce (5 categories)
- Multi-language (12 languages), dark/light themes
- Role-based access (Super Admin, Admin, Support, User)

## What needs credentials to work

See `AGENT_HANDOFF.md` for the full list.

Key items: SMTP (email), RPC nodes (ETH/SOL/etc deposits), Stripe/PayPal (fiat),
OpenExchangeRates (FX rates), ScyllaDB (ecosystem/on-chain markets).

## User preferences

- Wants a working Railway demo; Replit is the editor/preview surface.
- Plain-language explanations over technical jargon.

## Compiled-backend caveat

`backend/dist/` is the only backend that exists. There is **no** TypeScript source
under `src/`. Surgical edits to `backend/dist/` are acceptable when the bug is
precisely understood and the change is small (one line). Document such edits in
`AGENT_HANDOFF.md` under "Dist patches".

## Known dist patches (applied)

| File | Line | What | Why |
|------|------|------|-----|
| `backend/dist/src/utils/exchange.js` | 144 | TDZ bug: replaced bare `agent` with `httpsAgentIPv4` | `const agent` hoisted but used before initialization → all charts/tickers broke |
| `backend/dist/src/api/exchange/binary/order/util/BinaryOrderService.js` | 104 | Use full `currency/pair` symbol for exchange_market lookup | pair='BTC/USDT' vs pair='USDT' mismatch caused "Market data not found" on all binary orders |
| `backend/dist/src/api/exchange/order/index.ws.js` | 56, 159, 207 | Same symbol lookup fix for spot WebSocket orders | Same mismatch — "Market data not found" on spot orders |
| `backend/dist/src/api/admin/crm/user/[id]/index.put.js` | 85 | Allow Admin (not just Super Admin) to update user roleId | Admin role couldn't change user roles from the UI |
| `backend/dist/src/api/(ext)/ecosystem/utils/scylla/client.js` | 209,292,293,297 | Fix CLUSTERING ORDER BY in 3 materialized views (orderbook_by_symbol ×2, positions_by_symbol) | ScyllaDB requires all clustering key columns in CLUSTERING ORDER BY — missing columns caused ecosystem table creation to fail on every boot |

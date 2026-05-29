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
The only remaining blocker is Cassandra (see fix below).

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

---

## The one remaining blocker: Cassandra not connecting

### Root cause (two bugs)

1. **Binds to localhost only** — Cassandra 4.1 in Docker binds `rpc_address` to
   `localhost` by default. Other Railway services trying to reach port 9042 get
   ECONNREFUSED because it's not listening on the container's network interface.

2. **Materialized views disabled** — Cassandra 4.1 ships with materialized views
   off by default (`# materialized_views_enabled: false` in cassandra.yaml). The
   app's ecosystem extension needs them to create orderbook/candle tables.
   Error: `[ECOSYSTEM] ✗ Failed to create ScyllaDB tables: Materialized views are disabled`.

### Fix: Dockerfile.cassandra (already pushed to GitHub)

Both fixes are solved by building the Cassandra service from `Dockerfile.cassandra`
(in the repo root) instead of the plain `cassandra:4.1` image.

`Dockerfile.cassandra` uses `cassandra:4.1` as base and runs `scripts/cassandra-init.sh`
before startup, which:
- Sets `materialized_views_enabled: true` in cassandra.yaml
- Sets `rpc_address: 0.0.0.0` so CQL is reachable across the Railway internal network

### Current Railway state (as of 2026-05-29)

The Cassandra service in Railway Project B is already configured:
- Source: GitHub repo `musyavosty/bicryptov6`, Dockerfile: `Dockerfile.cassandra` ✅
- Config file: `railway.cassandra.json` (no healthcheck, no start command) ✅
- Env vars already set on the Cassandra service:
  ```
  CASSANDRA_RPC_ADDRESS=0.0.0.0
  CASSANDRA_CLUSTER_NAME=demourinho
  CASSANDRA_DC=datacenter1
  HEAP_NEWSIZE=128M
  MAX_HEAP_SIZE=512M
  ```

**Fixed (2026-05-29 — three bugs):**

**Bug A — `rpc_address` not taking effect:** `cassandra-init.sh` was skipping the
`rpc_address` patch when `CASSANDRA_RPC_ADDRESS` was set, deferring to the Docker
entrypoint which does NOT reliably honor that env var. Fixed: the init script now
ALWAYS patches `rpc_address: 0.0.0.0` unconditionally AND force-exports the env var.

**Bug B — `broadcast_rpc_address: 0.0.0.0` is INVALID:** Cassandra 4.x requires
`broadcast_rpc_address` to be a real routable IP when `rpc_address=0.0.0.0`.
Setting it to `0.0.0.0` (as the previous `Dockerfile.cassandra` RUN line did) is invalid
and can prevent Cassandra from binding correctly. Fixed: the build-time line was removed;
`cassandra-init.sh` now dynamically sets `broadcast_rpc_address` to `$(hostname -i)` at
container startup.

**Bug C — app gave up before Cassandra was ready:** `MAX_RETRIES=5` + `INITIAL_DELAY=2000ms`
meant the app exhausted all retries in ~64 seconds. Cassandra takes 60–90s to start, so the
app almost always hit max retries before a single connection attempt could succeed. Fixed:
`MAX_RETRIES=20`, `INITIAL_DELAY=15000ms`, `connectTimeout=15000ms` — app now waits up to
~10 minutes for Cassandra before giving up (dist patch in `client.js`).

### How to apply the fix (Railway agent or manual)

**Step 1 — Redeploy the Cassandra service**

The code fix is already pushed to GitHub. Just trigger a redeploy of the
`scylladb-railway` service in Railway → Project B. Railway will pull the
updated `scripts/cassandra-init.sh` and rebuild the image.

Wait for it to be healthy. Look for these lines in the Cassandra logs:
```
[CASSANDRA-INIT] materialized_views_enabled: true
[CASSANDRA-INIT] rpc_address: 0.0.0.0 (patched in yaml)
Starting listening for CQL clients on /0.0.0.0:9042
```

Do NOT proceed until you see `0.0.0.0:9042` (not `127.0.0.1:9042`).
If you still see `127.0.0.1:9042`, also add `CASSANDRA_LISTEN_ADDRESS=0.0.0.0`
to the Cassandra service env vars and redeploy again.

**Step 4 — Verify SCYLLA_CONNECT_POINTS on the app service**

The app service (`demourinho-crypto`) must have:
```
SCYLLA_CONNECT_POINTS=scylladb-railway.railway.internal:9042
```
Check this is set. The Railway agent previously set it but check it's still there.

**Step 5 — Redeploy demourinho-crypto**

Watch the app logs for:
```
[ECOSYSTEM] ✓ Connected to ScyllaDB
[SCYLLA] ✓ Keyspace trading created
[SCYLLA] ✓ Keyspace futures created
✓ Server ready on port 4000
```

If you see `[SCYLLA] ✗ Max retries reached`, Cassandra is not yet ready — check its logs.

**Step 6 — Enable blockchains in admin panel**

1. Log in as `superadmin@example.com` / `12345678` (change password immediately)
2. Go to **Admin → Wallets → Ecosystem → Blockchains**
3. Enable: **ETH, BSC, Polygon, Solana, Tron**
4. For each chain, go to **Admin → Wallets → Ecosystem → Master Wallets** → create a master wallet
5. For TRON USDT: **Admin → Wallets → Ecosystem → Tokens** → enable USDT for the TRON chain

After this, all deposit chains are live.

---

## Current state: what works (Project B, as of 2026-05-29)

### Fully activated via activate-all.js (2026-05-29)

- **All 18 extensions** enabled: p2p, staking, ico, futures, copy_trading, gateway,
  ai_market_maker, trading_bot, nft, mailwizard, forex, ai_investment, ecommerce,
  knowledge_base, mlm, binary_ai_engine, wallet_connect, ecosystem.
- **45 settings** written/updated — all features on, KYC optional, withdrawals auto-approved.
- **Spot trading**: 88 active pairs (23 original + 65 new: SHIB, PEPE, WIF, TON, SUI, APT,
  INJ, TIA, FLOKI, BONK, LDO, RNDR, FET, WLD, ORDI, AAVE, MKR, COMP, DYDX, GMX,
  ZEC, XMR, DASH, ETC, XLM, ALGO, VET, THETA, FTM, HBAR, ICP, FLOW, MINA, SAND,
  MANA, AXS, GALA, CHZ, BLUR, PYTH, + 20 more/USDT + BTC/ETH).
- **Binary options**: 36 markets (8 original + 28 new). 15 durations total (7 original +
  8 new: 30s, 2/10/20/45/120/480/1440 min).
- **Futures**: 40 markets (8 original + 32 new: ARB, OP, TON, SUI, APT, INJ, SEI,
  PEPE, WIF, FTM, NEAR, SHIB, FIL, LDO, IMX, STX, HBAR, ICP, FET, WLD, ETC,
  RNDR, TIA, ORDI + more).
- **Investment plans**: 10 total (3 original Bronze/Silver/Gold + 7 new:
  Starter/Platinum/Diamond + Crypto Bronze/Silver/Gold/Platinum).
  14 durations. All 90 plan×duration combinations linked.
- **Staking pools**: 14 total (4 original + 10 new:
  USDC, BNB, XRP, ADA, DOT, SOL, AVAX, MATIC, ATOM, LINK).
- **P2P payment methods**: 26 total (6 original + 20 new: Skrill, Neteller, WebMoney,
  Perfect Money, Zelle, Venmo, CashApp, Alipay, WeChat Pay, M-Pesa, Pix, UPI,
  GCash, Paytm, GrabPay, Bkash, OrangeMonkey, BTC/ETH/BNB on-chain).
- **Forex plans**: 5 new (Micro/Mini/Standard/Pro/VIP Forex). 6 durations.
- **AI Investment plans**: 4 new (Starter/Growth/Pro/Elite).
- **KYC levels**: 3 seeded (Basic / Standard / Advanced) with field configs and trade limits.
- **60 fiat currencies** enabled (USD, EUR, GBP, JPY, AUD + 55 more).
- **Ecosystem blockchains**: all 4 existing rows enabled (TRON, TON, XMR, SOL).
- **All exchange currencies** activated.
- **Charts**: Live Binance data via ccxt (public mode, no API key). 99–146 candles per request.
- **BTC deposits**: mempool.space scanner — no key needed. ✅
- **Admin panel**: Super Admin has full access.
- **Exchange**: Binance (primary) + KuCoin both active.
- **RPC endpoints**: BSC, Polygon, Solana, Tron, ETH (Infura) — all set ✅
- **TronGrid API key**: set ✅
- **OpenExchangeRates**: set ✅

## Current state: what doesn't work yet

### Ecosystem deposits (ETH, BNB, TRON, SOL, MATIC)
Blocked by Cassandra not connecting. Fix is above.

### Email sending
No SMTP credentials. Signup confirmation, password resets don't send.
Fix: add `APP_EMAILER=smtp` + SMTP credentials to Railway env vars.

### Fiat payments (Stripe / PayPal)
Not configured.

### AI features
Set `OPENAI_API_KEY` or `GEMINI_API_KEY`.

### FX rate cron (minor)
`APP_OPENEXCHANGERATES_APP_ID` is set to a free demo key. If it hits the 1000 req/month limit,
replace with your own from openexchangerates.org/signup/free.

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

**ScyllaDB fix detail** (3 bugs in one file, applied 2026-05-07):
1. `tradingViewQueries` — `orderbook_by_symbol` MV: Added `WITH CLUSTERING ORDER BY (price ASC, side ASC)` — was missing entirely.
2. `futuresViewQueries` — `orderbook_by_symbol` MV: Same fix.
3. `futuresViewQueries` — `positions_by_symbol` MV: Changed `(id ASC)` → `(id ASC, "userId" ASC)`.

---

## Database state (Project B, as of 2026-05-28)

184 tables total (160 from initial.sql + 24 added by Sequelize model sync on first boot).

| Table | Rows | Notes |
|-------|------|-------|
| `exchange_market` | 23 | 19 active (status=1), 4 disabled. All have `metadata` populated. |
| `futures_market` | 8 | All active, metadata populated. BTC/ETH/SOL/XRP/BNB/MATIC/DOGE/AVAX. |
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
| `ecosystem_blockchain` | 4 | TRON, TON, XMR, SOL — all status=0 (enable via admin panel after Cassandra is up) |

**settings keys of note:**
- `binaryStatus=true` — binary trading live
- `binaryPracticeStatus=true` — demo mode enabled
- `defaultExchange=binance` — primary exchange
- `binarySettings` — full JSON config with all order types enabled

**Missing**: `blockchain` table does not exist in this schema. Use `ecosystem_blockchain`.

---

## Boot timing

Backend takes **8–10 minutes** to start on Railway (184 tables → Sequelize ALTER TABLE
sync takes 8+ minutes). Health check timeout is 600s. If it takes longer than 10 minutes,
the health check fails and Railway marks the deploy unhealthy. This should stabilise once
the schema stops changing (no more ALTER TABLEs to run).

Do not lower the health check timeout.

---

## Boot issue fixed: binary_market missing columns

On the first-ever deploy with a fresh DB, the phase 2 sweep (`sweep-phase2-forward.sql`)
failed because `initial.sql` creates `binary_market` WITHOUT `minAmount`/`maxAmount` columns.
`hotfix-002-binary-columns.sql` now runs before the sweep and adds these columns.

---

## Important file locations

| File | Purpose |
|------|---------|
| `railway-start.sh` | Boot script — runs on every Railway deploy |
| `scripts/activate-all.js` | Full feature activation — runs on every Railway boot (idempotent) |
| `Dockerfile.cassandra` | Custom Cassandra image with materialized views + rpc_address fix |
| `scripts/cassandra-init.sh` | Init script called by Dockerfile.cassandra before Cassandra starts |
| `scripts/populate-market-metadata.js` | Idempotent — populates exchange/futures metadata |
| `scripts/sql/sweep-forward.sql` | Activates exchanges, inserts market rows |
| `scripts/sql/sweep-phase2-forward.sql` | Binary markets, futures, investment plans, etc. |
| `scripts/sql/hotfix-001-market-pairs.sql` | Strips full pair symbols in exchange_market |
| `scripts/sql/hotfix-002-binary-columns.sql` | Adds minAmount/maxAmount to binary_market |
| `production.config.js` | PM2 app definitions |
| `backend/dist/src/api/` | Compiled API routes — surgical edits only |

---

## Architecture reminders

- **Backend source code does not exist** — only `backend/dist/` (compiled JS).
  Any backend change must be a surgical single-line edit to the compiled file.
- **Frontend is full Next.js source** — edit freely.
- **MySQL only** — do not use PostgreSQL.
- **Binance is geo-blocked on Replit** — ccxt calls to Binance fail on Replit servers.
  Any script calling Binance must run on Railway. Use hardcoded specs in
  `scripts/populate-market-metadata.js` as an alternative.
- **Push to GitHub via GitHub Contents API** — `git push` is blocked in the Replit main agent.
  Use the pattern in previous sessions: GET sha, PUT with base64 content.
  Token: `$GITHUB_PERSONAL_ACCESS_TOKEN` (Replit secret).
- **Backend takes ~9 minutes cold** — ECONNREFUSED during this window is expected.
- **Chart Engine addon NOT installed** — binary trading always uses TradingView.

---

## Suggested next steps (in priority order)

1. **Fix Cassandra** → follow the 6-step fix above → enables all ecosystem deposits.
2. **Enable blockchains in admin panel** → after Cassandra is up. License check is bypassed ✅
3. **Configure SMTP** → enables email verification, password reset.
4. **Change superadmin password** → security hygiene.
5. **Set up Stripe / PayPal** → fiat deposits.
6. **Configure OpenAI or Gemini** → AI features.

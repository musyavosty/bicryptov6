# DeMourinho Crypto (Bicrypto fork) on Replit + Railway

## What this project is

**DeMourinho Crypto** is a rebranded fork of Bicrypto v6.3.0 — a full
cryptocurrency exchange platform (frontend + backend + 160-table MySQL
schema). The backend is **shipped as compiled JavaScript** (no TypeScript
source for the `src/` folder); the frontend is full Next.js source.

Brand assets live in env vars (`NEXT_PUBLIC_SITE_NAME`,
`NEXT_PUBLIC_SITE_DESCRIPTION`) and in `frontend/app/globals.css` (emerald
primary + deep slate dark mode + gold accent).

Pre-existing layout:

```
backend/             Compiled Node.js API (dist/), Sequelize models,
                     seeders, jest tests. Source for src/ is NOT included.
frontend/            Next.js 16 app (full source). Tailwind + Radix UI.
initial.sql          160-table MySQL schema (clean install).
database_export.sql.gz  Bigger seeded dump (alternative to initial.sql).
production.config.js PM2 process definitions for backend + frontend.
HOW TO INSTALL/      Original VPS install docs (kept for reference).
```

## How we run it

### On Replit (development / preview only)

The backend can't fully run on Replit because Bicrypto needs MySQL and
Replit only hosts PostgreSQL natively. So the Replit setup is:

- **Frontend** runs as the `Frontend` workflow on port **5000** (Next.js
  dev server, `pnpm exec next dev`). Visible in the preview iframe.
- **Stub backend** (`scripts/stub-backend.js`) runs on port 4000 in the
  same workflow process. It returns minimal JSON responses to keep the
  frontend from spamming connection-refused errors. It is NOT a real
  backend — login, real data, trading, etc. won't work on Replit.

The frontend renders a "Loading" spinner on the home page because the home
view waits for real backend data. This is expected on Replit; the full
experience lives on Railway.

Useful for: **editing code, restyling the UI, hot-reloading components**.

### On Railway (the actual demo target)

See [`RAILWAY_DEPLOY.md`](./RAILWAY_DEPLOY.md) for the full guide.
Summary:

1. Push the repo to GitHub.
2. Railway → New Project from GitHub → adds the Bicrypto service.
3. Add the **MySQL plugin** in the same project.
4. Set env vars (raw editor block in `RAILWAY_DEPLOY.md` § 4).
5. `railway-start.sh` boots the container, waits for MySQL, imports
   `initial.sql` if the DB is empty, runs seeders, then starts both
   processes under PM2.
6. Generate a public domain in **Settings → Networking**.
7. Login with `superadmin@example.com` / `12345678`, change password.

Build files used by Railway:
- `railway.json`     — build/start config.
- `nixpacks.toml`    — Node 22 + pnpm + MySQL client.
- `railway-start.sh` — boot + DB bootstrap + PM2.
- `scripts/import-sql.js` — Node fallback for importing `initial.sql`
  when the `mysql` CLI isn't available.

## What works without extra credentials

After a clean Railway deploy with just the variables from § 4 of the
deploy doc:

- Login / signup / 2FA UI
- Admin panel (super admin auto-seeded)
- Public market data (live BTC/ETH prices, candles, depth) via Binance
  public API through `ccxt` — no API key needed
- Trading UI with moving charts
- Wallet UI (balances 0 — no chain RPCs)
- Multi-language (12 languages), dark/light theming

What needs your own keys later:
- Real fiat (Stripe/PayPal/Paystack)
- Crypto deposits/withdrawals (blockchain RPCs)
- Email (SMTP/SendGrid)
- SMS/OTP (Twilio)
- AI (OpenAI/Gemini/DeepSeek)
- Push (Firebase/VAPID)

## User preferences

- Wants a working Railway demo to unlock VPS funding.
- Replit is the editor / preview surface; Railway is the live demo.
- Plain-language explanations over technical jargon.

## Recent changes (agent log)

- 2026-04-30 (c): **Repo-wide Railway hardening pass.** Six fixes that
  together remove every recurring deploy failure mode:
  1. `frontend/next.config.js` — rewrites for `/api/*`, `/uploads/*`,
     `/img/logo/*` are now active in production too (not dev-only). The
     old comment "no rewrites needed in production" was wrong for any
     PaaS where frontend and backend are two processes on the same host
     (Railway, Render, Fly, Docker). Optional `BACKEND_INTERNAL_URL`
     env var lets you override the default `127.0.0.1:4000`.
  2. `production.config.js` — removed hardcoded `https://mashdiv.com`
     and `Bicrypto` strings. Frontend now binds to `$PORT` (Railway
     injects it), backend to `BACKEND_PORT` (default 4000). All
     `NEXT_PUBLIC_*` values are env-driven with sensible defaults.
  3. `railway-start.sh` — adds Redis env mapping (`REDIS_HOST` from
     `REDISHOST`, etc.) + a loud warning if Redis isn't attached.
     Broadened the env-capture regex to ~25 more integration prefixes
     so adding new exchanges/payment providers doesn't need a code
     change. Added recovery hint when partial schema is detected
     (DB has tables but fewer than 10 → previous import died midway).
     Switched to `node scripts/import-sql.js` unconditionally so the
     `sql_mode=''` relaxation always runs.
  4. `scripts/import-sql.js` — adds `SET SESSION sql_mode=''` at
     session start so a single edge-case statement can't kill a deploy
     even if a future seed dump regresses on strict-mode compliance.
  5. `railway.json` — `healthcheckTimeout` 300 → 600. Cold MySQL
     import + seed legitimately takes >5 min on small Railway plans.
  6. `RAILWAY_DEPLOY.md` — full rewrite. Now documents Redis as a
     required plugin (with explanation of what breaks without it),
     warns explicitly against the two-service split, includes the
     "drop database to recover from partial import" troubleshooting,
     and notes that any `MYSQL_INIT_COMMAND` strict-mode workaround
     left behind by previous agents should be deleted.
- 2026-04-30 (b): Rebranded to **DeMourinho Crypto**. Updated
  `frontend/lib/siteInfo.ts`, `frontend/app/[locale]/layout.tsx`, and
  the four hardcoded fallbacks in `frontend/context/wallet.tsx`,
  `frontend/components/partials/footer/user-footer.tsx`,
  `frontend/app/[locale]/binary/components/header/header.tsx`,
  `frontend/app/[locale]/(dashboard)/admin/page.tsx`. Repainted the
  theme tokens in `frontend/app/globals.css` to an emerald primary + deep
  slate dark mode + gold accent. Removed `.env` from `.gitignore` and
  regenerated it with safe demo values via
  `REPLIT_DEV_OVERWRITE=1 node scripts/replit-dev-env.js`. Improved the
  stub backend to return roles array and settings array shape so the
  frontend stops logging "Invalid roles data" / "Failed to fetch
  settings". Added `LOCAL_SETUP.md` and `RAILWAY_AGENT_PROMPT.md` for
  future AI agents.
- 2026-04-30 (a): Initial setup. Removed 110MB `zipFile.zip`, Windows Node
  binary, and stray sql files. Installed Node 22 + pnpm. Configured
  `Frontend` workflow on port 5000. Added stub backend on port 4000.
  Patched `frontend/next.config.js` to allow `*.replit.dev` and
  `*.up.railway.app` host origins. Wrote `railway.json`,
  `nixpacks.toml`, `railway-start.sh`, `scripts/import-sql.js`,
  `scripts/replit-dev-env.js`, `scripts/stub-backend.js`, and
  `RAILWAY_DEPLOY.md`.

## Compiled-backend caveat

The `backend/dist/` folder is the only backend that exists. There is no
TypeScript source for the backend under `src/`. Surgical edits to
`backend/dist/` are acceptable when the bug is precisely understood and
the change is small (one line). Document such edits here.

### Known dist patches

- **`backend/dist/src/utils/exchange.js` line 144** (patched 2026-04-30):
  TDZ bug — `agent` was declared with `const` at line 157 but referenced
  at line 141 (inside the "no API key → public mode" branch). In JS,
  `const`/`let` declarations are hoisted but not initialized; any access
  before the declaration line throws `Cannot access 'agent' before
  initialization`. Fixed by replacing the bare `agent` reference with
  `httpsAgentIPv4` (the value it would have resolved to in public mode
  anyway since there is no proxy URL in that branch).
  This bug caused: charts blank, exchange tickers never populating Redis,
  all CRON jobs (`processPendingOrders`, `processCurrenciesPrices`) crashing,
  binary trading not loading real-time prices.

## Recent dist patches (agent log continued)

- 2026-05-07 (a): **Binary + spot market-lookup fix + logo WebPs**
  1. `backend/dist/src/api/exchange/binary/order/util/BinaryOrderService.js` line 104 —
     Changed `WHERE { currency, pair }` (pair='USDT') to try `WHERE { currency, pair: 'BTC/USDT' }` first,
     fall back to short form. Root cause: `binary_market` stores pair='USDT' but `exchange_market`
     stores pair='BTC/USDT'; the mismatch caused "Market data not found" on every binary order placement.
  2. `backend/dist/src/api/exchange/order/index.ws.js` — same lookup bug at 3 separate sites
     (lines 56, 159, 207). All now use the full `symbol` string ('BTC/USDT') as the `pair` field
     in the WHERE clause instead of the split short form ('USDT'). Fixes "Market data not found"
     in spot WebSocket order updates.
  3. Created `frontend/public/img/logo/` WebP files: logo.webp, logo-dark.webp, logo-text.webp,
     logo-text-dark.webp, favicon-16x16.webp, favicon-32x32.webp, favicon-96x96.webp,
     apple-icon-180x180.webp, android-chrome-192x192.webp, android-chrome-512x512.webp.
     These are rasterised from the existing SVGs via sharp. Placing them in public/ means
     Next.js serves them directly (public takes priority over rewrites), bypassing the
     Next.js→backend proxy that was crashing with "Parse Error: Expected HTTP/" on 404s.
  - Note: exchange_market.metadata population and demo wallet seeding (USDT/BTC/ETH for both
    users) were done directly on Railway's MySQL by a prior agent session and persist there.

## Secondary issues to fix when possible

- **OpenExchangeRates API key** — `processCurrenciesPrices` cron calls
  OpenExchangeRates for fiat FX rates. Without `APP_OPENEXCHANGERATES_API_KEY`
  it logs `Unauthorized: Invalid API key`. Free tier is 1000 req/month.
  Sign up at https://openexchangerates.org and add the env var on Railway.

- **CodeCanyon license** — admin panel shows "No main product license found".
  This is cosmetic; all installed extensions work without it. It's needed
  only if you want to use the in-admin extension store (download/update add-ons
  direct from Bicrypto's license server).

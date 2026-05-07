# DeMourinho Crypto — Railway Deployment Guide

## Prerequisites

- A [Railway](https://railway.app) account
- This repository pushed to GitHub
- 10–15 minutes for a cold deploy (schema import + seeding)

---

## Step 1 — Create the Railway project

1. Railway → **New Project** → **Deploy from GitHub repo** → select `bicryptov6`
2. Railway automatically detects `railway.json` and `nixpacks.toml` and uses them.

---

## Step 2 — Add plugins

In the same project, click **+ New** → **Database**:

- **MySQL** (required — all app data)
- **Redis** (required — BullMQ queues, cron jobs, rate-limiting; the backend will
  start without it but crons and deposit monitors will fail silently)

Both plugins inject their connection variables automatically. The boot script maps
them onto the names the app expects (`DB_HOST`, `REDIS_HOST`, etc.).

---

## Step 3 — Set environment variables

Go to your service → **Variables** → switch to the raw editor and paste the block
below. Replace every `CHANGE_ME` value before deploying to real users.

```env
# ── App identity ──────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_NAME=DeMourinho Crypto
NEXT_PUBLIC_SITE_DESCRIPTION=DeMourinho Crypto — premium cryptocurrency exchange
NEXT_PUBLIC_DEMO_STATUS=true

# ── JWT / session ─────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=CHANGE_ME_64_hex_chars
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=CHANGE_ME_different_64_hex_chars
JWT_REFRESH_EXPIRY=30d

# ── VAPID (push notifications — optional) ─────────────────────────────────
# Generate: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=CHANGE_ME
VAPID_PRIVATE_KEY=CHANGE_ME

# ── Email (leave blank to disable — signup emails won't send) ─────────────
# Option A: SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=noreply@example.com
# SMTP_PASS=CHANGE_ME
# SMTP_SENDER=noreply@example.com
# Option B: SendGrid
# SENDGRID_API_KEY=CHANGE_ME

# ── FX rates (optional — app works without it, logs warnings) ─────────────
# Free tier: 1000 req/month — https://openexchangerates.org/signup/free
# APP_OPENEXCHANGERATES_APP_ID=CHANGE_ME

# ── Stripe (fiat deposits — optional) ────────────────────────────────────
# STRIPE_SECRET_KEY=CHANGE_ME
# STRIPE_WEBHOOK_SECRET=CHANGE_ME
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=CHANGE_ME

# ── PayPal (fiat deposits — optional) ────────────────────────────────────
# PAYPAL_CLIENT_ID=CHANGE_ME
# PAYPAL_CLIENT_SECRET=CHANGE_ME

# ── Blockchain RPC nodes (crypto deposits/withdrawals — optional) ─────────
# Without these, only BTC deposits (via mempool.space) work.
# ETH_RPC_URL=https://mainnet.infura.io/v3/CHANGE_ME
# SOL_RPC_URL=https://api.mainnet-beta.solana.com
# BNB_RPC_URL=https://bsc-dataseed.binance.org
# MATIC_RPC_URL=https://polygon-rpc.com
# TRON_RPC_URL=https://api.trongrid.io
# AVAX_RPC_URL=https://api.avax.network/ext/bc/C/rpc
# ARB_RPC_URL=https://arb1.arbitrum.io/rpc

# ── ScyllaDB (ecosystem/on-chain markets — optional) ─────────────────────
# SCYLLA_HOSTS=CHANGE_ME
# SCYLLA_KEYSPACE=bicrypto
# SCYLLA_USERNAME=CHANGE_ME
# SCYLLA_PASSWORD=CHANGE_ME

# ── AI features (optional) ────────────────────────────────────────────────
# OPENAI_API_KEY=CHANGE_ME
# GEMINI_API_KEY=CHANGE_ME

# ── Google OAuth (optional) ───────────────────────────────────────────────
# GOOGLE_CLIENT_ID=CHANGE_ME
# GOOGLE_CLIENT_SECRET=CHANGE_ME
```

**Do NOT** set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`REDIS_HOST`, `REDIS_PORT`, or `REDIS_PASSWORD` manually — Railway injects these
automatically from the plugins. The boot script maps them.

---

## Step 4 — Deploy

Click **Deploy** (or push to your GitHub branch). Railway runs `railway-start.sh`:

| Step | What happens | Time |
|------|-------------|------|
| 1 | MySQL plugin variables mapped | instant |
| 2 | Waits for MySQL to be reachable | 0–30s |
| 3 | Relaxes `sql_mode` globally | instant |
| 4 | Drops incompatible JSON index | instant |
| 5 | If DB empty: imports `initial.sql` (160 tables) | 3–5 min |
| 6 | If DB empty: runs Sequelize seeders | 1–2 min |
| 7 | Applies data hotfixes (idempotent SQL) | instant |
| 8 | If <5 exchange markets: runs data sweep | 30s |
| 9 | Populates market metadata (always runs) | 5s |
| 10 | PM2 starts backend (4000) + frontend ($PORT) | 30s |

Total cold deploy: **8–15 minutes**. Health check timeout is 600s.

---

## Step 5 — Generate a domain

Service → **Settings** → **Networking** → **Generate Domain**.

The frontend is exposed on `$PORT`. The backend is internal (port 4000) and
reached by the frontend via Next.js rewrites — no separate domain needed.

---

## Step 6 — First login

Navigate to your Railway domain and log in:

- Email: `superadmin@example.com`
- Password: `12345678`

**Change the password immediately.**

To promote a user to Admin: Admin panel → CRM → Users → click user → change Role.
Both Super Admin and Admin roles can update user roles from the UI.

---

## Troubleshooting

### "Market data not found" on order placement
Run on the Railway MySQL console to verify:
```sql
SELECT currency, pair, metadata IS NOT NULL as has_meta FROM exchange_market;
```
If any show `has_meta=0`, trigger a redeploy — `railway-start.sh` always runs
`scripts/populate-market-metadata.js` on every boot.

### Partial schema (DB has 1–159 tables)
A previous import died partway. Recover:
```sql
DROP DATABASE railway; CREATE DATABASE railway CHARACTER SET utf8mb4;
```
Then redeploy.

### Backend crashes with TEXT default errors
```sql
SET GLOBAL sql_mode = '';
```
Then redeploy.

### Frontend shows loading spinner forever
Backend takes ~8 minutes cold. Wait and refresh. Check Railway deploy logs.

### Redis not connected
Add the Redis plugin in Railway and redeploy.

---

## Credential acquisition guide

### Blockchain RPC nodes (for crypto deposits)

**Ethereum (ETH) / Polygon (MATIC) / Arbitrum (ARB) / Avalanche (AVAX)**
- **Infura** (free): https://infura.io → Create project → copy HTTP endpoint
  - Free tier: 100K requests/day — sufficient for a demo
  - Set `ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
  - For Polygon: `MATIC_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID`
  - For Arbitrum: `ARB_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_PROJECT_ID`
  - For Avalanche: `AVAX_RPC_URL=https://avalanche-mainnet.infura.io/v3/YOUR_PROJECT_ID`
- **Alchemy** (free alternative): https://alchemy.com → 300M compute units/month free
- **Public RPCs** (no signup): use the values in the env block above — no key needed

**Solana (SOL)**
- Public: `SOL_RPC_URL=https://api.mainnet-beta.solana.com` — free, no key
- Helius (100K free/month): https://helius.dev

**BNB Smart Chain (BNB)**
- Public: `BNB_RPC_URL=https://bsc-dataseed.binance.org` — no key needed

**Tron (TRX) + USDT TRC-20**
- TronGrid free API: https://www.trongrid.io → Create account → get API key
- Set `TRON_RPC_URL=https://api.trongrid.io`
- After setting the env var and redeploying: Admin → Wallets → Blockchains → enable TRON
- Enable the USDT token under the TRON blockchain
- Users will automatically get TRC-20 deposit addresses

### USDT TRC-20 deposit flow
1. Sign up at https://www.trongrid.io (free)
2. Set `TRON_RPC_URL=https://api.trongrid.io` in Railway variables
3. Redeploy
4. Admin panel → Wallets → Blockchains → TRON → toggle On
5. Admin panel → Wallets → Tokens → USDT → ensure TRC-20 is listed
6. Users visiting Wallet → Deposit → USDT (TRC-20) will get a deposit address

### Email (SMTP)
- **Gmail**: Enable 2FA → App Passwords → generate one
  - `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=app_password`
- **SendGrid** (100 emails/day free): https://sendgrid.com → API Keys → Create
  - `SENDGRID_API_KEY=SG.xxxx`
- **Mailgun** (100/day free trial): https://mailgun.com

### Fiat payments
- **Stripe**: https://stripe.com → Dashboard → Developers → API Keys
  - Copy Publishable key + Secret key + create a Webhook (set to your domain + `/api/stripe/webhook`)
- **PayPal**: https://developer.paypal.com → My Apps → Create App → copy Client ID + Secret

### FX rates (for fiat currency display)
- https://openexchangerates.org/signup/free — 1000 req/month free
- Copy the App ID → `APP_OPENEXCHANGERATES_APP_ID=your_id`

### ScyllaDB (ecosystem markets)
- **ScyllaDB Cloud** (free trial): https://cloud.scylladb.com
  - Create a cluster → get connection details → set `SCYLLA_HOSTS`, `SCYLLA_USERNAME`, `SCYLLA_PASSWORD`
  - This enables the Ecosystem extension (on-chain spot markets with blockchain settlement)
  - Without ScyllaDB, ecosystem markets are unavailable but all other trading works fine

### AI features
- **OpenAI**: https://platform.openai.com/api-keys → Create key
- **Google Gemini**: https://aistudio.google.com/app/apikey → Create key

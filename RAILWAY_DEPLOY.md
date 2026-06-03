# DeMourinho Crypto — Railway Deployment Guide

Last updated: 2026-06-03

This guide walks through deploying a fresh copy of DeMourinho Crypto on Railway.
The boot script handles everything automatically — you only need to connect the
database plugins and (optionally) add API keys for extra features.

---

## What you get out of the box (zero API keys)

Before touching anything, know what already works automatically on a fresh deploy:

- ✅ Full trading platform (spot, futures, binary options)
- ✅ Live price tickers and charts via KuCoin public API
- ✅ User signup, login, 2FA, admin panel
- ✅ Investment plans, staking pools, P2P trading
- ✅ Manual fiat deposit/withdrawal (bank wire, SEPA — admin approves)
- ✅ All secrets auto-generated (JWT keys, encryption key) — no manual setup

What needs API keys to unlock:
- Crypto deposits/withdrawals → KuCoin API keys (free, 10 min setup, no KYC)
- Email notifications → SMTP credentials
- Card payments → Stripe keys

---

## Step 1 — Fork or connect the repository

The boot script lives in the repo. Railway must be connected to this GitHub repository
so it can pull and run `railway-start.sh` on every deploy.

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo** → connect to `bicryptov6`
3. Railway auto-detects `railway.json` and `nixpacks.toml` — do not change them

---

## Step 2 — Add the required database plugins

Inside your Railway project, click **+ New** → **Database** and add:

| Plugin | Required? | Purpose |
|--------|-----------|---------|
| **MySQL** | ✅ Yes | All app data (160 tables) |
| **Redis** | ✅ Yes | BullMQ queues, cron jobs, deposit monitors, rate-limiting |

Both plugins automatically inject their connection variables. The boot script maps
`MYSQLHOST/PORT/USER/PASSWORD/DATABASE` and `REDISHOST/PORT/PASSWORD` onto the names
the app expects. You do not need to set any database env vars manually.

---

## Step 3 — Deploy

Click **Deploy** (or it may auto-deploy when you connected the repo).

The first deploy takes **10–15 minutes** because it:
- Imports the 160-table schema from `initial.sql`
- Runs Sequelize seeders (creates super admin, default settings)
- Runs all 10 data hotfixes
- Activates all features (markets, plans, staking, P2P, etc.)

Subsequent deploys take **2–3 minutes** (schema already exists, sweeps are skipped).

**Watch for this in Railway logs to confirm success:**
```
================================================================
  Bicrypto Railway Boot
================================================================
DB target: root@...
Redis target: ...
MySQL is reachable.
[auto-secrets] ...
Applying MySQL 8 schema fixups...
Fixing zero-date values...
Importing initial.sql ...      ← only on first deploy
Schema imported.
Running seeders...             ← only on first deploy
Applying data hotfixes...
Data hotfixes applied.
Running platform data sweeps...   ← only if exchange_market is empty
Feature activation done.
Starting backend (port 4000) + frontend (port 3000) under PM2...
```

---

## Step 4 — Verify the deployment

1. Open the Railway-generated URL (shown in your service's Settings → Domains)
2. Go to `/login` and sign in with `superadmin@example.com` / `12345678`
3. **Change this password immediately**
4. Confirm price charts are live on the homepage

If you see a loading spinner on the home page and no charts:
- Check Railway logs for the backend. The most common cause is that Redis wasn't
  attached — the backend starts but cron jobs that fetch prices don't run.
- Confirm both MySQL AND Redis plugins are connected to the app service.

---

## Step 5 — Set optional environment variables for full functionality

Go to your Railway service → **Variables** tab. Add any of the following:

### Crypto deposits (highest priority — adds real value immediately)

```env
APP_KUCOIN_API_KEY=your_key_here
APP_KUCOIN_API_SECRET=your_secret_here
APP_KUCOIN_API_PASSPHRASE=your_passphrase_here
```

How to get these:
1. Sign up at [kucoin.com](https://www.kucoin.com) (free, no KYC required for API keys)
2. Go to **Profile → API Management → Create API**
3. Set API type: **API Key**; permissions: **General** (read) is enough for deposits.
   Add **Trade** if you also want programmatic withdrawals.
4. Copy all three values into Railway

After adding, redeploy the service. Users will immediately see deposit addresses in their wallets.

> **Important**: Users do NOT need a KuCoin account. They send crypto from any wallet
> (MetaMask, Coinbase, Trust Wallet, Binance, hardware wallet — anything) to the address
> KuCoin generates for your platform. KuCoin is invisible to your users.

### Email (signup confirmation, password reset)

```env
APP_EMAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_SENDER=your.address@gmail.com
```

For Gmail: use an **App Password** (Google Account → Security → 2-Step Verification →
App Passwords). Do NOT use your main Gmail password.

Alternative — SendGrid free tier (100 emails/day):
```env
APP_EMAILER=sendgrid
SENDGRID_API_KEY=SG.xxx
```

### Site branding

```env
NEXT_PUBLIC_SITE_NAME=Your Exchange Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your tagline here
NEXT_PUBLIC_DEMO_STATUS=false
```

### Stripe card payments (optional)

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### AI trading bots (optional)

```env
OPENAI_API_KEY=sk-xxx
```

---

## Step 6 — First login checklist

After confirming the site loads:

1. **Change superadmin password** — Admin panel → Profile → Change Password
2. **Set your site name** — Add `NEXT_PUBLIC_SITE_NAME` to Railway vars, redeploy
3. **Configure email** — without this, users can't confirm accounts or reset passwords
4. **Add KuCoin API keys** — enables crypto deposits (see Step 5 above)
5. **Credit test users** — Admin → Finance → Users → select user → add balance manually.
   Use this to give yourself trading balance while deposits are being set up.

---

## Common issues and solutions

### Backend logs: "No Redis attached" warning but Redis plugin is connected

Railway requires you to explicitly **reference** plugin variables on the app service.
Go to Railway → your app service → **Variables** → click **+ Add variable reference** →
select the Redis plugin. This links the `REDISHOST`, `REDISPORT`, etc. vars.

### Home page shows loading spinner, no prices

Redis is not connected or the backend crashed. Check backend logs first.
Most common causes:
1. Redis plugin not connected to the app service (see above)
2. First deploy still running schema import (wait — it takes 10–15 min)
3. KuCoin API keys added but incorrect — backend will log authentication errors

### "Incorrect datetime value: 0000-00-00" in backend logs

This is handled automatically by the boot script. If you see it after a redeploy:
it means the boot script ran the sweep BUT the backend started before the sweep finished.
Trigger another deploy — second run will be clean.

### "JSON column 'tags' can't have default value"

Also handled automatically by the boot script's schema fixup step. If it persists:
open Railway → MySQL plugin → Data tab and run:
```sql
SET GLOBAL sql_mode = '';
ALTER TABLE support_ticket DROP INDEX IF EXISTS tags_idx;
ALTER TABLE support_ticket MODIFY COLUMN tags JSON NULL;
```

### Binary options / futures prices not updating

Check logs for "symbol not found" or "Bad symbol" errors. This means a delisted
KuCoin symbol slipped through. All known symbols are handled by hotfixes 007–010,
but KuCoin delists/renames symbols occasionally. Fix: add a hotfix SQL file to
`scripts/sql/` that deactivates the offending row, then redeploy.

### "License not activated" when enabling blockchains

This is already patched in `backend/dist/`. If you see it, confirm the dist patches
in `AGENT_HANDOFF.md` are present in the repo.

### Fresh deploy: "DB has N tables (expected 160)"

A previous import failed partway. Go to Railway → MySQL plugin → Data tab and run:
```sql
DROP DATABASE railway;
CREATE DATABASE railway;
```
Then trigger a redeploy. The boot script will re-import cleanly.

---

## Environment variable reference (full list)

These are all automatically defaulted. Only set them if you want to override:

| Variable | Auto-default | Notes |
|----------|-------------|-------|
| `NODE_ENV` | `production` | |
| `NEXT_PUBLIC_SITE_NAME` | `DeMourinho Crypto` | Change to your brand |
| `NEXT_PUBLIC_DEFAULT_THEME` | `dark` | |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | `en` | |
| `NEXT_PUBLIC_EXCHANGE` | `bin` | Frontend display flag only |
| `JWT_EXPIRY` | `7d` | |
| `JWT_REFRESH_EXPIRY` | `30d` | |
| `RATE_LIMIT` | `100` | Requests per window |
| `RATE_LIMIT_EXPIRY` | `15m` | Rate limit window |
| `APP_ETH_RPC_URL` | Infura free public | Ethereum RPC |
| `APP_BSC_RPC_URL` | Binance public | BSC RPC |
| `APP_POLYGON_RPC_URL` | polygon-rpc.com | Polygon RPC |
| `APP_SOL_RPC_URL` | mainnet-beta.solana.com | Solana RPC |
| `TRON_MAINNET_RPC` | api.trongrid.io | Tron RPC |
| `TRON_API_KEY` | Free key | TronGrid API |
| `APP_OPENEXCHANGERATES_APP_ID` | Free key | FX rates |
| `APP_ACCESS_TOKEN_SECRET` | **Auto-generated in DB** | JWT signing |
| `APP_REFRESH_TOKEN_SECRET` | **Auto-generated in DB** | |
| `APP_VERIFY_TOKEN_SECRET` | **Auto-generated in DB** | |
| `APP_RESET_TOKEN_SECRET` | **Auto-generated in DB** | |
| `ENCRYPTED_ENCRYPTION_KEY` | **Auto-generated in DB** | Wallet vault key |
| `ENCRYPTION_KEY_PASSPHRASE` | **Auto-generated in DB** | Wallet vault passphrase |

> The `APP_*_TOKEN_SECRET` and encryption key vars are generated on first boot and
> stored in the `_deploy_secrets` MySQL table. They persist across redeploys automatically.

---

## Adding optional Cassandra (for on-chain ecosystem deposits)

Cassandra enables a second deposit path: your platform generates its own on-chain
wallet addresses for users (ETH, BSC, Tron, Solana, etc.) without using KuCoin at all.
This is **optional** — the platform works fully without it.

1. In your Railway project, click **+ New** → **Deploy from GitHub repo** → same repo
2. Change the service's Dockerfile to `Dockerfile.cassandra`
3. Set these vars on the **Cassandra service**:
   ```env
   CASSANDRA_CLUSTER_NAME=demourinho
   CASSANDRA_DC=datacenter1
   ```
4. Set these vars on your **app service**:
   ```env
   SCYLLA_CONNECT_POINTS=<cassandra-service-name>.railway.internal:9042
   SCYLLA_USERNAME=cassandra
   SCYLLA_PASSWORD=cassandra
   SCYLLA_KEYSPACE=trading
   SCYLLA_FUTURES_KEYSPACE=futures
   SCYLLA_DATACENTER=datacenter1
   ```
5. Cassandra takes 60–120s to fully start. The app retries for up to 5 minutes.
6. Once connected: Admin → Ecosystem → Master Wallets → create one wallet per chain

**RAM warning**: Cassandra needs 500–800MB RAM minimum. On Railway free tier this can
cause OOM crashes (container restarts with no log). The init script limits heap to 128M
to help, but this is tight. Only add Cassandra if you have Railway credits to spare.

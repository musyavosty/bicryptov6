# Railway Agent Prompt — DeMourinho Crypto

Copy everything below this line and give it to a Railway-focused AI agent.

---

## Context and your role

You are deploying **DeMourinho Crypto**, a full-stack cryptocurrency exchange platform
(Bicrypto v6.3.0 fork), on Railway. The codebase is on GitHub at
`https://github.com/musyavosty/bicryptov6`.

Your job is Railway-side only: create services, connect plugins, set environment
variables, monitor deploys, and verify the platform is working. Do NOT edit code —
code changes happen in Replit and push automatically to GitHub. Railway just pulls
and runs whatever is in the repo.

You are working within Railway's web dashboard or CLI. The key things to know:
- `railway-start.sh` is the boot script — it handles ALL setup automatically
- You don't need to set secrets manually — they auto-generate on first boot
- The only hard requirement is MySQL + Redis plugins connected to the app service
- KuCoin API keys are the most impactful optional variable (enables crypto deposits)

---

## What the boot script does automatically (every deploy)

So you know what is and isn't your job:

1. Maps Railway plugin env vars (MYSQLHOST → DB_HOST, REDISHOST → REDIS_HOST, etc.)
2. Waits up to 60s for MySQL to be reachable
3. Relaxes MySQL strict mode (`SET GLOBAL sql_mode = ''`)
4. Applies schema compatibility fixups (JSON column index, datetime column type)
5. Sweeps zero-date timestamps (MySQL 8 strict mode would reject them otherwise)
6. **Auto-generates** all JWT secrets + wallet encryption key pair on first boot,
   stores them in MySQL `_deploy_secrets` table — they persist without manual setup
7. Imports the 160-table schema from `initial.sql` (first deploy only)
8. Runs Sequelize seeders (creates superadmin, default settings) (first deploy only)
9. Runs 10 idempotent data hotfixes (deactivates delisted KuCoin symbols, etc.)
10. Activates all features (markets, plans, staking, P2P, KYC, 60 fiat currencies)
11. Starts backend (port 4000) + frontend (port $PORT) under PM2

---

## Task 1 — Create the Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub repo**
3. Connect to: `https://github.com/musyavosty/bicryptov6`
4. Railway auto-detects `railway.json` and `nixpacks.toml` — accept them as-is

---

## Task 2 — Add database plugins (REQUIRED)

In the project, click **+ New** → **Database** and add **both**:

### MySQL (required)

- Railway's MySQL plugin automatically injects:
  `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
- These are automatically mapped by the boot script — no manual env vars needed

### Redis (required)

- Railway's Redis plugin automatically injects:
  `REDISHOST`, `REDISPORT`, `REDISPASSWORD`
- These are automatically mapped — no manual env vars needed

**After adding both plugins**: go to the **app service** → Variables tab → ensure
both plugin's variables are **referenced** by the app service. In Railway's UI this
is done via the "Reference" button or by clicking "+ Add variable reference". If the
plugins are in the same project, Railway usually auto-references them; verify this.

---

## Task 3 — Set the public domain

1. Go to app service → **Settings** → **Domains**
2. Generate a Railway domain (e.g. `demourinho-crypto-production.up.railway.app`)
3. Note the domain — you'll use it to verify the deployment

The boot script auto-detects `RAILWAY_PUBLIC_DOMAIN` and uses it as the frontend URL.
No manual `NEXT_PUBLIC_FRONTEND` env var needed.

---

## Task 4 — Deploy and monitor

Trigger a deploy (it may auto-trigger when you connected GitHub). Watch the Railway
logs for the app service.

**First deploy takes 10–15 minutes.** This is normal — it imports 160 tables and seeds data.

**Signs of a healthy boot (look for these in order):**
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
Importing initial.sql ...
Schema imported.
Running seeders...
Database already seeded or seed skipped.
Applying data hotfixes...
Data hotfixes applied.
Running platform data sweeps...
Data sweeps complete.
Populating market metadata...
Market metadata done.
Running full feature activation...
Feature activation done.
Starting backend (port 4000) + frontend (port $PORT) under PM2...
```

**Subsequent deploys (schema already exists):**
```
Database already has 160+ tables. Skipping import + seed.
Exchange markets already populated. Skipping row sweep.
```

---

## Task 5 — Add optional environment variables

Go to app service → **Variables** → raw editor. Add what you need:

### Minimum for production use

```env
NEXT_PUBLIC_SITE_NAME=DeMourinho Crypto
NEXT_PUBLIC_DEMO_STATUS=false
```

### Crypto deposits (HIGHEST PRIORITY — add this first)

```env
APP_KUCOIN_API_KEY=your_key_here
APP_KUCOIN_API_SECRET=your_secret_here
APP_KUCOIN_API_PASSPHRASE=your_passphrase_here
```

**How to get KuCoin API keys:**
1. Sign up at kucoin.com — **free, no KYC required for API key creation**
2. Profile → API Management → Create API → type: API Key
3. Permissions: **General** (for deposits) + **Trade** (for withdrawals if needed)
4. Complete the API key flow and save all three values

**What KuCoin API keys enable:**
- Users can deposit USDT, BTC, ETH, SOL, and other cryptos
- Platform fetches a unique deposit address for each user from KuCoin
- Users send from ANY wallet (MetaMask, Coinbase, Binance, Trust Wallet — anything)
- **Users do not need a KuCoin account** — they just send to the given address
- Platform monitors and credits the deposit automatically

**Without KuCoin API keys:** charts, prices, and trading all still work (KuCoin public
API requires no keys). Only the deposit address screen is empty.

**KuCoin KYC requirements:**
- API key creation: **No KYC required**
- Receiving deposits: **No KYC required**
- Withdrawals without KYC: limited to 1 BTC/day equivalent (fine for a demo)
- KYC Level 1 takes ~10 minutes if you need higher withdrawal limits

### Email notifications (signup confirmation, password reset)

```env
APP_EMAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your_gmail_app_password_not_your_main_password
SMTP_SENDER=youraddress@gmail.com
```

Note: For Gmail, use an **App Password** (Google Account → Security → 2-Step Verification → App Passwords).

### Site branding

```env
NEXT_PUBLIC_SITE_NAME=Your Brand Name
NEXT_PUBLIC_SITE_DESCRIPTION=Premium cryptocurrency exchange
```

### Stripe card payments (optional)

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Task 6 — Verify the deployment

1. Open the Railway domain URL
2. You should see the exchange homepage with a dark theme and live price ticker
3. Go to `/login` and sign in: `superadmin@example.com` / `12345678`
4. **Change this password immediately** — Admin → Profile
5. Check Admin → Exchange → Markets — you should see ~20 spot markets, 8 futures, 33 binary
6. Check the homepage price ticker — prices should update live (BTC, ETH, etc.)
7. If you added KuCoin API keys: go to Finance → Deposit (as a user) → you should see a crypto address

**Verification checklist:**
- [ ] Homepage loads with dark theme
- [ ] Price ticker shows live BTC/ETH prices
- [ ] Login works as superadmin
- [ ] Admin panel accessible
- [ ] Superadmin password changed from default
- [ ] (If KuCoin keys added) Deposit address visible in Finance → Deposit

---

## Task 7 — First-boot admin actions

After confirming the deployment is healthy, do these in the admin panel:

1. **Change superadmin password** — mandatory before sharing with anyone
2. **Set site name** — Admin → Settings → General → update site name and description
3. **Review active markets** — Admin → Exchange → Markets → confirm all markets show live prices
4. **Credit a test user** — Admin → Finance → Users → select a user → add balance to test trading
5. **Check extensions** — Admin → Extensions → confirm chart_engine and all 19 extensions are enabled

---

## Troubleshooting

### MySQL connection fails at boot

```
ERROR: MySQL not reachable after 60s.
```

- Verify the MySQL plugin is in the **same Railway project** as the app service
- Verify MySQL plugin variables are **referenced** by the app service (Railway Variables tab)
- Try: MySQL plugin → Settings → Restart

### Redis not connecting

Boot warning: `WARNING: No Redis attached.`

- Verify Redis plugin is in the same project
- Verify Redis plugin variables are **referenced** by the app service
- Without Redis: the platform boots but cron jobs fail (prices won't update, deposits won't verify)

### Home page spinner, no prices

Most common cause: Redis not connected. Without Redis, the price cron jobs don't run.
Check backend logs for "Redis connection refused" or similar.

### First deploy stuck at "Importing initial.sql"

The schema import takes 5–8 minutes on a cold database. This is normal. Do not redeploy.
If it's been more than 15 minutes, check Railway logs for specific SQL errors.

### "DB has N tables (expected 160)" warning

A previous import failed partway. Go to MySQL plugin → Data tab and run:
```sql
DROP DATABASE railway;
CREATE DATABASE railway;
```
Then trigger a redeploy.

### Prices not updating after boot (binary/spot/futures)

Binary options crash pattern: look for "Bad symbol" or "symbol not found" in logs.
This means a KuCoin-delisted symbol is active in the DB. All known ones are patched
in hotfixes 007–010. If a new one appears:
1. Note the symbol from the log (e.g. "FTM/USDT not found on KuCoin")
2. Open MySQL plugin → Data tab → run:
   ```sql
   UPDATE binary_market SET status=0 WHERE currency='FTM';
   -- or for spot:
   UPDATE exchange_market SET status=0 WHERE currency='FTM';
   ```
3. Redeploy to pick up the change

### "License not activated" when enabling ecosystem blockchains

This is already patched in the codebase. If you see it, the repo may be out of date.
Ensure you're deploying from the latest commit on `musyavosty/bicryptov6`.

### Ecosystem deposits not working

Ecosystem deposits require Cassandra (separate service). The platform works without it.
Crypto deposits via KuCoin API keys do NOT require Cassandra — those are a separate path.

---

## Do NOT touch

These are handled automatically. Leave them alone:

- **JWT secrets** — auto-generated and stored in MySQL `_deploy_secrets` table
- **`ENCRYPTED_ENCRYPTION_KEY` / `ENCRYPTION_KEY_PASSPHRASE`** — auto-generated same way
- **`NEXT_PUBLIC_FRONTEND`** — auto-detected from `RAILWAY_PUBLIC_DOMAIN`
- **`DB_HOST/PORT/USER/PASSWORD/NAME`** — mapped from MySQL plugin vars
- **`REDIS_HOST/PORT/PASSWORD`** — mapped from Redis plugin vars
- **RPC URLs** — already defaulted to free public endpoints
- **`APP_OPENEXCHANGERATES_APP_ID`** — already defaulted to a working free key

If you manually set any of these, you override the auto-detection. Only do so if you
have a specific reason (e.g. your own dedicated RPC node).

---

## Optional: adding Cassandra for on-chain ecosystem deposits

Skip this if you're just getting started. The platform works fully without Cassandra.
Cassandra only adds the ability for users to deposit ETH/BSC/TRON/SOL directly to
platform-owned wallet addresses (without going through KuCoin).

If you want to add it:
1. **+ New** → **Deploy from GitHub repo** → same `bicryptov6` repo
2. In the new service settings, change the build config to use `Dockerfile.cassandra`
3. Add these vars to the **Cassandra service**:
   ```env
   CASSANDRA_CLUSTER_NAME=demourinho
   CASSANDRA_DC=datacenter1
   ```
4. Add these vars to the **app service**:
   ```env
   SCYLLA_CONNECT_POINTS=<cassandra-service-name>.railway.internal:9042
   SCYLLA_USERNAME=cassandra
   SCYLLA_PASSWORD=cassandra
   SCYLLA_KEYSPACE=trading
   SCYLLA_FUTURES_KEYSPACE=futures
   SCYLLA_DATACENTER=datacenter1
   ```
5. Wait 90–120s after Cassandra starts for it to fully initialize
6. Redeploy the app service after Cassandra is confirmed healthy
7. Log in as superadmin → Admin → Ecosystem → Master Wallets → create wallets per chain

**RAM warning**: Cassandra uses 500–800MB minimum. Railway free tier may OOM-kill it.
Only add Cassandra if you have Railway credits to spare.

---

## Key defaults (for reference)

| What | Value |
|------|-------|
| Superadmin email | `superadmin@example.com` |
| Superadmin password | `12345678` — **change immediately** |
| Backend port | `4000` |
| Frontend port | `$PORT` (Railway sets this) |
| Active exchange | KuCoin (Binance geo-blocked on Railway) |
| Auto-generated secrets | Stored in MySQL `_deploy_secrets` table |
| Schema source | `initial.sql` (160 tables) |

---

## Summary: minimum steps for a working deployment

1. Create Railway project → deploy from `musyavosty/bicryptov6`
2. Add MySQL plugin → add Redis plugin → verify both are referenced by app service
3. Wait 10–15 minutes for first deploy (watch logs)
4. Open Railway URL → confirm homepage loads with live prices
5. Log in as superadmin → change password
6. *(Optional but recommended)* Add KuCoin API keys → redeploy → users can now deposit crypto

That's it. Everything else is already handled by the boot script.

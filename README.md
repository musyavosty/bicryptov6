# DeMourinho Crypto

A full-stack cryptocurrency exchange platform built on Bicrypto v6.3.0, rebranded
for DeMourinho Crypto. Features binary options, spot and futures trading, wallets,
staking, P2P, and an admin panel.

## Quick start

### Development preview (Replit)

The `Frontend` workflow runs the Next.js dev server on port 5000 with a stub
backend on port 4000. Hot-reload works for all frontend code.

### Production (Railway)

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for the full deployment guide.

Default login after a clean deploy:
- Email: `superadmin@example.com`
- Password: `12345678`

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, Tailwind CSS, Radix UI, SWR |
| Backend | Node.js 22 (compiled), MashServer, Sequelize |
| Database | MySQL 8 (160-table schema) |
| Cache | Redis (BullMQ queues, rate-limiting) |
| Market data | Binance via ccxt (public mode, no API key needed) |
| Deploy | Railway (single service, PM2 process manager) |

## Live markets (no API keys required)

- **24 spot pairs**: BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT, XRP/USDT, and more
- **8 binary markets**: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, MATIC
- **9 futures markets**: BTC, ETH, SOL, XRP, BNB, MATIC, DOGE, AVAX, ARB

## For AI agents

Read `AGENT_HANDOFF.md` first — it contains the full current state, what works,
what's broken, the Railway MySQL connection string, and the exact steps needed to
configure payment providers and blockchain RPC nodes.

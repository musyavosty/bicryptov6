-- hotfix-009: Deactivate binary markets whose symbols are not on KuCoin.
--
-- The binary price cron fetches live prices for every active binary_market row.
-- If a symbol doesn't exist on KuCoin the ccxt call throws, crashing the cron
-- process and killing ALL binary option price updates until the backend restarts.
-- This is idempotent — safe to run on every boot.
--
-- Symbols removed from KuCoin or renamed:
--   MATIC  → renamed to POL on KuCoin (2024)
--   FTM    → migrated to S (Sonic) on KuCoin (2025)
--   RNDR   → delisted from KuCoin spot trading
--
-- All three cause a hard ccxt NotSupported / BadSymbol error that kills the cron.

UPDATE binary_market
SET status = 0
WHERE currency IN ('MATIC', 'FTM', 'RNDR')
  AND pair = 'USDT';

-- hotfix-007: Deactivate MATIC in exchange_currency and exchange_market
-- Root cause: KuCoin renamed MATIC to POL. MATIC/USDT no longer exists on KuCoin.
-- The processCurrenciesPrices CRON crashes on the first missing symbol and blocks
-- ALL price updates for every other currency until the service restarts.
-- This hotfix is idempotent — safe to run on every boot.

UPDATE exchange_currency SET status = 0 WHERE currency = 'MATIC';
UPDATE exchange_market SET status = 0 WHERE currency = 'MATIC';

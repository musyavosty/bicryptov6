-- hotfix-008: Deactivate MATIC in futures_market, add BTC to exchange_currency,
--             deactivate MATIC staking pool.
--
-- MATIC/USDT was also active in futures_market (same KuCoin rename issue as hotfix-007).
-- The futures price cron crashes on the missing symbol and blocks ALL futures price
-- updates until the service restarts. This is idempotent — safe to run on every boot.
--
-- BTC was missing from exchange_currency entirely. The processCurrenciesPrices cron
-- iterates over exchange_currency to build the symbol list. Without a BTC row the cron
-- never fetches a BTC price, so BTC balances and wallet pages show stale/zero prices.
--
-- MATIC staking pool is left ACTIVE even though MATIC is deactivated as a currency.
-- The staking UI tries to fetch the MATIC price and shows an error. Deactivate it.

-- 1. Futures: deactivate MATIC/USDT (KuCoin has POL/USDT, not MATIC/USDT)
UPDATE futures_market SET status = 0 WHERE currency = 'MATIC';

-- 2. exchange_currency: add BTC so the price cron fetches it
INSERT INTO exchange_currency (id, currency, name, `precision`, price, status, fee)
SELECT UUID(), 'BTC', 'Bitcoin', 8, 0, 1, 0.5
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM exchange_currency WHERE currency = 'BTC');

-- Also make sure BTC is active if it already exists but was disabled
UPDATE exchange_currency SET status = 1 WHERE currency = 'BTC' AND status = 0;

-- 3. Staking: deactivate MATIC pool (no live price → UI errors)
UPDATE staking_pools SET status = 'INACTIVE' WHERE symbol = 'MATIC';

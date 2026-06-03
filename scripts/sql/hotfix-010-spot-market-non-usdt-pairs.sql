-- hotfix-010: Deactivate non-USDT spot market pairs that KuCoin doesn't carry.
--
-- The processCurrenciesPrices cron fetches prices for ALL active exchange_market rows.
-- KuCoin only carries USDT-quoted pairs for most altcoins. Non-USDT pairs like
-- SOL/BTC, ETH/BTC, LINK/ETH cause a hard ccxt BadSymbol error that crashes the
-- ENTIRE spot price cron every 2 minutes — not just the affected pair.
--
-- This is idempotent — safe to run on every boot.

UPDATE exchange_market
SET status = 0
WHERE
  (currency = 'SOL'  AND pair = 'BTC')  -- KuCoin has SOL/USDT, not SOL/BTC
  OR (currency = 'ETH'  AND pair = 'BTC')  -- KuCoin has ETH/USDT, not ETH/BTC
  OR (currency = 'LINK' AND pair = 'ETH'); -- KuCoin has LINK/USDT, not LINK/ETH

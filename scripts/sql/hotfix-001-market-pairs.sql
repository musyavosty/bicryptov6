-- hotfix-001-market-pairs.sql
-- The `pair` column in exchange_market must store ONLY the quote currency
-- (e.g. 'USDT', 'BTC', 'ETH'). The backend constructs the full ccxt symbol
-- as:  currency + '/' + pair  →  'LINK' + '/' + 'USDT'  =  'LINK/USDT'
--
-- The initial sweep inserted full pair symbols ('BTC/USDT', 'LINK/ETH', etc.)
-- instead of just the quote, causing the backend to construct invalid symbols
-- like 'LINK/LINK/ETH', crashing the processCurrenciesPrices cron entirely.
--
-- This UPDATE strips everything up to and including the last '/' in pair.
-- Idempotent: rows that already have just the quote (no '/') are untouched.
UPDATE exchange_market
SET pair = SUBSTRING_INDEX(pair, '/', -1)
WHERE pair LIKE '%/%';

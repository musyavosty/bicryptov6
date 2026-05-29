-- hotfix-004-dedup-tables.sql
-- Root cause: activate-all.js uses INSERT IGNORE + UUID() as PK for exchange,
-- binary_duration, and staking_pools. Since UUID() generates a unique PK every
-- time, INSERT IGNORE never detects a conflict and adds a new row on every boot.
-- After 30 boots: 7 KuCoin exchange rows, 30× binary_duration dupes, 30× pool dupes.
--
-- Also fixes binary_market: the INSERT there was missing the `id` column.
-- Since id = char(36) NOT NULL with no DEFAULT, MySQL rejects every insert
-- and INSERT IGNORE silently swallows it — leaving only the 9 original seeded rows.
--
-- This file runs on every boot (idempotent — subsequent runs are no-ops because
-- the data will already be clean after the first run).

-- 1. Deduplicate exchange (keep the oldest/lowest id per exchange name)
DELETE FROM exchange
WHERE id NOT IN (
  SELECT id FROM (SELECT MIN(id) AS id FROM exchange GROUP BY name) t
);

-- 2. Deduplicate binary_duration (keep one per duration+profitPercentage combo)
DELETE FROM binary_duration
WHERE id NOT IN (
  SELECT id FROM (SELECT MIN(id) AS id FROM binary_duration GROUP BY duration, profitPercentage) t
);

-- 3. Deduplicate staking_pools (keep one per pool name)
DELETE FROM staking_pools
WHERE id NOT IN (
  SELECT id FROM (SELECT MIN(id) AS id FROM staking_pools GROUP BY name) t
);

-- 4. Insert missing binary market pairs (safe — unique constraint on currency+pair
--    means INSERT IGNORE skips rows that already exist)
INSERT IGNORE INTO binary_market (id, currency, pair, status, minAmount, maxAmount, isTrending, isHot) VALUES
(UUID(), 'LINK',  'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'LTC',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'BCH',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'DOT',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'ATOM',  'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'TRX',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'NEAR',  'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'UNI',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'TON',   'USDT', 1, 1.00, 10000.00, 1, 1),
(UUID(), 'SUI',   'USDT', 1, 1.00, 10000.00, 1, 1),
(UUID(), 'APT',   'USDT', 1, 1.00, 10000.00, 1, 0),
(UUID(), 'INJ',   'USDT', 1, 1.00, 10000.00, 1, 0),
(UUID(), 'PEPE',  'USDT', 1, 1.00, 10000.00, 1, 1),
(UUID(), 'WIF',   'USDT', 1, 1.00, 10000.00, 1, 1),
(UUID(), 'ARB',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'OP',    'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'FTM',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'SHIB',  'USDT', 1, 1.00, 10000.00, 1, 0),
(UUID(), 'FLOKI', 'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'FIL',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'LDO',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'RNDR',  'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'FET',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'WLD',   'USDT', 1, 1.00, 10000.00, 1, 0),
(UUID(), 'ETC',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'XLM',   'USDT', 1, 1.00, 10000.00, 0, 0),
(UUID(), 'ALGO',  'USDT', 1, 1.00, 10000.00, 0, 0);

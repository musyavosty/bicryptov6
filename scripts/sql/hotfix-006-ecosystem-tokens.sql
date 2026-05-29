-- hotfix-006: Enable ecosystem deposit tokens and add missing TRON USDT (TRC-20)
-- The ecosystem uses RPC nodes (Infura/ETH, TronGrid/TRON, BSC RPC, Polygon RPC, Solana RPC)
-- to generate custodial deposit addresses and monitor on-chain transactions.
-- No KuCoin API keys needed — only Cassandra + a master wallet per chain.
-- Safe to run multiple times (idempotent).

SET SESSION sql_mode = '';

-- Insert TRON USDT (TRC-20) — not present in the original seeded token list
INSERT INTO ecosystem_token (id, name, currency, chain, network, contract, contractType, type, decimals, status, `precision`, createdAt, updatedAt)
SELECT UUID(), 'Tether USD', 'USDT', 'TRON', 'mainnet',
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  'NO_PERMIT', 'TRC20', 6, 1, 8, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM ecosystem_token WHERE chain='TRON' AND currency='USDT');

-- Enable USDT on all supported chains
UPDATE ecosystem_token SET status=1 WHERE chain='ETH'     AND currency='USDT';
UPDATE ecosystem_token SET status=1 WHERE chain='BSC'     AND currency='USDT';
UPDATE ecosystem_token SET status=1 WHERE chain='TRON'    AND currency='USDT';
UPDATE ecosystem_token SET status=1 WHERE chain='POLYGON' AND currency='USDT';
UPDATE ecosystem_token SET status=1 WHERE chain='SOL'     AND currency='USDT'
  AND contract='Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

-- Enable USDC on all supported chains
UPDATE ecosystem_token SET status=1 WHERE chain='ETH'     AND currency='USDC';
UPDATE ecosystem_token SET status=1 WHERE chain='BSC'     AND currency='USDC';
UPDATE ecosystem_token SET status=1 WHERE chain='POLYGON' AND currency='USDC';
UPDATE ecosystem_token SET status=1 WHERE chain='SOL'     AND currency='USDC';

-- Enable native chain coins
UPDATE ecosystem_token SET status=1 WHERE chain='ETH'     AND currency='ETH'   AND contractType='NATIVE';
UPDATE ecosystem_token SET status=1 WHERE chain='BSC'     AND currency='BNB'   AND contractType='NATIVE';
UPDATE ecosystem_token SET status=1 WHERE chain='TRON'    AND currency='TRX'   AND contractType='NATIVE';
UPDATE ecosystem_token SET status=1 WHERE chain='SOL'     AND currency='SOL'   AND contractType='NATIVE';
UPDATE ecosystem_token SET status=1 WHERE chain='POLYGON' AND currency='MATIC' AND contractType='NATIVE';
UPDATE ecosystem_token SET status=1 WHERE chain='BTC'                          AND contractType='NATIVE';

-- Ensure all addon ecosystem blockchains are enabled
UPDATE ecosystem_blockchain SET status=1;

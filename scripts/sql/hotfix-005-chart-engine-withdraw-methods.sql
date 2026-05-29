-- hotfix-005: Enable chart_engine, clean binary_duration duplicate, seed deposit/withdraw methods
-- Safe to run multiple times (idempotent).

SET SESSION sql_mode = '';

-- 1. Enable chart_engine extension (was missing from the activate-all extension list)
UPDATE extension SET status = 1 WHERE name = 'chart_engine';

-- 2. Remove duplicate 30-min binary_duration (seed inserts 70%, activate-all wants 85%)
DELETE FROM binary_duration WHERE duration = 30 AND profitPercentage = 70;

-- 3. Seed deposit_method (manual fiat deposit instructions shown in Finance → Deposit → Fiat)
INSERT INTO deposit_method (id, title, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'Bank Wire Transfer',
  'Send payment to our bank account. You will receive the bank details via email after submitting your request. Processing time: 1–3 business days.',
  0, 0, 100, 100000,
  '[{"name":"Bank Name","type":"text","required":true},{"name":"Account Number","type":"text","required":true},{"name":"Reference / Note","type":"text","required":true}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM deposit_method WHERE title = 'Bank Wire Transfer');

INSERT INTO deposit_method (id, title, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'SEPA Bank Transfer',
  'EU bank transfer via SEPA. Provide your name and reference code. Processing time: 1–2 business days.',
  0, 0, 50, 50000,
  '[{"name":"IBAN","type":"text","required":true},{"name":"BIC / SWIFT","type":"text","required":true},{"name":"Reference","type":"text","required":true}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM deposit_method WHERE title = 'SEPA Bank Transfer');

INSERT INTO deposit_method (id, title, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'Crypto Transfer (Manual)',
  'Send crypto to our deposit address. Submit your transaction hash and admin will credit your account after on-chain confirmation.',
  0, 0, 10, 500000,
  '[{"name":"Transaction Hash / TXID","type":"text","required":true},{"name":"Amount Sent","type":"number","required":true},{"name":"Currency & Network","type":"text","required":true}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM deposit_method WHERE title = 'Crypto Transfer (Manual)');

-- 4. Seed withdraw_method (shown in Finance → Withdraw → Fiat)
INSERT INTO withdraw_method (id, title, processingTime, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'Bank Wire Transfer', '3–5 business days',
  'Provide your bank account details. Withdrawals are reviewed and sent Monday–Friday.',
  5, 0, 100, 50000,
  '[{"name":"Account Holder Name","type":"text","required":true},{"name":"Bank Name","type":"text","required":true},{"name":"Account Number / IBAN","type":"text","required":true},{"name":"SWIFT / BIC","type":"text","required":true},{"name":"Bank Address","type":"text","required":false}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM withdraw_method WHERE title = 'Bank Wire Transfer');

INSERT INTO withdraw_method (id, title, processingTime, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'SEPA Bank Transfer', '1–2 business days',
  'EU SEPA transfer. Provide your IBAN and BIC.',
  2, 0, 50, 25000,
  '[{"name":"Account Holder Name","type":"text","required":true},{"name":"IBAN","type":"text","required":true},{"name":"BIC / SWIFT","type":"text","required":true}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM withdraw_method WHERE title = 'SEPA Bank Transfer');

INSERT INTO withdraw_method (id, title, processingTime, instructions, fixedFee, percentageFee, minAmount, maxAmount, customFields, status, createdAt, updatedAt)
SELECT UUID(),
  'Crypto Withdrawal (Manual)', '1–24 hours',
  'Provide your wallet address and network. Admin will process the on-chain transfer.',
  1, 0, 10, 500000,
  '[{"name":"Wallet Address","type":"text","required":true},{"name":"Network / Chain (e.g. TRC20, ERC20, BEP20)","type":"text","required":true},{"name":"Currency","type":"text","required":true}]',
  1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM withdraw_method WHERE title = 'Crypto Withdrawal (Manual)');

-- PHASE 2 SWEEP — generated 2026-04-30T21:40:49.784Z
  -- Fills empty content tables so customer-facing features actually display:
  --   binary trading (markets + durations + settings JSON)
  --   futures markets
  --   investment plans (Bronze/Silver/Gold)
  --   forex plans (Starter/Pro/VIP)
  --   staking pools (BTC/ETH/USDT/SOL)
  --   p2p payment methods (6 globals)
  --   nft categories (6)
  --   ecommerce categories (5)
  --   ai investment plans (2)
  -- Single transaction. Touches NO schema. Does NOT touch payment gateway keys.
  -- Rollback: scripts/sql/sweep-phase2-rollback.sql

  START TRANSACTION;

  -- ============ BINARY MARKETS (8) ============
  INSERT INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('d45e1cc3-0a74-4c0b-a3c5-37a1233d425b', 'BTC', 'USDT', 1, 1, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('4aaf7d96-4548-404a-a130-4f6e6904f8a9', 'ETH', 'USDT', 1, 1, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('a32d1540-8d13-4773-8e64-383447b9e56d', 'BNB', 'USDT', 1, 0, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('e466cffe-64df-47c2-8bc0-f68badb96d2a', 'SOL', 'USDT', 1, 1, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('f89431f3-10c7-4768-ab7c-1a7cba34e316', 'XRP', 'USDT', 0, 1, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('d0657433-6ed7-4d14-b0dd-35d0fb0f0ccf', 'ADA', 'USDT', 0, 0, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('692d32e3-1d39-4ba0-a9f5-51f56701c3cb', 'DOGE', 'USDT', 1, 1, 1, 1, 10000);
INSERT IGNORE INTO binary_market (id, currency, pair, isTrending, isHot, status, minAmount, maxAmount) VALUES ('240a14ea-b4ee-4ba6-9f9e-a35134dd5ec1', 'MATIC', 'USDT', 0, 0, 1, 1, 10000);

-- ============ BINARY DURATIONS (7) ============
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('6522d2a0-9f8a-4214-9bcc-5d688832b853', 1, 80, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('3c5ec641-9e81-4897-822c-95a34176c941', 3, 78, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('4098cf4a-161e-4f87-bda1-f1c950bd5439', 5, 75, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('a60043ed-6d09-456b-b6cc-b3964dc0dc3e', 15, 72, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('e0ba9a9d-a529-447a-b792-c6f796e1fbe1', 30, 70, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('32db6499-d5a6-4bfc-826d-1800285b981f', 60, 68, 1, NOW(), NOW());
INSERT IGNORE INTO binary_duration (id, duration, profitPercentage, status, createdAt, updatedAt) VALUES ('4c5938d9-740b-4952-8035-05d896db83c9', 240, 65, 1, NOW(), NOW());

-- ============ BINARY SETTINGS JSON BLOB ============
INSERT INTO settings (`key`, value) VALUES ('binarySettings', '{"global":{"enabled":true,"practiceEnabled":true,"maxConcurrentOrders":10,"maxDailyOrders":100,"cooldownSeconds":3,"orderExpirationBuffer":30,"cancelExpirationBuffer":60},"display":{"chartType":"CHART_ENGINE"},"orderTypes":{"RISE_FALL":{"enabled":true,"profitPercentage":72,"tradingModes":{"demo":true,"live":true}},"HIGHER_LOWER":{"enabled":true,"profitPercentage":68,"tradingModes":{"demo":true,"live":true}},"TOUCH_NO_TOUCH":{"enabled":true,"profitPercentage":90,"tradingModes":{"demo":true,"live":true}},"CALL_PUT":{"enabled":true,"profitPercentage":70,"tradingModes":{"demo":true,"live":true}},"TURBO":{"enabled":true,"profitPercentage":65,"tradingModes":{"demo":true,"live":true}}}}') ON DUPLICATE KEY UPDATE value=VALUES(value);

-- ============ FUTURES MARKETS (8) ============
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('298210b8-61b2-43b0-bbdf-f5cd3f7c7821', 'BTC', 'USDT', 1, 1, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('4a8790eb-bb38-4d1b-acd8-bd75ae0ba796', 'ETH', 'USDT', 1, 1, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('9256d6aa-d74c-4ab1-a5fe-ac0c97c43947', 'BNB', 'USDT', 1, 0, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('7db95c16-26dd-4200-87f6-b499b516359a', 'SOL', 'USDT', 1, 1, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('80a857ff-3c9b-44c2-9670-970c5313a8f8', 'XRP', 'USDT', 0, 1, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('e76a2129-b3d8-45d1-8468-37791cbaa83e', 'DOGE', 'USDT', 1, 1, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('fa2b93aa-8af8-42af-a2ef-e1ca1e0909d2', 'AVAX', 'USDT', 0, 0, 1, NOW(), NOW());
INSERT IGNORE INTO futures_market (id, currency, pair, isTrending, isHot, status, createdAt, updatedAt) VALUES ('93268d95-2d02-4fdf-a0e3-6f6e4d1c021a', 'MATIC', 'USDT', 0, 0, 1, NOW(), NOW());

-- ============ INVESTMENT PLANS (3) ============
INSERT IGNORE INTO investment_duration (id, duration, timeframe) VALUES ('4cf5b8a5-d752-4b6d-83ed-928f1b329c37', 30, 'DAY');
INSERT IGNORE INTO investment_duration (id, duration, timeframe) VALUES ('6aebab30-ebf9-4884-9c10-601f4289e695', 60, 'DAY');
INSERT IGNORE INTO investment_duration (id, duration, timeframe) VALUES ('f0b97897-ad75-46d4-b83d-e5d1b742f5f4', 90, 'DAY');
INSERT IGNORE INTO investment_plan (id, name, title, description, currency, minAmount, maxAmount, status, profitPercentage, minProfit, maxProfit, defaultProfit, defaultResult, trending, walletType, createdAt, updatedAt)
  VALUES ('74a9d464-75d4-4e0b-8e15-23db1510a127', 'Bronze', 'Bronze Plan', 'Stable returns for newcomers. Low risk, daily compounding.', 'USD', 100, 1000, 1, 9, 8, 10, 9, 'WIN', 0, 'FIAT', NOW(), NOW());
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('896c7260-c644-42d4-8592-31528bd75ae0', '74a9d464-75d4-4e0b-8e15-23db1510a127', '4cf5b8a5-d752-4b6d-83ed-928f1b329c37');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('f784bfed-0842-4694-b8f3-3ffded8f744d', '74a9d464-75d4-4e0b-8e15-23db1510a127', '6aebab30-ebf9-4884-9c10-601f4289e695');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('514fc399-e00c-4a70-8c13-cb54587cb94e', '74a9d464-75d4-4e0b-8e15-23db1510a127', 'f0b97897-ad75-46d4-b83d-e5d1b742f5f4');
INSERT IGNORE INTO investment_plan (id, name, title, description, currency, minAmount, maxAmount, status, profitPercentage, minProfit, maxProfit, defaultProfit, defaultResult, trending, walletType, createdAt, updatedAt)
  VALUES ('0b448ce8-bde4-41ad-ae11-7eb41083b355', 'Silver', 'Silver Plan', 'Balanced growth for active investors. Mid-tier compounding.', 'USD', 1000, 10000, 1, 15, 12, 18, 14, 'WIN', 1, 'FIAT', NOW(), NOW());
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('b3f0f6ec-eda2-49b7-bb3f-be6dd43cea04', '0b448ce8-bde4-41ad-ae11-7eb41083b355', '4cf5b8a5-d752-4b6d-83ed-928f1b329c37');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('0bdc78b8-1285-41ff-a7e9-664370cbcca7', '0b448ce8-bde4-41ad-ae11-7eb41083b355', '6aebab30-ebf9-4884-9c10-601f4289e695');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('1bf0fd6e-a74c-4c05-87e0-234cda3f25fa', '0b448ce8-bde4-41ad-ae11-7eb41083b355', 'f0b97897-ad75-46d4-b83d-e5d1b742f5f4');
INSERT IGNORE INTO investment_plan (id, name, title, description, currency, minAmount, maxAmount, status, profitPercentage, minProfit, maxProfit, defaultProfit, defaultResult, trending, walletType, createdAt, updatedAt)
  VALUES ('870b0179-46d1-4167-ae86-3ec22371c83f', 'Gold', 'Gold Plan', 'Premium yield with priority support and weekly rebalancing.', 'USD', 10000, 100000, 1, 23, 18, 28, 22, 'WIN', 1, 'FIAT', NOW(), NOW());
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('59414bcc-ea75-4a63-b63c-c686515989c2', '870b0179-46d1-4167-ae86-3ec22371c83f', '4cf5b8a5-d752-4b6d-83ed-928f1b329c37');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('647f355f-b83c-448d-bf9e-060483a12381', '870b0179-46d1-4167-ae86-3ec22371c83f', '6aebab30-ebf9-4884-9c10-601f4289e695');
INSERT IGNORE INTO investment_plan_duration (id, planId, durationId) VALUES ('b509be3e-1799-45fe-adc9-42f37fd0d989', '870b0179-46d1-4167-ae86-3ec22371c83f', 'f0b97897-ad75-46d4-b83d-e5d1b742f5f4');

-- ============ AI INVESTMENT PLANS (2) ============
INSERT IGNORE INTO ai_investment_duration (id, duration, timeframe) VALUES ('445bd829-eed2-478d-919e-275b73ceaf9e', 30, 'DAY');
INSERT IGNORE INTO ai_investment_duration (id, duration, timeframe) VALUES ('52e188fd-662a-483a-aedb-4eb140e06750', 60, 'DAY');
INSERT IGNORE INTO ai_investment_duration (id, duration, timeframe) VALUES ('da0c5375-3fcb-4223-b417-450c3852efb5', 90, 'DAY');
INSERT IGNORE INTO ai_investment_plan (id, name, title, description, status, profitPercentage, minProfit, maxProfit, minAmount, maxAmount, trending, defaultProfit, defaultResult, createdAt, updatedAt)
  VALUES ('7dca2ec5-1d5b-475e-bce5-d3fca2b7363c', 'AI Quant', 'AI Quant Strategy', 'Machine-learning quant model trading top-cap cryptos.', 1, 13, 10, 16, 500, 50000, 1, 13, 'WIN', NOW(), NOW());
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('d5fbbf87-830a-4530-bd59-a92789b3bf21', '7dca2ec5-1d5b-475e-bce5-d3fca2b7363c', '445bd829-eed2-478d-919e-275b73ceaf9e');
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('c62897fd-9eb7-4034-b79c-bf80ae0562ea', '7dca2ec5-1d5b-475e-bce5-d3fca2b7363c', '52e188fd-662a-483a-aedb-4eb140e06750');
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('5d2db7fb-ef47-4089-b05f-ecfa5ef37682', '7dca2ec5-1d5b-475e-bce5-d3fca2b7363c', 'da0c5375-3fcb-4223-b417-450c3852efb5');
INSERT IGNORE INTO ai_investment_plan (id, name, title, description, status, profitPercentage, minProfit, maxProfit, minAmount, maxAmount, trending, defaultProfit, defaultResult, createdAt, updatedAt)
  VALUES ('554cbf53-9070-4c8b-b1e0-fd9c988d1a5a', 'AI Momentum', 'AI Momentum Strategy', 'Momentum + sentiment AI rebalancing every 6 hours.', 1, 18, 14, 22, 1000, 100000, 1, 18, 'WIN', NOW(), NOW());
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('3de4a610-54e0-4c8c-a389-0f879db6d53b', '554cbf53-9070-4c8b-b1e0-fd9c988d1a5a', '445bd829-eed2-478d-919e-275b73ceaf9e');
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('69e71b5c-55c7-427e-bfc1-646bded18c53', '554cbf53-9070-4c8b-b1e0-fd9c988d1a5a', '52e188fd-662a-483a-aedb-4eb140e06750');
INSERT IGNORE INTO ai_investment_plan_duration (id, planId, durationId) VALUES ('6a683c34-613d-4376-903f-04cddac88106', '554cbf53-9070-4c8b-b1e0-fd9c988d1a5a', 'da0c5375-3fcb-4223-b417-450c3852efb5');

-- ============ FOREX PLANS (3) ============
INSERT IGNORE INTO forex_duration (id, duration, timeframe) VALUES ('860c02c0-2c09-4f7f-9e5c-212f589a097e', 30, 'DAY');
INSERT IGNORE INTO forex_duration (id, duration, timeframe) VALUES ('44018c42-e126-4265-9f46-c971c0465e5c', 60, 'DAY');
INSERT IGNORE INTO forex_duration (id, duration, timeframe) VALUES ('e7b8bbdf-deac-448c-aa0b-b29b3ac689a6', 90, 'DAY');
INSERT IGNORE INTO forex_plan (id, name, title, description, minAmount, maxAmount, minProfit, maxProfit, status, profitPercentage, defaultProfit, defaultResult, trending, currency, walletType, createdAt, updatedAt)
  VALUES ('9fa4a0e6-961f-4e50-8370-ce74224595a8', 'Starter', 'Starter Plan', 'Conservative forex pairs, low leverage.', 500, 5000, 6, 10, 1, 8, 8, 'WIN', 0, 'USD', 'FIAT', NOW(), NOW());
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('10f57ac8-3ec1-40b3-b172-ce3654e3af28', '9fa4a0e6-961f-4e50-8370-ce74224595a8', '860c02c0-2c09-4f7f-9e5c-212f589a097e');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('758cf0db-93fc-41ab-8419-a03399802713', '9fa4a0e6-961f-4e50-8370-ce74224595a8', '44018c42-e126-4265-9f46-c971c0465e5c');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('379af798-01d5-4df6-902e-c1bdd5a3f9ea', '9fa4a0e6-961f-4e50-8370-ce74224595a8', 'e7b8bbdf-deac-448c-aa0b-b29b3ac689a6');
INSERT IGNORE INTO forex_plan (id, name, title, description, minAmount, maxAmount, minProfit, maxProfit, status, profitPercentage, defaultProfit, defaultResult, trending, currency, walletType, createdAt, updatedAt)
  VALUES ('ef2c6214-c5d9-40ca-b841-517237ee3a1e', 'Pro', 'Pro Plan', 'Mid-tier majors + minors with 1:50 leverage.', 5000, 50000, 10, 16, 1, 13, 13, 'WIN', 1, 'USD', 'FIAT', NOW(), NOW());
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('d6736d45-9081-4112-a69d-67c5beb2f7ce', 'ef2c6214-c5d9-40ca-b841-517237ee3a1e', '860c02c0-2c09-4f7f-9e5c-212f589a097e');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('33a82bbb-4345-414d-885b-8a3eccaca3fa', 'ef2c6214-c5d9-40ca-b841-517237ee3a1e', '44018c42-e126-4265-9f46-c971c0465e5c');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('debc84be-b231-4aee-83b3-82c07efc6f70', 'ef2c6214-c5d9-40ca-b841-517237ee3a1e', 'e7b8bbdf-deac-448c-aa0b-b29b3ac689a6');
INSERT IGNORE INTO forex_plan (id, name, title, description, minAmount, maxAmount, minProfit, maxProfit, status, profitPercentage, defaultProfit, defaultResult, trending, currency, walletType, createdAt, updatedAt)
  VALUES ('999c1f68-2160-4a90-b9f2-67e4aee3a6cb', 'VIP', 'VIP Plan', 'All majors/minors/exotics, 1:200, dedicated.', 50000, 500000, 16, 26, 1, 21, 21, 'WIN', 1, 'USD', 'FIAT', NOW(), NOW());
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('732f40ac-5d30-4978-b626-e42a17c2efe6', '999c1f68-2160-4a90-b9f2-67e4aee3a6cb', '860c02c0-2c09-4f7f-9e5c-212f589a097e');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('48f38484-7a18-471d-bdf2-186dc0ea0401', '999c1f68-2160-4a90-b9f2-67e4aee3a6cb', '44018c42-e126-4265-9f46-c971c0465e5c');
INSERT IGNORE INTO forex_plan_duration (id, planId, durationId) VALUES ('35cb121a-d591-42a3-aadf-41303333ebf9', '999c1f68-2160-4a90-b9f2-67e4aee3a6cb', 'e7b8bbdf-deac-448c-aa0b-b29b3ac689a6');

-- ============ STAKING POOLS (4) ============
INSERT IGNORE INTO staking_pools (id, name, token, symbol, description, apr, lockPeriod, minStake, status, isPromoted, `order`, earningFrequency, autoCompound, profitSource, fundAllocation, risks, rewards, earlyWithdrawalFee, walletType, createdAt, updatedAt)
  VALUES ('91f02bcc-e6cd-45e6-b58f-12bfdb706514', 'Bitcoin Flexible', 'Bitcoin', 'BTC', 'Stake BTC and earn yield with no lock period.', 5, 100, 100, 'ACTIVE', 1, 0, 'DAILY', 1, 'Trading desk yield from active market making and lending.', '70% lending desk, 20% MM, 10% reserve.', 'Smart-contract risk, market volatility, counterparty risk.', 'Daily APR accrual, optional auto-compound, no lock fees after period.', 0, 'SPOT', NOW(), NOW());
INSERT IGNORE INTO staking_pools (id, name, token, symbol, description, apr, lockPeriod, minStake, status, isPromoted, `order`, earningFrequency, autoCompound, profitSource, fundAllocation, risks, rewards, earlyWithdrawalFee, walletType, createdAt, updatedAt)
  VALUES ('fd5bbae4-b069-41a2-97d5-3610adf5fd11', 'Ethereum 30-Day', 'Ethereum', 'ETH', '30-day locked staking with weekly compounding.', 8, 30, 100, 'ACTIVE', 1, 0, 'WEEKLY', 1, 'Trading desk yield from active market making and lending.', '70% lending desk, 20% MM, 10% reserve.', 'Smart-contract risk, market volatility, counterparty risk.', 'Daily APR accrual, optional auto-compound, no lock fees after period.', 7, 'SPOT', NOW(), NOW());
INSERT IGNORE INTO staking_pools (id, name, token, symbol, description, apr, lockPeriod, minStake, status, isPromoted, `order`, earningFrequency, autoCompound, profitSource, fundAllocation, risks, rewards, earlyWithdrawalFee, walletType, createdAt, updatedAt)
  VALUES ('4dd4fb0e-8e3b-4f5f-a71f-321fe348f9aa', 'USDT Stable Yield', 'Tether', 'USDT', 'Earn fixed APY on USDT. End-of-term payout.', 12, 60, 1000, 'ACTIVE', 1, 0, 'END_OF_TERM', 0, 'Trading desk yield from active market making and lending.', '70% lending desk, 20% MM, 10% reserve.', 'Smart-contract risk, market volatility, counterparty risk.', 'Daily APR accrual, optional auto-compound, no lock fees after period.', 5, 'SPOT', NOW(), NOW());
INSERT IGNORE INTO staking_pools (id, name, token, symbol, description, apr, lockPeriod, minStake, status, isPromoted, `order`, earningFrequency, autoCompound, profitSource, fundAllocation, risks, rewards, earlyWithdrawalFee, walletType, createdAt, updatedAt)
  VALUES ('e81a530d-5542-4da2-bb91-ccfa2377804e', 'SOL High-Yield', 'Solana', 'SOL', 'Higher APR for longer lock. Auto-compound option.', 15, 90, 500, 'ACTIVE', 0, 0, 'DAILY', 1, 'Trading desk yield from active market making and lending.', '70% lending desk, 20% MM, 10% reserve.', 'Smart-contract risk, market volatility, counterparty risk.', 'Daily APR accrual, optional auto-compound, no lock fees after period.', 10, 'SPOT', NOW(), NOW());

-- ============ P2P PAYMENT METHODS (6 global) ============
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('6ae1285a-a81a-46f6-9197-c7dbb7bbb5d1', 'Bank Transfer', 'bank', 'Local bank wire transfer (SWIFT/SEPA/ACH).', '1-3 hours', '0%', 1, 1, 1, NOW(), NOW());
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('72f134d5-1dd7-4cbe-9bab-73e93bc8a70e', 'Wise', 'wise', 'Wise (formerly TransferWise) multi-currency.', 'Within 1 hour', '0.5%', 1, 2, 1, NOW(), NOW());
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('b15e1509-0985-47d6-b3fb-87a9920128a9', 'PayPal', 'paypal', 'PayPal balance transfer.', 'Instant', '2.9%', 1, 3, 1, NOW(), NOW());
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('1c946feb-56ee-420e-a74f-2e3964955a61', 'Revolut', 'revolut', 'Revolut peer-to-peer transfer.', 'Instant', '0%', 1, 4, 1, NOW(), NOW());
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('25317e0a-1aee-45d5-bcc0-be76fad09f0f', 'Cash in Person', 'cash', 'Face-to-face cash handover.', 'Instant', '0%', 1, 5, 1, NOW(), NOW());
INSERT IGNORE INTO p2p_payment_methods (id, name, icon, description, processingTime, fees, available, popularityRank, isGlobal, createdAt, updatedAt)
  VALUES ('ae6d7fe0-a46a-4f02-b2e4-bd5a739715d9', 'Crypto (USDT)', 'crypto', 'On-chain USDT (TRC20/ERC20).', '5-30 min', 'Network', 1, 6, 1, NOW(), NOW());

-- ============ NFT CATEGORIES (6) ============
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('d268f35f-1844-4818-8e8d-910bbddede3e', 'Art', 'art', 'Digital art, illustrations and generative pieces.', 1, NOW(), NOW());
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('18bda910-e7f9-4664-b5c5-86232cf80c0b', 'Collectibles', 'collectibles', 'Trading cards, profile pictures and limited drops.', 1, NOW(), NOW());
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('f3f5eaed-28b0-4685-90fd-d176f2e2cef7', 'Gaming', 'gaming', 'In-game items, weapons and characters.', 1, NOW(), NOW());
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('88dd273e-8c45-405f-b100-015467d6ec6b', 'Music', 'music', 'Music NFTs, albums and audio collectibles.', 1, NOW(), NOW());
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('15790759-9208-4890-8d5c-50b79e94141d', 'Photography', 'photography', 'Original photography and editorial work.', 1, NOW(), NOW());
INSERT IGNORE INTO nft_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('92faf842-77fe-4b17-8221-80aa8d445907', 'Sports', 'sports', 'Sports moments, memorabilia and athletes.', 1, NOW(), NOW());

-- ============ ECOMMERCE CATEGORIES (5) ============
INSERT IGNORE INTO ecommerce_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('6a0bd3ac-2251-4ba6-9107-0d8ffc07cdbc', 'E-Books', 'e-books', 'Trading guides, technical analysis and crypto handbooks.', 1, NOW(), NOW());
INSERT IGNORE INTO ecommerce_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('016a9f54-d32a-4b02-8653-8bd6f9553799', 'Courses', 'courses', 'Video courses on trading, DeFi and blockchain.', 1, NOW(), NOW());
INSERT IGNORE INTO ecommerce_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('3c59c1a2-4996-4eae-8496-7d9ea4995621', 'Indicators', 'indicators', 'TradingView indicators, MT4/MT5 EAs and scripts.', 1, NOW(), NOW());
INSERT IGNORE INTO ecommerce_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('b0a854f6-020d-4258-b55d-74a15508fb23', 'Templates', 'templates', 'Backtest templates, journal templates, spreadsheets.', 1, NOW(), NOW());
INSERT IGNORE INTO ecommerce_category (id, name, slug, description, status, createdAt, updatedAt) VALUES ('d9975fad-fa5f-4771-bcdb-3febea1ec211', 'Reports', 'reports', 'Premium research reports and market intelligence.', 1, NOW(), NOW());

COMMIT;
-- end of phase 2 sweep

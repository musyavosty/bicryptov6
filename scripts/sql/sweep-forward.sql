-- FORWARD SWEEP — generated 2026-04-30T21:16:42.009Z
  -- Activates: 13 extensions, 2 exchanges (binance/kucoin),
  --            22 exchange currencies, 24 trading pairs,
  --            22 crypto + 5 fiat in the master currency table,
  --            32 platform settings.
  -- Touches NO schema. Single transaction. Idempotent.
  -- Rollback: scripts/sql/sweep-rollback.sql

  START TRANSACTION;

  -- ============ EXTENSIONS (13 on) ============
  UPDATE extension SET status=1 WHERE name='chart_engine';
UPDATE extension SET status=1 WHERE name='wallet_connect';
UPDATE extension SET status=1 WHERE name='knowledge_base';
UPDATE extension SET status=1 WHERE name='ecosystem';
UPDATE extension SET status=1 WHERE name='staking';
UPDATE extension SET status=1 WHERE name='gateway';
UPDATE extension SET status=1 WHERE name='p2p';
UPDATE extension SET status=1 WHERE name='nft';
UPDATE extension SET status=1 WHERE name='ico';
UPDATE extension SET status=1 WHERE name='ecommerce';
UPDATE extension SET status=1 WHERE name='forex';
UPDATE extension SET status=1 WHERE name='mailwizard';
UPDATE extension SET status=1 WHERE name='copy_trading';

-- ============ EXCHANGES (2 on) ============
UPDATE exchange SET status=1 WHERE name='binance';
UPDATE exchange SET status=1 WHERE name='kucoin';

-- ============ EXCHANGE CURRENCIES (22) ============
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('9651d4c5-d543-4142-86f3-e44dcad77dad', 'BTC', 'Bitcoin', 8, 1, 0.0005)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('34570b76-e218-483c-9a68-e4a7afb5f28d', 'ETH', 'Ethereum', 8, 1, 0.005)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('a53e631e-bbef-4c78-a2f2-6f45d8803780', 'USDT', 'Tether', 4, 1, 1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('35ec4813-7ec3-46c7-a253-f9f38edf630f', 'USDC', 'USD Coin', 4, 1, 1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('0592fda9-be90-4188-a19c-754134623743', 'BNB', 'Binance Coin', 8, 1, 0.001)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('bdb52197-8bdd-47bf-9df5-0630cc3b2637', 'SOL', 'Solana', 6, 1, 0.01)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('6a0e00a8-cde4-4e31-a84b-93d8b027754c', 'XRP', 'XRP', 4, 1, 0.25)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('608e78b8-0f1d-443f-a926-93c5bc230917', 'ADA', 'Cardano', 6, 1, 1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('f4aef87b-923f-408a-b7c9-cde5e48b1bed', 'DOGE', 'Dogecoin', 4, 1, 5)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('b1d2a628-57e0-46c3-a0cb-44dc31c89b26', 'MATIC', 'Polygon', 6, 1, 0.1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('aca45ee3-5c23-4132-9cbf-2e36dea1f78b', 'AVAX', 'Avalanche', 6, 1, 0.01)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('18bb9930-367e-4d28-9dd5-1d92e01d9627', 'LINK', 'Chainlink', 6, 1, 0.5)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('45bd86fa-a2a0-4300-b625-2be2d6a51658', 'DOT', 'Polkadot', 6, 1, 0.1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('d2e6cb4f-3c24-4a02-8d2f-b9469fce8275', 'LTC', 'Litecoin', 8, 1, 0.001)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('44ffa4c4-7795-4f1f-ba62-a7eede010382', 'TRX', 'TRON', 6, 1, 1)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('5d34eb37-a222-4d9b-8f44-047390c85257', 'BCH', 'Bitcoin Cash', 8, 1, 0.001)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('a6d4b95c-1e26-4634-adde-90267e3a9460', 'ATOM', 'Cosmos', 6, 1, 0.005)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('68ad6afd-d489-4e88-91a8-2cd304cd5dff', 'NEAR', 'NEAR Protocol', 6, 1, 0.01)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('ac4fbc17-cf06-4ebb-8a76-189e5abcc902', 'UNI', 'Uniswap', 6, 1, 0.5)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('e79631c0-fb74-45b8-91c4-c564c3334162', 'FIL', 'Filecoin', 6, 1, 0.01)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('5429588c-904b-4d05-ba76-69d4964d142b', 'ARB', 'Arbitrum', 6, 1, 0.5)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);
INSERT INTO exchange_currency (id, currency, name, `precision`, status, fee) VALUES ('d560ac9e-b006-40f5-b577-58a275fae731', 'OP', 'Optimism', 6, 1, 0.5)
  ON DUPLICATE KEY UPDATE name=VALUES(name), `precision`=VALUES(`precision`), status=1, fee=VALUES(fee);

-- ============ TRADING PAIRS (24) ============
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('fd6f49a5-918a-4a9a-978b-07e06a0ad9ed', 'BTC/USDT', 'BTC', 1, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('4e022445-5f1d-4e76-9a43-e914eef46c19', 'ETH/USDT', 'ETH', 1, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('3fec5d12-923b-42a0-b3d0-00925f84a4fe', 'BNB/USDT', 'BNB', 1, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('aba6f411-5bd5-44ad-8f4f-92471a567178', 'SOL/USDT', 'SOL', 1, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('f13134aa-b986-4a8c-a560-25a8e082f165', 'XRP/USDT', 'XRP', 1, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('7958ddf8-1d17-4b05-a6fa-fd8662a5f3df', 'ADA/USDT', 'ADA', 0, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('421800ee-0b40-44db-9881-44a85a604b76', 'DOGE/USDT', 'DOGE', 1, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('3b59a3f5-197e-4b1a-82cc-3d7c5283b4ba', 'MATIC/USDT', 'MATIC', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('c796e6bc-d673-4ac5-aeb5-63e88d1d01e3', 'AVAX/USDT', 'AVAX', 0, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('214a94a2-dafb-4771-a33a-32f22923df1e', 'LINK/USDT', 'LINK', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('6809bad8-b82e-45cc-9491-28cb1f88b741', 'DOT/USDT', 'DOT', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('64c4adae-8091-487e-b76d-6923fd3d6d4b', 'LTC/USDT', 'LTC', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('c2823a48-615b-4f14-b47c-cb057961a994', 'TRX/USDT', 'TRX', 0, 1, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('c45a007a-a187-494e-a413-13201d15b779', 'BCH/USDT', 'BCH', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('d3b0ba9d-fdbf-46c6-bc7b-a86e7e5f2784', 'ATOM/USDT', 'ATOM', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('d3dc1823-3585-463e-b5d7-d27bc47d8000', 'NEAR/USDT', 'NEAR', 1, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('81db4ea6-7758-4a8e-a9d0-d44109052ad8', 'UNI/USDT', 'UNI', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('5df35ee8-37ce-4015-9d7b-51e3e37473a4', 'FIL/USDT', 'FIL', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('842ddce5-eb95-48b4-be17-a7877447030a', 'ARB/USDT', 'ARB', 1, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('25670fc3-f94b-4593-85eb-022f3a86e97f', 'OP/USDT', 'OP', 1, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('b80b0989-b5b8-4005-87be-dc5c7b04b428', 'BTC', 'ETH', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('ae1feeff-f4ad-49d1-b763-e66127a38423', 'BTC', 'SOL', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('1708013c-f92b-47d8-91ef-9f19f765cfee', 'ETH', 'LINK', 0, 0, 1);
INSERT IGNORE INTO exchange_market (id, pair, currency, isTrending, isHot, status) VALUES ('63b9c2be-8d8c-43a8-bae3-b99392bf2608', 'USDT', 'USDC', 0, 0, 1);

-- ============ ASSET CURRENCIES (22 crypto + 5 fiat) ============
UPDATE currency SET status=1 WHERE id='BTC';
UPDATE currency SET status=1 WHERE id='ETH';
UPDATE currency SET status=1 WHERE id='USDT';
UPDATE currency SET status=1 WHERE id='USDC';
UPDATE currency SET status=1 WHERE id='BNB';
UPDATE currency SET status=1 WHERE id='SOL';
UPDATE currency SET status=1 WHERE id='XRP';
UPDATE currency SET status=1 WHERE id='ADA';
UPDATE currency SET status=1 WHERE id='DOGE';
UPDATE currency SET status=1 WHERE id='MATIC';
UPDATE currency SET status=1 WHERE id='AVAX';
UPDATE currency SET status=1 WHERE id='LINK';
UPDATE currency SET status=1 WHERE id='DOT';
UPDATE currency SET status=1 WHERE id='LTC';
UPDATE currency SET status=1 WHERE id='TRX';
UPDATE currency SET status=1 WHERE id='BCH';
UPDATE currency SET status=1 WHERE id='ATOM';
UPDATE currency SET status=1 WHERE id='NEAR';
UPDATE currency SET status=1 WHERE id='UNI';
UPDATE currency SET status=1 WHERE id='FIL';
UPDATE currency SET status=1 WHERE id='ARB';
UPDATE currency SET status=1 WHERE id='OP';
UPDATE currency SET status=1 WHERE id='USD';
UPDATE currency SET status=1 WHERE id='EUR';
UPDATE currency SET status=1 WHERE id='GBP';
UPDATE currency SET status=1 WHERE id='JPY';
UPDATE currency SET status=1 WHERE id='AUD';

-- ============ SETTINGS (33) ============
INSERT INTO settings (`key`, value) VALUES ('spotStatus', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('spotWallets', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('fiatWallets', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('walletTransferFeePercentage', '0.1') ON DUPLICATE KEY UPDATE value='0.1';
INSERT INTO settings (`key`, value) VALUES ('spotWithdrawFee', '0.1') ON DUPLICATE KEY UPDATE value='0.1';
INSERT INTO settings (`key`, value) VALUES ('withdrawApproval', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('withdrawChainFee', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('depositExpiration', '30') ON DUPLICATE KEY UPDATE value='30';
INSERT INTO settings (`key`, value) VALUES ('binaryStatus', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('binaryPracticeStatus', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('investment', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('verifyEmailStatus', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('twoFactorStatus', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('twoFactorAppStatus', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('twoFactorEmailStatus', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('twoFactorSmsStatus', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('powCaptchaStatus', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('powCaptchaDifficulty', 'medium') ON DUPLICATE KEY UPDATE value='medium';
INSERT INTO settings (`key`, value) VALUES ('p2pAutoApproveOffers', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('p2pDefaultPaymentWindow', '30') ON DUPLICATE KEY UPDATE value='30';
INSERT INTO settings (`key`, value) VALUES ('p2pMinimumTradeAmount', '10') ON DUPLICATE KEY UPDATE value='10';
INSERT INTO settings (`key`, value) VALUES ('p2pMaximumTradeAmount', '10000') ON DUPLICATE KEY UPDATE value='10000';
INSERT INTO settings (`key`, value) VALUES ('icoMinInvestmentAmount', '10') ON DUPLICATE KEY UPDATE value='10';
INSERT INTO settings (`key`, value) VALUES ('moderateComments', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('autoApproveAuthors', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('showRelatedPosts', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('referralApprovalRequired', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('stakingDefaultAprCalculationMethod', 'FLAT') ON DUPLICATE KEY UPDATE value='FLAT';
INSERT INTO settings (`key`, value) VALUES ('stakingCompoundFrequency', 'DAILY') ON DUPLICATE KEY UPDATE value='DAILY';
INSERT INTO settings (`key`, value) VALUES ('stakingAutomaticEarningsDistribution', 'true') ON DUPLICATE KEY UPDATE value='true';
INSERT INTO settings (`key`, value) VALUES ('siteMaintenanceMode', 'false') ON DUPLICATE KEY UPDATE value='false';
INSERT INTO settings (`key`, value) VALUES ('defaultExchange', 'binance') ON DUPLICATE KEY UPDATE value='binance';
INSERT INTO settings (`key`, value) VALUES ('siteCurrency', 'USD') ON DUPLICATE KEY UPDATE value='USD';

COMMIT;
-- end of forward sweep

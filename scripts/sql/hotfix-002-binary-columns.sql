-- hotfix-002-binary-columns.sql
-- The initial.sql schema creates binary_market WITHOUT minAmount/maxAmount.
-- Sequelize adds these columns when the backend first starts and syncs models.
-- BUT: the phase 2 sweep runs BEFORE the backend starts, so it hits:
--   ER_BAD_FIELD_ERROR: Unknown column 'minAmount' in 'field list'
-- and all 76 phase-2 statements (binary markets, futures, investments, etc.) fail.
--
-- This hotfix adds the columns before the sweep runs so phase 2 always succeeds,
-- even on a brand-new empty database.
-- Idempotent: IF NOT EXISTS prevents errors when columns already exist.

ALTER TABLE binary_market
  ADD COLUMN IF NOT EXISTS minAmount DECIMAL(16,8) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS maxAmount DECIMAL(16,8) NOT NULL DEFAULT 10000;

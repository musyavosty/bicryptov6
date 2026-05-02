"use strict";
const { v4: uuidv4 } = require("uuid");

/**
 * Fix invalid LINK/LINK/ETH market pair.
 *
 * The exchangeMarket table stores currency and pair as separate columns.
 * A row with currency='LINK' and pair='LINK/ETH' produces the symbol
 * 'LINK/LINK/ETH' when concatenated, which is not a valid Binance market
 * and causes the processCurrenciesPrices cron job to fail every 2 minutes.
 *
 * This migration removes the malformed entry and ensures LINK/USDT exists
 * as a valid replacement (if no LINK/USDT row is already present).
 */
module.exports = {
  async up(queryInterface) {
    // Remove the malformed entry: currency='LINK', pair='LINK/ETH'
    await queryInterface.sequelize.query(
      `DELETE FROM exchange_market WHERE currency = 'LINK' AND pair = 'LINK/ETH'`
    );

    // Insert LINK/USDT only if it does not already exist
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM exchange_market WHERE currency = 'LINK' AND pair = 'USDT' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert("exchange_market", [
        {
          id: uuidv4(),
          currency: "LINK",
          pair: "USDT",
          isTrending: false,
          isHot: false,
          metadata: JSON.stringify({
            precision: { price: 4, amount: 2 },
            limits: {
              amount: { min: 0.01, max: null },
              price: { min: 0, max: null },
              cost: { min: 0.0001, max: 9000000 },
              leverage: {},
            },
            taker: 0.001,
            maker: 0.001,
          }),
          status: false,
        },
      ]);
    }
  },

  async down(queryInterface) {
    // Remove the LINK/USDT row added by this migration
    await queryInterface.sequelize.query(
      `DELETE FROM exchange_market WHERE currency = 'LINK' AND pair = 'USDT'`
    );

    // Re-insert the original (malformed) row — only needed for full rollback parity
    await queryInterface.bulkInsert("exchange_market", [
      {
        id: uuidv4(),
        currency: "LINK",
        pair: "LINK/ETH",
        isTrending: false,
        isHot: false,
        metadata: null,
        status: false,
      },
    ]);
  },
};

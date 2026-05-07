#!/usr/bin/env node
/**
 * scripts/populate-market-metadata.js
 *
 * Populates exchange_market.metadata and futures_market.metadata with
 * real Binance market specs (limits, precision, fees).
 *
 * This is idempotent — safe to run on every deploy.
 * Called from railway-start.sh after the data sweep.
 *
 * Usage:  node scripts/populate-market-metadata.js
 */
"use strict";
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mysql = require("mysql2/promise");

const BINANCE_SPECS = {
  "BTC/USDT":  { min: 0.00001,  max: 9000,    ap: 5, pp: 2 },
  "ETH/USDT":  { min: 0.0001,   max: 100000,  ap: 4, pp: 2 },
  "BNB/USDT":  { min: 0.001,    max: 100000,  ap: 3, pp: 2 },
  "SOL/USDT":  { min: 0.01,     max: 100000,  ap: 2, pp: 2 },
  "XRP/USDT":  { min: 0.1,      max: 9000000, ap: 1, pp: 4 },
  "ADA/USDT":  { min: 0.1,      max: 9000000, ap: 1, pp: 4 },
  "DOGE/USDT": { min: 1,        max: 9000000, ap: 0, pp: 5 },
  "MATIC/USDT":{ min: 0.1,      max: 9000000, ap: 1, pp: 4 },
  "AVAX/USDT": { min: 0.01,     max: 100000,  ap: 2, pp: 2 },
  "LINK/USDT": { min: 0.01,     max: 100000,  ap: 2, pp: 3 },
  "DOT/USDT":  { min: 0.01,     max: 100000,  ap: 2, pp: 3 },
  "LTC/USDT":  { min: 0.001,    max: 100000,  ap: 3, pp: 2 },
  "TRX/USDT":  { min: 1,        max: 9000000, ap: 0, pp: 5 },
  "BCH/USDT":  { min: 0.001,    max: 100000,  ap: 3, pp: 2 },
  "ATOM/USDT": { min: 0.01,     max: 100000,  ap: 2, pp: 3 },
  "NEAR/USDT": { min: 0.1,      max: 100000,  ap: 1, pp: 4 },
  "UNI/USDT":  { min: 0.01,     max: 100000,  ap: 2, pp: 3 },
  "FIL/USDT":  { min: 0.01,     max: 100000,  ap: 2, pp: 3 },
  "ARB/USDT":  { min: 0.1,      max: 9000000, ap: 1, pp: 4 },
  "OP/USDT":   { min: 0.1,      max: 9000000, ap: 1, pp: 4 },
  "ETH/BTC":   { min: 0.0001,   max: 100000,  ap: 4, pp: 6 },
  "SOL/BTC":   { min: 0.01,     max: 100000,  ap: 2, pp: 7 },
  "LINK/ETH":  { min: 0.01,     max: 100000,  ap: 2, pp: 6 },
  "USDC/USDT": { min: 1,        max: 9000000, ap: 0, pp: 4 },
};

function buildMetadata(symbol) {
  const [base, quote] = symbol.split("/");
  const s = BINANCE_SPECS[symbol] || { min: 0.001, max: 100000, ap: 3, pp: 4 };
  return JSON.stringify({
    id: symbol.replace("/", "").toLowerCase(),
    symbol, base, quote,
    active: true,
    limits: {
      amount: { min: s.min, max: s.max },
      price: { min: 0.000001, max: 1000000 },
      cost: { min: 1, max: 9000000 },
    },
    precision: { amount: s.ap, price: s.pp },
    fees: { trading: { taker: 0.001, maker: 0.001 } },
  });
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "railway",
    connectTimeout: 20000,
  });

  const [em] = await conn.query("SELECT id, currency, pair FROM exchange_market");
  for (const r of em) {
    await conn.query("UPDATE exchange_market SET metadata=? WHERE id=?",
      [buildMetadata(`${r.currency}/${r.pair}`), r.id]);
  }
  console.log(`[metadata] exchange_market: ${em.length} rows updated`);

  const [fm] = await conn.query("SELECT id, currency, pair FROM futures_market");
  for (const r of fm) {
    await conn.query("UPDATE futures_market SET metadata=? WHERE id=?",
      [buildMetadata(`${r.currency}/${r.pair}`), r.id]);
  }
  console.log(`[metadata] futures_market: ${fm.length} rows updated`);

  await conn.end();
  console.log("[metadata] Done.");
})().catch((e) => {
  console.error("[metadata] FAILED:", e.message);
  process.exit(1);
});

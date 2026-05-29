#!/usr/bin/env node
/**
 * Streaming SQL importer used as a fallback when the `mysql` CLI is
 * unavailable (e.g. on Railway where Nixpacks may not include it).
 *
 * Usage:  node scripts/import-sql.js path/to/dump.sql
 *
 * Reads DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME from env.
 * Splits on `;` at end-of-line, ignores MySQL hint comments,
 * and runs each statement sequentially with foreign keys disabled.
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/import-sql.js <file.sql>");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(file), "utf8");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  // Relax session sql_mode for the import: the dump was produced on a server
  // with looser defaults than MySQL 8/9 strict mode. Setting sql_mode='' at
  // the session level disables NO_ZERO_DATE, STRICT_TRANS_TABLES, etc. for
  // every statement in this connection — works on MySQL 8.x through 9.x.
  await conn.query("SET SESSION sql_mode=''");
  await conn.query("SET SESSION time_zone='+00:00'");
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  await conn.query("SET UNIQUE_CHECKS=0");
  await conn.query("SET NAMES utf8mb4");

  // Split on `;` at end of line (rough but works for mysqldump output)
  const stmts = sql
    .split(/;\s*\n/g)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !s.startsWith("--") &&
        !/^\/\*!.*\*\/$/.test(s)
    );

  console.log("Executing " + stmts.length + " statements...");
  let i = 0;
  for (const stmt of stmts) {
    i++;
    try {
      await conn.query(stmt);
    } catch (err) {
      console.error("Statement " + i + " failed: " + err.message);
      console.error(stmt.slice(0, 200));
      throw err;
    }
    if (i % 50 === 0) console.log("  ..." + i + "/" + stmts.length);
  }

  await conn.query("SET FOREIGN_KEY_CHECKS=1");
  await conn.query("SET UNIQUE_CHECKS=1");
  await conn.end();
  console.log("Import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

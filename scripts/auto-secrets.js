#!/usr/bin/env node
/**
 * auto-secrets.js
 *
 * Generates all required application secrets on first boot and stores them
 * in a MySQL table so they persist across redeploys WITHOUT needing to be
 * set as Railway environment variables.
 *
 * On first boot  → generates secrets, stores in DB, prints shell exports
 * On every boot  → reads stored secrets from DB, prints shell exports
 * If env var set → uses the env var value (env always wins)
 *
 * Usage (in railway-start.sh, after MySQL is ready):
 *   eval $(node scripts/auto-secrets.js 2>/tmp/auto-secrets.err) || true
 *   cat /tmp/auto-secrets.err >&2
 *
 * Output: one "export KEY='value'" line per secret — eval'd by the caller.
 */

const crypto = require('crypto');
const mysql  = require('mysql2/promise');

const log = (msg) => process.stderr.write(`[auto-secrets] ${msg}\n`);

async function getDb() {
  return mysql.createConnection({
    host:     process.env.DB_HOST     || process.env.MYSQLHOST     || '127.0.0.1',
    port:    +(process.env.DB_PORT    || process.env.MYSQLPORT     || 3306),
    user:     process.env.DB_USER     || process.env.MYSQLUSER     || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME     || process.env.MYSQLDATABASE || 'railway',
    ssl: { rejectUnauthorized: false },
    connectTimeout: 10000,
  });
}

function randomHex(bytes) { return crypto.randomBytes(bytes).toString('hex'); }
function randomB64(bytes)  { return crypto.randomBytes(bytes).toString('base64url'); }

function generateEncryptionKey() {
  const masterKey  = randomHex(32);
  const passphrase = randomB64(24);
  const salt       = crypto.randomBytes(16);
  const iv         = crypto.randomBytes(12);
  const derived    = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  const cipher     = crypto.createCipheriv('aes-256-gcm', derived, iv);
  let   enc        = cipher.update(masterKey, 'utf8', 'hex');
  enc             += cipher.final('hex');
  const authTag    = cipher.getAuthTag().toString('hex');
  const encKey     = [iv.toString('hex'), authTag, enc, salt.toString('hex')].join(':');
  return { encKey, passphrase, masterKey };
}

async function main() {
  const db = await getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS _deploy_secrets (
      \`key\`     VARCHAR(255)  NOT NULL PRIMARY KEY,
      \`value\`   TEXT          NOT NULL,
      createdAt   DATETIME      DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const exports = {};

  async function getOrCreate(key, generator) {
    if (process.env[key]) {
      exports[key] = process.env[key];
      return;
    }
    const [[row]] = await db.query('SELECT `value` FROM _deploy_secrets WHERE `key`=?', [key]);
    if (row) {
      exports[key] = row.value;
    } else {
      const value = typeof generator === 'function' ? generator() : generator;
      await db.query(
        'INSERT IGNORE INTO _deploy_secrets (`key`,`value`) VALUES (?,?)',
        [key, value]
      );
      exports[key] = value;
      log(`Generated new ${key}`);
    }
  }

  // JWT / token secrets
  await getOrCreate('APP_ACCESS_TOKEN_SECRET',  () => randomHex(64));
  await getOrCreate('APP_REFRESH_TOKEN_SECRET', () => randomHex(64));
  await getOrCreate('APP_VERIFY_TOKEN_SECRET',  () => randomHex(64));
  await getOrCreate('APP_RESET_TOKEN_SECRET',   () => randomHex(64));

  // Ecosystem wallet encryption key pair (stored together, generated together)
  const needEnc = !process.env.ENCRYPTED_ENCRYPTION_KEY || !process.env.ENCRYPTION_KEY_PASSPHRASE;
  if (needEnc) {
    const [[ek]] = await db.query(
      'SELECT `value` FROM _deploy_secrets WHERE `key`=?', ['ENCRYPTED_ENCRYPTION_KEY']
    );
    const [[pp]] = await db.query(
      'SELECT `value` FROM _deploy_secrets WHERE `key`=?', ['ENCRYPTION_KEY_PASSPHRASE']
    );
    if (ek && pp) {
      exports.ENCRYPTED_ENCRYPTION_KEY  = ek.value;
      exports.ENCRYPTION_KEY_PASSPHRASE = pp.value;
    } else {
      const { encKey, passphrase, masterKey } = generateEncryptionKey();
      await db.query(
        'INSERT IGNORE INTO _deploy_secrets (`key`,`value`) VALUES (?,?)',
        ['ENCRYPTED_ENCRYPTION_KEY', encKey]
      );
      await db.query(
        'INSERT IGNORE INTO _deploy_secrets (`key`,`value`) VALUES (?,?)',
        ['ENCRYPTION_KEY_PASSPHRASE', passphrase]
      );
      exports.ENCRYPTED_ENCRYPTION_KEY  = encKey;
      exports.ENCRYPTION_KEY_PASSPHRASE = passphrase;
      log('Generated new ENCRYPTED_ENCRYPTION_KEY + ENCRYPTION_KEY_PASSPHRASE');
      log('================================================================');
      log('MASTER KEY — back this up in a password manager RIGHT NOW:');
      log(masterKey);
      log('If you lose it AND the DB, on-chain wallet funds are unrecoverable.');
      log('================================================================');
    }
  }

  await db.end();

  // Emit shell exports — eval'd by railway-start.sh
  for (const [k, v] of Object.entries(exports)) {
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
    console.log(`export ${k}='${escaped}'`);
  }
}

main().catch(e => {
  log(`ERROR: ${e.message} — continuing without auto-secrets`);
  process.exit(0); // never block startup
});

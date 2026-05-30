#!/usr/bin/env node
/**
 * generate-encryption-key.js
 *
 * Generates the two Railway environment variables required for the ecosystem
 * wallet vault (on-chain deposits and withdrawals).
 *
 * Run once on a fresh deploy:
 *   node scripts/generate-encryption-key.js
 *
 * Then set the two output values as Railway environment variables:
 *   ENCRYPTED_ENCRYPTION_KEY   (the long colon-separated hex string)
 *   ENCRYPTION_KEY_PASSPHRASE  (the base64url passphrase)
 *
 * WARNING: Back up the "Master key" printed below somewhere safe (password
 * manager, offline storage). If you lose it AND the env vars, all ecosystem
 * wallet private keys become permanently unreadable and funds are lost.
 *
 * WARNING: NEVER change these env vars after ecosystem wallets have been
 * created. Changing them makes all existing wallet private keys unreadable.
 */

const crypto = require('crypto');

// 1. Generate a random 32-byte master key (the actual AES key protecting wallets)
const masterKey = crypto.randomBytes(32).toString('hex');

// 2. Generate a strong random passphrase
const passphrase = crypto.randomBytes(24).toString('base64url');

// 3. Encrypt the master key with the passphrase
//    Format: iv:authTag:cipherText:salt (all hex) — must match encrypt.js exactly
const salt       = crypto.randomBytes(16);
const iv         = crypto.randomBytes(12);
const derivedKey = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
const cipher     = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
let encrypted    = cipher.update(masterKey, 'utf8', 'hex');
encrypted       += cipher.final('hex');
const authTag    = cipher.getAuthTag().toString('hex');
const ENCRYPTED_ENCRYPTION_KEY = [iv.toString('hex'), authTag, encrypted, salt.toString('hex')].join(':');

// 4. Verify the round-trip before printing anything
const [ivH, atH, cH, saltH] = ENCRYPTED_ENCRYPTION_KEY.split(':').map(p => Buffer.from(p, 'hex'));
const dk2 = crypto.pbkdf2Sync(passphrase, saltH, 100000, 32, 'sha512');
const dec = crypto.createDecipheriv('aes-256-gcm', dk2, ivH);
dec.setAuthTag(atH);
let plain = dec.update(cH, undefined, 'utf8');
plain += dec.final('utf8');
if (plain !== masterKey) {
  console.error('ERROR: Round-trip verification failed — do NOT use these values.');
  process.exit(1);
}

console.log('\n========== ECOSYSTEM ENCRYPTION KEY SETUP ==========\n');
console.log('Set these two values as Railway environment variables:\n');
console.log('ENCRYPTED_ENCRYPTION_KEY=');
console.log(ENCRYPTED_ENCRYPTION_KEY);
console.log('');
console.log('ENCRYPTION_KEY_PASSPHRASE=');
console.log(passphrase);
console.log('');
console.log('---- BACK THIS UP OFFLINE (password manager / secure note) ----');
console.log('Master key (needed to recover wallets if env vars are lost):');
console.log(masterKey);
console.log('----------------------------------------------------------------');
console.log('\nRound-trip verification: PASS ✓');
console.log('\nWARNING: Never change ENCRYPTED_ENCRYPTION_KEY or');
console.log('ENCRYPTION_KEY_PASSPHRASE after ecosystem wallets are created.');
console.log('Doing so makes all wallet private keys permanently unreadable.\n');

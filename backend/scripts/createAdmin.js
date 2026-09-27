const readline = require('readline');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { ensureSchemaInitialized } = require('../database/autoMigrate');
const { ensureAuthSchema } = require('../database/authMigration');

function prompt(rl, question, hidden = false) {
  return new Promise(resolve => {
    if (!hidden) {
      rl.question(question, resolve);
      return;
    }
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    let value = '';
    const onData = key => {
      const char = key.toString();
      if (char === '\u0003') process.exit(1);
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(value);
      } else if (char === '\u0008' || char === '\u007f') {
        value = value.slice(0, -1);
      } else if (char >= ' ') {
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

async function main() {
  if (!process.stdin.isTTY) throw new Error('Run this command from an interactive terminal so the password is not echoed.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('replace_with') ||
      process.env.JWT_SECRET.toLowerCase().includes('change_in_production')) {
    throw new Error('Configure a unique JWT_SECRET of at least 32 characters in backend/.env first.');
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (!await ensureSchemaInitialized() || !await ensureAuthSchema()) {
      throw new Error('Database schema could not be initialized. Check the database connection and logs.');
    }
    const name = (await prompt(rl, 'Admin name: ')).trim();
    const email = (await prompt(rl, 'Admin email: ')).trim().toLowerCase();
    rl.close();
    const password = await prompt(null, 'Admin password: ', true);
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 12 || Buffer.byteLength(password, 'utf8') > 72 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      throw new Error('Enter a valid name and email; password must be 12-72 characters and include uppercase, lowercase, and a number.');
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) throw new Error('That email already has an account. No changes were made.');
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(`INSERT INTO users (name, email, password_hash, role, is_active, account_status)
      VALUES (?, ?, ?, 'ADMIN', TRUE, 'ACTIVE')`, [name, email, passwordHash]);
    console.log(`Administrator account created for ${email}.`);
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch(error => {
  console.error('Could not create administrator:', error.message);
  process.exitCode = 1;
});

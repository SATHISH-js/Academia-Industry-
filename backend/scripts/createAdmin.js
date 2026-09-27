const readline = require('readline');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { ensureSchemaInitialized } = require('../database/autoMigrate');
const { ensureTrainingSchema } = require('../database/trainingMigration');

function prompt(rl, question, hidden = false) {
  return new Promise(resolve => {
    if (!hidden) {
      rl.question(question, resolve);
      return;
    }
    if (!process.stdin.isTTY) {
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
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (!await ensureSchemaInitialized() || !await ensureTrainingSchema()) {
      throw new Error('Database schema could not be initialized. Check the database connection and logs.');
    }
    const name = (await prompt(rl, 'Admin name: ')).trim();
    const email = (await prompt(rl, 'Admin email: ')).trim().toLowerCase();
    let password;
    if (process.stdin.isTTY) {
      rl.close();
      password = await prompt(null, 'Admin password: ', true);
    } else {
      password = await prompt(rl, 'Admin password: ', true);
    }
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12) {
      throw new Error('Enter a valid name and email; password must be at least 12 characters.');
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) throw new Error('That email already has an account. No changes were made.');
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, \'ADMIN\', TRUE)', [name, email, passwordHash]);
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

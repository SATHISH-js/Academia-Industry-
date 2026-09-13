const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  console.log('[Migration] Starting Industry Portal Migration...');
  const sqlPath = path.join(__dirname, '../../database/migration_industry_features.sql');
  const rawSql = fs.readFileSync(sqlPath, 'utf8');

  // Strip single-line comments (-- ...)
  const cleanSql = rawSql
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('--') ? '' : line;
    })
    .join('\n');

  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));

  const connection = await pool.getConnection();
  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`[Executing #${i + 1}] ${stmt.substring(0, 70).replace(/\s+/g, ' ')}...`);
      await connection.query(stmt);
    }
    console.log('[Migration] Successfully executed all industry tables & seed queries ✔');
  } catch (err) {
    console.error('[Migration Error]', err.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();

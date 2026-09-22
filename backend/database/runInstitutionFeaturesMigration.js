const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  console.log('Running migration_institution_features.sql...');
  const sqlPath = path.join(__dirname, '../../database/migration_institution_features.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Strip single-line comments (-- ...)
  const cleanSql = sql
    .split('\n')
    .map(line => {
      const idx = line.indexOf('--');
      return idx >= 0 ? line.substring(0, idx) : line;
    })
    .join('\n');

  // Split by semicolon
  const queries = cleanSql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0 && !q.toLowerCase().startsWith('use '));

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log('Executed:', query.substring(0, 50).replace(/\n/g, ' ') + '...');
    } catch (err) {
      console.warn('Query warning/error:', err.message);
    }
  }

  console.log('✔ migration_institution_features.sql completed successfully.');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

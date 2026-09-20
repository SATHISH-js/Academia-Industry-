const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMig() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'academia_industry_portal',
    multipleStatements: true
  });

  console.log('[Migration] Connected to database');

  const cols = [
    { name: 'badge_awarded', def: 'BOOLEAN DEFAULT FALSE' },
    { name: 'score_percentage', def: 'DECIMAL(5,2) DEFAULT NULL' },
    { name: 'is_verified', def: 'BOOLEAN DEFAULT FALSE' },
    { name: 'verification_quiz_id', def: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'verified_at', def: 'TIMESTAMP NULL DEFAULT NULL' },
    { name: 'skills_detected', def: 'JSON DEFAULT NULL' }
  ];

  for (const c of cols) {
    const [rows] = await connection.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [process.env.DB_NAME || 'academia_industry_portal', 'student_certifications', c.name]
    );
    if (rows.length === 0) {
      await connection.query('ALTER TABLE student_certifications ADD COLUMN ' + c.name + ' ' + c.def);
      console.log('Added column ' + c.name + ' to student_certifications');
    } else {
      console.log('Column ' + c.name + ' already exists in student_certifications');
    }
  }

  const sqlPath = path.join(__dirname, '..', '..', 'database', 'migration_certificate_verification.sql');
  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await connection.query(sql);
    console.log('[Migration] Executed migration_certificate_verification.sql successfully!');
  } else {
    console.warn('[Migration] SQL file not found at', sqlPath);
  }

  await connection.end();
  console.log('[Migration] All tasks completed.');
}

runMig().catch(err => {
  console.error('[Migration Error]:', err.message);
  process.exit(1);
});

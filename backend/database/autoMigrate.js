const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

/**
 * Automatically checks if database tables (e.g. 'users') exist.
 * If tables are missing (e.g. fresh TiDB Cloud Serverless or cloud MySQL),
 * it executes schema.sql and seed scripts automatically.
 */
async function ensureSchemaInitialized() {
  try {
    // 1. Get current connected database name
    const [dbResult] = await pool.query('SELECT DATABASE() as currentDb');
    const currentDb = dbResult[0]?.currentDb;

    if (!currentDb) {
      console.warn('[Database Auto-Init] Warning: No active database selected in MySQL session.');
      return false;
    }

    console.log(`[Database Auto-Init] Connected database session: "${currentDb}"`);

    // 2. Check if the 'users' table exists in the current database
    const [tableCheck] = await pool.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'`,
      [currentDb]
    );

    if (tableCheck[0]?.count > 0) {
      console.log(`[Database Auto-Init] Core table "users" verified in "${currentDb}". Database is ready.`);
      return true;
    }

    console.log(`[Database Auto-Init] Table "users" NOT found in "${currentDb}". Running automatic schema initialization...`);

    // 3. Helper to strip CREATE DATABASE and USE statements so tables are created inside currentDb
    const sanitizeSql = (sql) => {
      return sql
        .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+[^;]+;/gi, '')
        .replace(/USE\s+[^;]+;/gi, '');
    };

    // 4. Run schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`[Database Auto-Init] Executing schema.sql into "${currentDb}"...`);
      const schemaSql = sanitizeSql(fs.readFileSync(schemaPath, 'utf8'));
      await pool.query(schemaSql);
      console.log(`[Database Auto-Init] Core schema and tables created successfully.`);
    }

    // 5. Run seed.sql
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`[Database Auto-Init] Seeding initial data...`);
      const seedSql = sanitizeSql(fs.readFileSync(seedPath, 'utf8'));
      await pool.query(seedSql);
      console.log(`[Database Auto-Init] Initial seed data inserted successfully.`);
    }

    // 6. Run feature migrations
    const migrationFiles = [
      'migration_personalized_roadmaps_and_assessments.sql',
      'migration_institution_mou.sql',
      'migration_institution_features.sql',
      'migration_industry_features.sql',
      'migration_certificate_verification.sql'
    ];

    for (const migFile of migrationFiles) {
      const migPath = path.join(__dirname, '..', '..', 'database', migFile);
      if (fs.existsSync(migPath)) {
        try {
          const migSql = sanitizeSql(fs.readFileSync(migPath, 'utf8'));
          await pool.query(migSql);
          console.log(`[Database Auto-Init] Applied ${migFile} successfully.`);
        } catch (migErr) {
          console.warn(`[Database Auto-Init] Notice for ${migFile}:`, migErr.message);
        }
      }
    }

    console.log(`[Database Auto-Init] All tables created and database is fully initialized!`);
    return true;
  } catch (err) {
    console.error(`[Database Auto-Init Error] Failed to initialize schema:`, err.message);
    return false;
  }
}

module.exports = { ensureSchemaInitialized };

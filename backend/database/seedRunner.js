const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigrationAndSeed() {
  console.log('[Seed Runner] Starting Database Migration & Seed...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  let connection;
  try {
    // Step 1: Connect to MySQL server (without specific DB initially)
    connection = await mysql.createConnection(config);
    console.log(`[Seed Runner] Connected to MySQL Server at ${config.host}:${config.port}`);

    // Step 2: Read schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`[Seed Runner] Executing schema: ${schemaPath}`);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('[Seed Runner] Database schema created successfully.');
    } else {
      console.warn(`[Seed Runner] Warning: ${schemaPath} not found.`);
    }

    // Step 3: Read seed.sql
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`[Seed Runner] Executing seed: ${seedPath}`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('[Seed Runner] Seed data inserted successfully.');
    } else {
      console.warn(`[Seed Runner] Warning: ${seedPath} not found.`);
    }

    // Step 4: Run supplementary feature migrations
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
        console.log(`[Seed Runner] Executing migration: ${migFile}`);
        const migSql = fs.readFileSync(migPath, 'utf8');
        await connection.query(migSql);
        console.log(`[Seed Runner] Applied ${migFile} successfully.`);
      }
    }

    console.log('[Seed Runner] All database migrations completed successfully!');
  } catch (error) {
    console.error('[Seed Runner Error]', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  runMigrationAndSeed();
}

module.exports = { runMigrationAndSeed };

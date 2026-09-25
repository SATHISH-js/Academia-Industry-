const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigrationAndSeed() {
  console.log('[Seed Runner] Starting Database Migration & Seed...');

  let connectionConfig;

  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      connectionConfig = {
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || 3306,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined,
        multipleStatements: true,
        ssl: { rejectUnauthorized: false }
      };
      console.log(`[Seed Runner] Configured from DATABASE_URL -> Host: ${connectionConfig.host}, Port: ${connectionConfig.port}`);
    } catch (e) {
      connectionConfig = {
        uri: process.env.DATABASE_URL,
        multipleStatements: true
      };
    }
  } else {
    connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || undefined,
      multipleStatements: true
    };
    if (process.env.DB_SSL === 'true') {
      connectionConfig.ssl = { rejectUnauthorized: false };
    }
    console.log(`[Seed Runner] Configured from env -> Host: ${connectionConfig.host}:${connectionConfig.port}`);
  }

  let connection;
  try {
    // Step 1: Connect to MySQL server
    connection = await mysql.createConnection(connectionConfig);
    console.log(`[Seed Runner] Connected to MySQL Server successfully.`);

    // Step 2: Read schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`[Seed Runner] Executing schema: ${schemaPath}`);
      let schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // If connected to a specific database (e.g. Cloud TiDB/Aiven), strip CREATE DATABASE/USE to avoid permission errors
      if (connectionConfig.database) {
        schemaSql = schemaSql
          .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+[^;]+;/gi, '')
          .replace(/USE\s+[^;]+;/gi, '');
      }

      await connection.query(schemaSql);
      console.log('[Seed Runner] Database schema created successfully.');
    } else {
      console.warn(`[Seed Runner] Warning: ${schemaPath} not found.`);
    }

    // Step 3: Read seed.sql
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`[Seed Runner] Executing seed: ${seedPath}`);
      let seedSql = fs.readFileSync(seedPath, 'utf8');
      if (connectionConfig.database) {
        seedSql = seedSql.replace(/USE\s+[^;]+;/gi, '');
      }
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
        let migSql = fs.readFileSync(migPath, 'utf8');
        if (connectionConfig.database) {
          migSql = migSql.replace(/USE\s+[^;]+;/gi, '');
        }
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

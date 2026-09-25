const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

/**
 * Safely adds a column to a table if it does not already exist.
 * Uses information_schema check so it works on all MySQL/TiDB versions without syntax errors.
 */
async function addColumnIfMissing(tableName, columnName, columnDefinition, currentDb) {
  try {
    const [exists] = await pool.query(
      `SELECT COUNT(*) as count FROM information_schema.columns 
       WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
      [currentDb, tableName, columnName]
    );

    if (exists[0]?.count === 0) {
      console.log(`[Database Auto-Migrate] Adding missing column: ${tableName}.${columnName}`);
      await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
      console.log(`[Database Auto-Migrate] Successfully added ${tableName}.${columnName}`);
    }
  } catch (err) {
    console.warn(`[Database Auto-Migrate Notice] ${tableName}.${columnName}: ${err.message}`);
  }
}

/**
 * Ensures all profile and schema columns required by frontend & controllers exist.
 */
async function ensureColumnsExist(currentDb) {
  console.log(`[Database Auto-Migrate] Checking schema columns in "${currentDb}"...`);

  // 1. student_profiles columns
  await addColumnIfMissing('student_profiles', 'city', 'VARCHAR(100) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'state', 'VARCHAR(100) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'pincode', 'VARCHAR(20) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'current_semester', 'VARCHAR(20) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'section', 'VARCHAR(20) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'register_number', 'VARCHAR(50) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'current_year', 'INT DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'active_backlogs', 'INT DEFAULT 0', currentDb);
  await addColumnIfMissing('student_profiles', 'attendance_percentage', 'DECIMAL(5,2) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'placed_company', 'VARCHAR(150) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'placed_package', 'VARCHAR(50) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_profiles', 'placement_field', 'VARCHAR(100) DEFAULT NULL', currentDb);

  // 2. academician_profiles columns
  await addColumnIfMissing('academician_profiles', 'address', 'TEXT DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'city', 'VARCHAR(100) DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'state', 'VARCHAR(100) DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'pincode', 'VARCHAR(20) DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'is_open_guest_lecture', 'TINYINT(1) DEFAULT 0', currentDb);
  await addColumnIfMissing('academician_profiles', 'guest_lecture_topics', 'TEXT DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'guest_lecture_mode', "VARCHAR(50) DEFAULT 'VIRTUAL'", currentDb);
  await addColumnIfMissing('academician_profiles', 'guest_lecture_bio', 'TEXT DEFAULT NULL', currentDb);
  await addColumnIfMissing('academician_profiles', 'guest_lecture_experience', 'VARCHAR(100) DEFAULT NULL', currentDb);

  // 3. roadmap_paths columns
  await addColumnIfMissing('roadmap_paths', 'department', "VARCHAR(120) DEFAULT 'ALL'", currentDb);
  await addColumnIfMissing('roadmap_paths', 'domain', "VARCHAR(120) DEFAULT 'Full Stack Web'", currentDb);
  await addColumnIfMissing('roadmap_paths', 'created_by_student_id', 'INT DEFAULT NULL', currentDb);

  // 4. student_roadmap_tasks columns
  await addColumnIfMissing('student_roadmap_tasks', 'score_percentage', 'DECIMAL(5,2) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_roadmap_tasks', 'badge_awarded', 'TINYINT(1) DEFAULT 0', currentDb);
  await addColumnIfMissing('student_roadmap_tasks', 'verification_code', 'VARCHAR(100) DEFAULT NULL', currentDb);
  await addColumnIfMissing('student_roadmap_tasks', 'quiz_session_id', 'VARCHAR(100) DEFAULT NULL', currentDb);

  // 5. institution_industry_connections columns
  await addColumnIfMissing('institution_industry_connections', 'proposal_note', 'TEXT DEFAULT NULL', currentDb);
  await addColumnIfMissing('institution_industry_connections', 'initiator', "VARCHAR(50) DEFAULT 'INSTITUTION'", currentDb);

  console.log(`[Database Auto-Migrate] Column synchronization complete.`);
}

/**
 * Ensures required supplementary tables exist.
 */
async function ensureSupplementaryTablesExist(currentDb) {
  try {
    // 1. roadmap_task_quiz_sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`roadmap_task_quiz_sessions\` (
        id VARCHAR(100) PRIMARY KEY,
        student_id INT NOT NULL,
        roadmap_id INT NOT NULL,
        task_id INT NOT NULL,
        topic_title VARCHAR(255) NOT NULL,
        questions JSON NOT NULL,
        duration_seconds INT DEFAULT 600,
        submitted TINYINT(1) DEFAULT 0,
        score_percentage DECIMAL(5,2) DEFAULT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB;
    `);

    // 2. faculty_guest_lectures
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`faculty_guest_lectures\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_academician_id INT NOT NULL,
        requester_institution_id INT NOT NULL,
        speaker_academician_id INT NOT NULL,
        speaker_institution_id INT NOT NULL,
        request_type VARCHAR(50) DEFAULT 'INVITATION',
        topic VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        target_audience VARCHAR(200) DEFAULT NULL,
        delivery_mode VARCHAR(50) DEFAULT 'VIRTUAL',
        proposed_date DATE DEFAULT NULL,
        meeting_link VARCHAR(255) DEFAULT NULL,
        venue VARCHAR(255) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        response_notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. academician_student_messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`academician_student_messages\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        academician_id INT NOT NULL,
        student_id INT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'GUIDANCE',
        subject VARCHAR(200) DEFAULT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 4. industry_student_messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`industry_student_messages\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        industry_id INT NOT NULL,
        student_id INT NOT NULL,
        opportunity_id INT DEFAULT NULL,
        opportunity_type VARCHAR(50) DEFAULT 'INTERNSHIP',
        message_type VARCHAR(50) DEFAULT 'ROLE_INQUIRY',
        subject VARCHAR(200) DEFAULT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'SENT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (err) {
    console.warn('[Database Auto-Migrate Notice] Supplementary tables check:', err.message);
  }
}

/**
 * Main auto-migration entry point called on server startup.
 */
async function ensureSchemaInitialized() {
  try {
    // 1. Get current active database
    const [dbResult] = await pool.query('SELECT DATABASE() as currentDb');
    const currentDb = dbResult[0]?.currentDb;

    if (!currentDb) {
      console.warn('[Database Auto-Init] Warning: No active database selected in MySQL session.');
      return false;
    }

    console.log(`[Database Auto-Init] Active database session: "${currentDb}"`);

    // 2. Check if core 'users' table exists
    const [tableCheck] = await pool.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'`,
      [currentDb]
    );

    const sanitizeSql = (sql) => {
      return sql
        .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+[^;]+;/gi, '')
        .replace(/USE\s+[^;]+;/gi, '');
    };

    if (tableCheck[0]?.count === 0) {
      console.log(`[Database Auto-Init] Core table "users" NOT found in "${currentDb}". Running full schema initialization...`);

      // Execute schema.sql
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        console.log(`[Database Auto-Init] Executing schema.sql...`);
        const schemaSql = sanitizeSql(fs.readFileSync(schemaPath, 'utf8'));
        await pool.query(schemaSql);
        console.log(`[Database Auto-Init] Core schema and tables created.`);
      }

      // Execute seed.sql
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        console.log(`[Database Auto-Init] Seeding initial data...`);
        const seedSql = sanitizeSql(fs.readFileSync(seedPath, 'utf8'));
        await pool.query(seedSql);
        console.log(`[Database Auto-Init] Seed data inserted.`);
      }
    } else {
      console.log(`[Database Auto-Init] Core tables found in "${currentDb}".`);
    }

    // 3. Always synchronize columns and supplementary tables (even if tables already existed)
    await ensureColumnsExist(currentDb);
    await ensureSupplementaryTablesExist(currentDb);

    console.log(`[Database Auto-Init] Database is fully verified, synchronized, and ready!`);
    return true;
  } catch (err) {
    console.error(`[Database Auto-Init Error] Failed to initialize schema:`, err.message);
    return false;
  }
}

module.exports = { 
  ensureSchemaInitialized,
  ensureColumnsExist,
  addColumnIfMissing
};

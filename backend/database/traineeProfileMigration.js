const { pool } = require('../config/db');

async function ensureTraineeProfileSchema() {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS currentDb');
    const database = dbRows[0]?.currentDb;
    if (!database) throw new Error('No active database is selected');

    const ensureColumn = async (table, column, definition) => {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.columns
        WHERE table_schema = ? AND table_name = ? AND column_name = ?`, [database, table, column]);
      if (Number(rows[0]?.count) === 0) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    };

    await ensureColumn('student_profiles', 'institution_name', 'VARCHAR(200) DEFAULT NULL');
    await ensureColumn('student_profiles', 'specialization', 'VARCHAR(200) DEFAULT NULL');
    await ensureColumn('student_certifications', 'verification_status', "ENUM('UNVERIFIED','PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED'");

    await pool.query(`CREATE TABLE IF NOT EXISTS trainee_work_experiences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      organization VARCHAR(180) NOT NULL,
      designation VARCHAR(150) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE DEFAULT NULL,
      description TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_trainee_experience_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      INDEX idx_trainee_experience_student (student_id)
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trainee_interests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_trainee_interest (student_id, name),
      CONSTRAINT fk_trainee_interest_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    console.log('[Trainee profile migration] Profile columns and related tables are ready.');
    return true;
  } catch (error) {
    console.error('[Trainee profile migration] Setup failed:', error.message);
    return false;
  }
}

module.exports = { ensureTraineeProfileSchema };

const { pool } = require('../config/db');

async function ensureCourseLearningSchema() {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS currentDb');
    const database = dbRows[0]?.currentDb;
    if (!database) throw new Error('No active database is selected');

    const ensureColumn = async (column, definition) => {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.columns
        WHERE table_schema = ? AND table_name = 'learning_programs' AND column_name = ?`, [database, column]);
      if (Number(rows[0]?.count) === 0) await pool.query(`ALTER TABLE learning_programs ADD COLUMN \`${column}\` ${definition}`);
    };
    await ensureColumn('subject', 'VARCHAR(120) DEFAULT NULL');
    await ensureColumn('thumbnail_url', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('publication_status', "ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED'");
    await ensureColumn('published_at', 'TIMESTAMP NULL DEFAULT NULL');
    await ensureColumn('trainer_user_id', 'INT DEFAULT NULL');
    const [trainerFkRows] = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.key_column_usage
      WHERE table_schema = ? AND table_name = 'learning_programs' AND column_name = 'trainer_user_id'
        AND referenced_table_name = 'users'`, [database]);
    if (Number(trainerFkRows[0]?.count) === 0) {
      await pool.query(`ALTER TABLE learning_programs ADD CONSTRAINT fk_learning_program_trainer
        FOREIGN KEY (trainer_user_id) REFERENCES users(id) ON DELETE SET NULL`);
    }
    await pool.query(`UPDATE learning_programs SET published_at = created_at
      WHERE publication_status = 'PUBLISHED' AND published_at IS NULL`);

    await pool.query(`CREATE TABLE IF NOT EXISTS course_resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      learning_program_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT DEFAULT NULL,
      resource_type ENUM('PLACEHOLDER','LINK') NOT NULL DEFAULT 'PLACEHOLDER',
      resource_url VARCHAR(500) DEFAULT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_course_resource_program FOREIGN KEY (learning_program_id) REFERENCES learning_programs(id) ON DELETE CASCADE,
      INDEX idx_course_resource_order (learning_program_id, is_active, sort_order)
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS course_enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainee_user_id INT NOT NULL,
      learning_program_id INT NOT NULL,
      enrollment_status ENUM('ACTIVE','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
      enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_course_enrollment (trainee_user_id, learning_program_id),
      CONSTRAINT fk_course_enrollment_trainee FOREIGN KEY (trainee_user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_course_enrollment_program FOREIGN KEY (learning_program_id) REFERENCES learning_programs(id) ON DELETE CASCADE,
      INDEX idx_course_enrollment_trainee (trainee_user_id, enrolled_at)
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS course_progress (
      enrollment_id INT PRIMARY KEY,
      status ENUM('NOT_STARTED','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
      progress_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0,
      last_accessed_resource_id INT DEFAULT NULL,
      last_accessed_at TIMESTAMP NULL DEFAULT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_course_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
      CONSTRAINT fk_course_progress_last_resource FOREIGN KEY (last_accessed_resource_id) REFERENCES course_resources(id) ON DELETE SET NULL
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS course_resource_completions (
      enrollment_id INT NOT NULL,
      resource_id INT NOT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (enrollment_id, resource_id),
      CONSTRAINT fk_course_completion_enrollment FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
      CONSTRAINT fk_course_completion_resource FOREIGN KEY (resource_id) REFERENCES course_resources(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    // Existing course records get one starter placeholder where they have no resource entries.
    await pool.query(`INSERT INTO course_resources (learning_program_id, title, description, resource_type, sort_order)
      SELECT lp.id, 'Course introduction', 'Starter resource placeholder. Course materials can be attached in a later trainer workflow.', 'PLACEHOLDER', 1
      FROM learning_programs lp LEFT JOIN course_resources cr ON cr.learning_program_id = lp.id
      WHERE lp.publication_status = 'PUBLISHED' AND cr.id IS NULL`);

    console.log('[Course learning migration] Catalog, enrollment, resources, and progress tables are ready.');
    return true;
  } catch (error) {
    console.error('[Course learning migration] Setup failed:', error.message);
    return false;
  }
}

module.exports = { ensureCourseLearningSchema };

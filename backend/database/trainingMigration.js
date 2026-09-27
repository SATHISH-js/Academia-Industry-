const { pool } = require('../config/db');

// Additive, idempotent setup for the training platform. Existing legacy rows and
// tables are retained so deployment does not discard historical information.
async function ensureTrainingSchema() {
  try {
    const [roleColumn] = await pool.query(`SELECT COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role' LIMIT 1`);
    if (!roleColumn.length) throw new Error('users.role column is missing');
    const roleType = roleColumn[0].COLUMN_TYPE || '';
    if (!roleType.includes("'TRAINEE'") || !roleType.includes("'TRAINER'") || !roleType.includes("'ADMIN'")) {
      await pool.query(`ALTER TABLE users MODIFY role ENUM(
        'STUDENT','ACADEMICIAN','INDUSTRY','INSTITUTION','TRAINEE','TRAINER','ADMIN'
      ) NOT NULL`);
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS trainee_profiles (
      user_id INT PRIMARY KEY,
      headline VARCHAR(180) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_trainee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trainer_profiles (
      user_id INT PRIMARY KEY,
      expertise VARCHAR(255) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      approval_status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_trainer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS training_programs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainer_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      competency VARCHAR(160) DEFAULT NULL,
      level ENUM('BEGINNER','INTERMEDIATE','ADVANCED') NOT NULL DEFAULT 'BEGINNER',
      duration_hours INT NOT NULL DEFAULT 1,
      status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_program_trainer FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_program_status (status), INDEX idx_program_trainer (trainer_id)
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS training_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      program_id INT NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT DEFAULT NULL,
      resource_url VARCHAR(500) DEFAULT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_module_program FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS training_module_completions (
      module_id INT NOT NULL,
      trainee_id INT NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (module_id, trainee_id),
      CONSTRAINT fk_module_completion_module FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
      CONSTRAINT fk_module_completion_trainee FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS training_enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      program_id INT NOT NULL,
      trainee_id INT NOT NULL,
      status ENUM('ACTIVE','COMPLETED','WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
      progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL DEFAULT NULL,
      CONSTRAINT fk_enrollment_program FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
      CONSTRAINT fk_enrollment_trainee FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uq_program_trainee (program_id, trainee_id),
      INDEX idx_enrollment_trainee (trainee_id, status)
    ) ENGINE=InnoDB`);

    console.log('[Training migration] Training platform tables are ready.');
    return true;
  } catch (error) {
    console.error('[Training migration] Setup failed:', error.message);
    return false;
  }
}

module.exports = { ensureTrainingSchema };

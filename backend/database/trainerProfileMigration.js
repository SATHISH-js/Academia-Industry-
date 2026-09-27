const { pool } = require('../config/db');

async function ensureTrainerProfileSchema() {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS currentDb');
    const database = dbRows[0]?.currentDb;
    if (!database) throw new Error('No active database is selected');
    const ensureColumn = async (column, definition) => {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.columns
        WHERE table_schema = ? AND table_name = 'academician_profiles' AND column_name = ?`, [database, column]);
      if (Number(rows[0]?.count) === 0) await pool.query(`ALTER TABLE academician_profiles ADD COLUMN \`${column}\` ${definition}`);
    };
    await ensureColumn('bio', 'TEXT DEFAULT NULL');
    await ensureColumn('expertise', 'TEXT DEFAULT NULL');

    await pool.query(`CREATE TABLE IF NOT EXISTS trainer_work_experiences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainer_profile_id INT NOT NULL,
      organization VARCHAR(180) NOT NULL,
      designation VARCHAR(150) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE DEFAULT NULL,
      description TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_trainer_experience_profile FOREIGN KEY (trainer_profile_id) REFERENCES academician_profiles(id) ON DELETE CASCADE,
      INDEX idx_trainer_experience_profile (trainer_profile_id)
    ) ENGINE=InnoDB`);

    await pool.query(`CREATE TABLE IF NOT EXISTS trainer_profile_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainer_profile_id INT NOT NULL,
      item_type ENUM('SKILL','COMPETENCY','SUBJECT','CERTIFICATION') NOT NULL,
      title VARCHAR(180) NOT NULL,
      issuing_organization VARCHAR(180) DEFAULT NULL,
      issue_date DATE DEFAULT NULL,
      credential_reference VARCHAR(150) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_trainer_item_profile FOREIGN KEY (trainer_profile_id) REFERENCES academician_profiles(id) ON DELETE CASCADE,
      INDEX idx_trainer_profile_items (trainer_profile_id, item_type)
    ) ENGINE=InnoDB`);

    console.log('[Trainer profile migration] Profile extensions and trainer-owned records are ready.');
    return true;
  } catch (error) {
    console.error('[Trainer profile migration] Setup failed:', error.message);
    return false;
  }
}

module.exports = { ensureTrainerProfileSchema };

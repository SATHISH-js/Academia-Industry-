const { pool } = require('../config/db');

async function columnExists(table, column, database) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.columns
    WHERE table_schema = ? AND table_name = ? AND column_name = ?`, [database, table, column]);
  return Number(rows[0]?.count) > 0;
}

// Adds account controls without dropping or replacing existing user records.
// Legacy organization accounts are converted to pending TRAINER accounts: this
// preserves their identity while ensuring no legacy account receives ADMIN.
async function ensureAuthSchema() {
  try {
    const [databaseRows] = await pool.query('SELECT DATABASE() AS currentDb');
    const database = databaseRows[0]?.currentDb;
    if (!database) throw new Error('No active database is selected');

    const [roleRows] = await pool.query(`SELECT COLUMN_TYPE FROM information_schema.columns
      WHERE table_schema = ? AND table_name = 'users' AND column_name = 'role' LIMIT 1`, [database]);
    if (!roleRows.length) throw new Error('users.role column is missing');
    const roleType = roleRows[0].COLUMN_TYPE || '';
    if (!roleType.includes("'TRAINEE'") || !roleType.includes("'TRAINER'") || !roleType.includes("'ADMIN'")) {
      await pool.query(`ALTER TABLE users MODIFY role ENUM(
        'STUDENT','ACADEMICIAN','INDUSTRY','INSTITUTION','TRAINEE','TRAINER','ADMIN'
      ) NOT NULL`);
    }

    const hasStatus = await columnExists('users', 'account_status', database);
    if (!hasStatus) {
      await pool.query(`ALTER TABLE users ADD COLUMN account_status ENUM('PENDING','ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE'`);
      await pool.query(`UPDATE users SET account_status = IF(is_active = 1, 'ACTIVE', 'DISABLED')`);
    }

    if (!await columnExists('users', 'token_version', database)) {
      await pool.query('ALTER TABLE users ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0');
    }
    if (!await columnExists('users', 'approved_by', database)) {
      await pool.query('ALTER TABLE users ADD COLUMN approved_by INT DEFAULT NULL');
    }
    if (!await columnExists('users', 'approved_at', database)) {
      await pool.query('ALTER TABLE users ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL');
    }

    // Keep old data and related profile rows. Student identities map directly to
    // trainees; all other non-admin legacy identities require explicit review.
    await pool.query(`UPDATE users SET role = 'TRAINEE',
      account_status = IF(is_active = 1, 'ACTIVE', 'DISABLED') WHERE role = 'STUDENT'`);
    await pool.query(`UPDATE users SET role = 'TRAINER',
      account_status = IF(is_active = 1, 'PENDING', 'DISABLED')
      WHERE role IN ('ACADEMICIAN','INDUSTRY','INSTITUTION')`);
    // Trainer approval is temporarily disabled. Activate existing pending trainer accounts;
    // disabled accounts remain disabled.
    await pool.query(`UPDATE users SET account_status = 'ACTIVE', is_active = 1,
      approved_by = NULL, approved_at = NULL WHERE role = 'TRAINER' AND account_status = 'PENDING'`);
    await pool.query(`UPDATE users SET is_active = IF(account_status = 'ACTIVE', 1, 0)
      WHERE NOT (is_active <=> IF(account_status = 'ACTIVE', 1, 0))`);

    console.log('[Auth migration] Account statuses, session versions, and role mapping are ready.');
    return true;
  } catch (error) {
    console.error('[Auth migration] Setup failed:', error.message);
    return false;
  }
}

module.exports = { ensureAuthSchema };

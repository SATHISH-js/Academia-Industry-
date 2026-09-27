const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function listAccounts(req, res) {
  try {
    const [rows] = await pool.query(`SELECT id, name, email, role, account_status, is_active, created_at,
      approved_by, approved_at FROM users WHERE role IN ('TRAINEE','TRAINER','ADMIN')
      ORDER BY FIELD(account_status, 'PENDING','ACTIVE','DISABLED'), created_at DESC`);
    return sendSuccess(res, rows, 'Accounts retrieved');
  } catch (error) {
    console.error('[Admin list accounts]', error);
    return sendError(res, 'Could not retrieve accounts.', 500);
  }
}

async function changeAccountRole(req, res) {
  const nextRole = req.body.role;
  const targetId = Number(req.params.id);
  if (!Number.isSafeInteger(targetId) || targetId <= 0) return sendError(res, 'Invalid account id.', 400);
  if (!['TRAINEE', 'TRAINER'].includes(nextRole)) {
    return sendError(res, 'Role must be TRAINEE or TRAINER. ADMIN is only assigned through the provisioning command.', 400);
  }
  if (targetId === req.user.id) return sendError(res, 'You cannot change your own role.', 400);
  try {
    const [result] = await pool.query(`UPDATE users SET role = ?, approved_by = NULL,
      approved_at = NULL, token_version = token_version + 1
      WHERE id = ? AND role <> 'ADMIN'`, [nextRole, targetId]);
    if (!result.affectedRows) return sendError(res, 'Account not found or role cannot be changed.', 404);
    return sendSuccess(res, null, 'Role updated. The existing account status was retained.');
  } catch (error) {
    console.error('[Admin change account role]', error);
    return sendError(res, 'Could not update account role.', 500);
  }
}

async function disableAccount(req, res) {
  const targetId = Number(req.params.id);
  if (!Number.isSafeInteger(targetId) || targetId <= 0) return sendError(res, 'Invalid account id.', 400);
  if (targetId === req.user.id) return sendError(res, 'You cannot disable your own administrator account.', 400);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [targetRows] = await connection.query('SELECT id, role, account_status FROM users WHERE id = ? FOR UPDATE', [targetId]);
    if (!targetRows.length) {
      await connection.rollback();
      return sendError(res, 'Account not found.', 404);
    }
    if (targetRows[0].role === 'ADMIN') {
      // Serialize administrator deactivations so simultaneous requests cannot
      // both pass the last-admin check.
      await connection.query(`SELECT id FROM users
        WHERE role = 'ADMIN' AND account_status = 'ACTIVE' ORDER BY id FOR UPDATE`);
      const [[counts]] = await connection.query(`SELECT COUNT(*) AS count FROM users
        WHERE role = 'ADMIN' AND account_status = 'ACTIVE' AND id <> ?`, [targetId]);
      if (Number(counts.count) < 1) {
        await connection.rollback();
        return sendError(res, 'The last active administrator cannot be disabled.', 409);
      }
    }
    await connection.query(`UPDATE users SET account_status = 'DISABLED', is_active = 0,
      token_version = token_version + 1 WHERE id = ?`, [targetId]);
    await connection.commit();
    return sendSuccess(res, null, 'Account disabled and existing sessions revoked');
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[Admin disable account]', error);
    return sendError(res, 'Could not disable account.', 500);
  } finally {
    connection?.release();
  }
}

module.exports = { listAccounts, changeAccountRole, disableAccount };

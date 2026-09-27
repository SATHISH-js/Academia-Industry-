const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const publicUser = row => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  account_status: row.account_status,
  avatar_url: row.avatar_url || null,
  phone: row.phone || null
});

async function recordLogin(user, req, status) {
  try {
    await pool.query(`INSERT INTO login_history (user_id, email, ip_address, user_agent, status)
      VALUES (?, ?, ?, ?, ?)`, [user?.id || null, user?.email || req.body.email, req.ip || '127.0.0.1',
      req.headers['user-agent'] || 'Unknown Browser', status]);
  } catch (error) {
    // Login auditing must not disclose account state or prevent authentication.
    console.warn('[Auth] Could not record login history:', error.message);
  }
}

async function register(req, res) {
  const { name, email, password, phone, role } = req.body;
  if (!['TRAINEE', 'TRAINER'].includes(role)) {
    return sendError(res, 'Choose TRAINEE or TRAINER. Admin accounts are provisioned separately.', 400);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const passwordHash = await bcrypt.hash(password, 12);
    // Trainer approval is temporarily disabled; both public signup roles activate immediately.
    const accountStatus = 'ACTIVE';
    const [result] = await connection.query(`INSERT INTO users
      (name, email, password_hash, role, phone, is_active, account_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [name.trim(), email.toLowerCase(), passwordHash, role,
      phone?.trim() || null, accountStatus === 'ACTIVE', accountStatus]);
    await connection.commit();

    const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase(), role, account_status: accountStatus };
    return sendSuccess(res, { user, token: generateToken(user) }, 'Registration successful', 201);
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 'An account with this email address already exists.', 409);
    console.error('[Auth register]', error);
    return sendError(res, 'Could not register account.', 500);
  } finally {
    connection?.release();
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(`SELECT id, name, email, password_hash, role, avatar_url, phone,
      is_active, account_status, token_version FROM users WHERE email = ? LIMIT 1`, [email.toLowerCase()]);
    const user = rows[0];
    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!passwordMatches) {
      await recordLogin(user, req, 'FAILED');
      return sendError(res, 'Invalid email or password.', 401);
    }

    const status = user.account_status || (user.is_active ? 'ACTIVE' : 'DISABLED');
    if (status === 'PENDING') {
      await recordLogin(user, req, 'FAILED');
      return sendError(res, 'Your account is pending administrator approval.', 403);
    }
    if (status !== 'ACTIVE' || !user.is_active) {
      await recordLogin(user, req, 'FAILED');
      return sendError(res, 'Your account is disabled. Contact an administrator.', 403);
    }
    if (!['TRAINEE', 'TRAINER', 'ADMIN'].includes(user.role)) {
      await recordLogin(user, req, 'FAILED');
      return sendError(res, 'This legacy account needs administrator review before it can be used.', 403);
    }

    if (bcrypt.getRounds(user.password_hash) < 12) {
      const upgradedHash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [upgradedHash, user.id]);
    }
    await recordLogin(user, req, 'SUCCESS');
    const safeUser = publicUser(user);
    return sendSuccess(res, { user: safeUser, token: generateToken(user) }, 'Login successful');
  } catch (error) {
    console.error('[Auth login]', error);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
}

async function logout(req, res) {
  try {
    await pool.query('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [req.user.id]);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('[Auth logout]', error);
    return sendError(res, 'Could not invalidate this session.', 500);
  }
}

async function getMe(req, res) {
  return sendSuccess(res, { user: publicUser(req.user) }, 'Current user retrieved');
}

async function getLoginHistory(req, res) {
  try {
    const [rows] = await pool.query(`SELECT id, ip_address, user_agent, status, created_at
      FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 15`, [req.user.id]);
    return sendSuccess(res, rows, 'Login history retrieved');
  } catch (error) {
    console.error('[Auth login history]', error);
    return sendError(res, 'Could not retrieve login history.', 500);
  }
}

async function updateProfile(req, res) {
  const { name, phone, avatar_url } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120)) {
    return sendError(res, 'Name must be between 2 and 120 characters.', 400);
  }
  try {
    await pool.query(`UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone),
      avatar_url = COALESCE(?, avatar_url) WHERE id = ?`, [
      name === undefined ? null : name.trim(), phone === undefined ? null : phone,
      avatar_url === undefined ? null : avatar_url, req.user.id
    ]);
    const [rows] = await pool.query(`SELECT id, name, email, role, account_status, avatar_url, phone
      FROM users WHERE id = ? LIMIT 1`, [req.user.id]);
    return sendSuccess(res, { user: publicUser(rows[0]) }, 'Profile updated');
  } catch (error) {
    console.error('[Auth update profile]', error);
    return sendError(res, 'Could not update profile.', 500);
  }
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows.length || !await bcrypt.compare(oldPassword, rows[0].password_hash)) {
      return sendError(res, 'Current password is incorrect.', 400);
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [hash, req.user.id]);
    return sendSuccess(res, null, 'Password changed. Please sign in again.');
  } catch (error) {
    console.error('[Auth change password]', error);
    return sendError(res, 'Could not change password.', 500);
  }
}

module.exports = { register, login, logout, getMe, getLoginHistory, updateProfile, changePassword };

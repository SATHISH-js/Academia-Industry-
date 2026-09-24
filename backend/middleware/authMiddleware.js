const { verifyToken } = require('../utils/tokenHelper');
const { sendError } = require('../utils/responseHandler');
const { pool } = require('../config/db');

/**
 * Authenticate User Middleware
 * Verifies JWT token and attaches user to req.user
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return sendError(res, 'Session has expired or is invalid. Please log in again.', 401);
    }

    // Verify user exists and is active in database
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, phone, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return sendError(res, 'User account not found or deactivated.', 401);
    }

    // Attach verified user to request
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return sendError(res, 'Internal authentication error', 500);
  }
}

module.exports = {
  authenticateUser
};

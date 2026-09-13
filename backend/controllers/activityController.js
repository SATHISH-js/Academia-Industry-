const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getActivityHistory(req, res) {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM user_activity_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    return sendSuccess(res, rows, 'User activity history retrieved');
  } catch (error) {
    console.error('[Activity getActivityHistory Error]', error);
    return sendError(res, 'Failed to fetch activity history', 500);
  }
}

module.exports = {
  getActivityHistory
};

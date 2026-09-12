const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return sendSuccess(res, {
      notifications: rows,
      unreadCount: countRows[0].unread_count || 0
    }, 'Notifications retrieved');
  } catch (error) {
    console.error('[Notification getNotifications Error]', error);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
}

async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notifId, userId]
    );

    return sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('[Notification markAsRead Error]', error);
    return sendError(res, 'Failed to update notification', 500);
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('[Notification markAllAsRead Error]', error);
    return sendError(res, 'Failed to update notifications', 500);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

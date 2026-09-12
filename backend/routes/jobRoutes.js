const express = require('express');
const router = express.Router();

const { listJobs, getJobById, createJob } = require('../controllers/jobController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { verifyToken } = require('../utils/tokenHelper');
const { pool } = require('../config/db');

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [decoded.id]);
      if (rows.length > 0) {
        req.user = rows[0];
      }
    }
  }
  next();
}

router.get('/', optionalAuth, listJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', authenticateUser, requireRole('INDUSTRY'), createJob);

module.exports = router;

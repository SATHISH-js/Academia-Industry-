const express = require('express');
const router = express.Router();

const { listInternships, getInternshipById, createInternship } = require('../controllers/internshipController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { verifyToken } = require('../utils/tokenHelper');
const { pool } = require('../config/db');

// Optional auth middleware so public visitors can view, but logged-in students receive personalized match scores
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

router.get('/', optionalAuth, listInternships);
router.get('/:id', optionalAuth, getInternshipById);
router.post('/', authenticateUser, requireRole('INDUSTRY'), createInternship);

module.exports = router;

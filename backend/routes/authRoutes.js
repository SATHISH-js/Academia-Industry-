const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateUser } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

// Protected session check
router.get('/me', authenticateUser, getMe);

module.exports = router;

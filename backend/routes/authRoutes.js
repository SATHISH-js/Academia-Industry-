const express = require('express');
const router = express.Router();

const { register, login, logout, getMe, getLoginHistory, updateProfile, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator, changePasswordValidator, profileValidator } = require('../validators/authValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateUser } = require('../middleware/authMiddleware');
const { loginRateLimit } = require('../middleware/loginRateLimit');

// Public endpoints
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, loginRateLimit, login);
router.post('/logout', authenticateUser, logout);

// Protected session check, profile management & password change
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, profileValidator, validateRequest, updateProfile);
router.put('/change-password', authenticateUser, changePasswordValidator, validateRequest, changePassword);
router.get('/login-history', authenticateUser, getLoginHistory);

module.exports = router;

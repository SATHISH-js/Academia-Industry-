const express = require('express');
const router = express.Router();

const { register, login, getMe, getLoginHistory, updateProfile, changePassword } = require('../controllers/authController');
const { registerValidator, loginValidator, changePasswordValidator } = require('../validators/authValidator');
const { validateRequest } = require('../middleware/validationMiddleware');
const { authenticateUser } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

// Protected session check, profile management & password change
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.put('/change-password', authenticateUser, changePasswordValidator, validateRequest, changePassword);
router.get('/login-history', authenticateUser, getLoginHistory);

module.exports = router;

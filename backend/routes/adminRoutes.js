const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listAccounts, changeAccountRole, disableAccount } = require('../controllers/adminAuthController');

router.use(authenticateUser, requireRole('ADMIN'));
router.get('/users', listAccounts);
router.patch('/users/:id/role', changeAccountRole);
router.patch('/users/:id/disable', disableAccount);

module.exports = router;

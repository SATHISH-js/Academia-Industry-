const express = require('express');
const router = express.Router();

const { getActivityHistory } = require('../controllers/activityController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/history', getActivityHistory);

module.exports = router;

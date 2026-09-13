const express = require('express');
const router = express.Router();

const { getResumeData, logResumeExport } = require('../controllers/resumeController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser, requireRole('STUDENT'));

router.get('/data', getResumeData);
router.post('/export-log', logResumeExport);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  submitApplication,
  getApplications,
  updateApplicationStatus,
  getApplicationMessages,
  sendApplicationMessage
} = require('../controllers/applicationController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(authenticateUser);

router.post('/', submitApplication);
router.get('/', getApplications);
router.put('/:id/status', requireRole('INDUSTRY'), updateApplicationStatus);
router.get('/:id/messages', getApplicationMessages);
router.post('/:id/messages', sendApplicationMessage);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  searchCandidates,
  sendMessageToStudent,
  getSentMessages,
  getInstitutions,
  requestPlacementDrive,
  getMyPlacementRequests,
  getMyOpportunities
} = require('../controllers/industryController');

const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All endpoints in this router are restricted to authenticated INDUSTRY users
router.use(authenticateUser, requireRole('INDUSTRY'));

// 1. Candidate search & role matching
router.get('/candidates/search', searchCandidates);

// 2. Direct student outreach messaging
router.post('/messages/send', sendMessageToStudent);
router.get('/messages', getSentMessages);

// 3. Institution placement drives & partnerships
router.get('/institutions', getInstitutions);
router.post('/placements/request', requestPlacementDrive);
router.get('/placements/my-requests', getMyPlacementRequests);

// 4. Manage posted opportunities
router.get('/my-opportunities', getMyOpportunities);

module.exports = router;

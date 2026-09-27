const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const controller = require('../controllers/trainingController');

router.get('/catalog', authenticateUser, requireRole('TRAINEE'), controller.listPrograms);
router.get('/enrollments', authenticateUser, requireRole('TRAINEE'), controller.getMyEnrollments);
router.post('/programs/:id/enroll', authenticateUser, requireRole('TRAINEE'), controller.enroll);
router.get('/programs/mine', authenticateUser, requireRole('TRAINER'), controller.getMyPrograms);
router.post('/programs', authenticateUser, requireRole('TRAINER'), controller.createProgram);
router.post('/programs/:id/modules', authenticateUser, requireRole('TRAINER'), controller.createModule);
router.get('/programs/:id/modules', authenticateUser, requireRole('TRAINEE'), controller.getProgramModules);
router.patch('/modules/:id/completion', authenticateUser, requireRole('TRAINEE'), controller.completeModule);

module.exports = router;

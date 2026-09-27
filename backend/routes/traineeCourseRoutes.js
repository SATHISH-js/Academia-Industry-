const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const validators = require('../validators/traineeCourseValidator');
const controller = require('../controllers/traineeCourseController');

router.use(authenticateUser, requireRole('TRAINEE'));
router.get('/courses', controller.catalog);
router.get('/courses/my', controller.myCourses);
router.get('/courses/:courseId', validators.courseId, validateRequest, controller.details);
router.post('/courses/:courseId/enroll', validators.courseId, validateRequest, controller.enroll);
router.get('/courses/:courseId/progress', validators.courseId, validateRequest, controller.progress);
router.post('/courses/:courseId/resources/:resourceId/open', validators.courseId, validators.resourceId, validateRequest, controller.openResource);
router.post('/courses/:courseId/resources/:resourceId/complete', validators.courseId, validators.resourceId, validateRequest, controller.completeResource);

module.exports = router;

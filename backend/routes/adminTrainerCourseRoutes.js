const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const v = require('../validators/trainerValidator');
const c = require('../controllers/trainerController');

router.use(authenticateUser, requireRole('ADMIN'));
router.get('/', c.listCourses);
router.post('/', v.adminCourse, validateRequest, c.createCourse);
router.get('/:courseId', v.courseId, validateRequest, c.getCourse);
router.put('/:courseId', v.courseId, v.course, validateRequest, c.updateCourse);
router.patch('/:courseId/publish', v.courseId, validateRequest, c.transition('publish'));
router.patch('/:courseId/unpublish', v.courseId, validateRequest, c.transition('unpublish'));
router.patch('/:courseId/archive', v.courseId, validateRequest, c.transition('archive'));
module.exports = router;

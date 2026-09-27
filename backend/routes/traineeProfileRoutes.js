const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const validators = require('../validators/traineeProfileValidator');
const controller = require('../controllers/traineeProfileController');

router.use(authenticateUser, requireRole('TRAINEE'));
router.get('/profile', controller.getProfile);
router.put('/profile', validators.profile, validateRequest, controller.updateProfile);
router.post('/profile/skills', validators.name, validateRequest, controller.addSkill);
router.delete('/profile/skills/:id', validators.itemId, validateRequest, controller.removeSkill);
router.post('/profile/interests', validators.name, validateRequest, controller.addInterest);
router.delete('/profile/interests/:id', validators.itemId, validateRequest, controller.removeInterest);
router.post('/profile/experiences', validators.experience, validateRequest, controller.addExperience);
router.put('/profile/experiences/:id', validators.itemId, validators.experience, validateRequest, controller.updateExperience);
router.delete('/profile/experiences/:id', validators.itemId, validateRequest, controller.removeExperience);
router.post('/profile/certificates', validators.certificate, validateRequest, controller.addCertificate);
router.put('/profile/certificates/:id', validators.itemId, validators.certificate, validateRequest, controller.updateCertificate);
router.delete('/profile/certificates/:id', validators.itemId, validateRequest, controller.removeCertificate);

module.exports = router;

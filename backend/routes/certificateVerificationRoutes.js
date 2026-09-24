const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  startAssessment,
  submitQuiz,
  createPost,
  getFeed,
  getMyVerifications,
  validateCertificateCode
} = require('../controllers/certificateVerificationController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Configure multer memory storage for certificate image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

/**
 * Certificate Verification API Routes
 */

// 1. Upload certificate image OR pass skill name & start timed 20-question AI assessment
router.post('/start-assessment', authenticateUser, upload.single('file'), startAssessment);

// 2. Submit quiz answers for server-side evaluation & badge awarding
router.post('/submit-quiz', authenticateUser, submitQuiz);

// 3. Publish verified certificate to community credential feed
router.post('/create-post', authenticateUser, createPost);

// 4. Retrieve community credential feed
router.get('/feed', authenticateUser, getFeed);

// 5. Get student's verified certificates and past assessments
router.get('/my-verifications', authenticateUser, getMyVerifications);

// 6. Public/authenticated Certificate code validator
router.get('/validate/:code', validateCertificateCode);

module.exports = router;

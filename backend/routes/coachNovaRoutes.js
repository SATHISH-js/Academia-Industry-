const express = require('express');
const router = express.Router();
const { askCoachNova, getGreeting } = require('../controllers/coachNovaController');

// Public or session-aware route to query Coach Nova
router.post('/ask', askCoachNova);
router.get('/greeting', getGreeting);

module.exports = router;

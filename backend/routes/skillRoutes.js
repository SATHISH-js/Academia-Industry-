const express = require('express');
const router = express.Router();

const { listSkills, listCategories } = require('../controllers/skillController');

router.get('/', listSkills);
router.get('/categories', listCategories);

module.exports = router;

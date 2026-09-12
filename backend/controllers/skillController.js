const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function listSkills(req, res) {
  try {
    const [skills] = await pool.query(
      `SELECT s.*, sc.name AS category_name, sc.type AS category_type
       FROM skills s
       JOIN skill_categories sc ON s.category_id = sc.id
       ORDER BY sc.name, s.name ASC`
    );

    return sendSuccess(res, skills, 'Skills catalog retrieved');
  } catch (error) {
    console.error('[Skill listSkills Error]', error);
    return sendError(res, 'Failed to fetch skills', 500);
  }
}

async function listCategories(req, res) {
  try {
    const [categories] = await pool.query('SELECT * FROM skill_categories ORDER BY name ASC');
    return sendSuccess(res, categories, 'Skill categories retrieved');
  } catch (error) {
    console.error('[Skill listCategories Error]', error);
    return sendError(res, 'Failed to fetch categories', 500);
  }
}

module.exports = {
  listSkills,
  listCategories
};

const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get digital student portfolio
 */
async function getPortfolio(req, res) {
  try {
    const studentIdParam = req.params.studentId;
    let studentProfileId = studentIdParam;

    if (!studentProfileId) {
      // If not passed, use current logged in student
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [req.user.id]);
      if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
      studentProfileId = stu[0].id;
    }

    const [profileRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.avatar_url, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.id = ? LIMIT 1`,
      [studentProfileId]
    );

    if (profileRows.length === 0) return sendError(res, 'Portfolio not found', 404);

    const [skills] = await pool.query(
      `SELECT ss.*, s.name as skill_name, sc.name as category_name
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE ss.student_id = ?
       ORDER BY ss.score DESC`,
      [studentProfileId]
    );

    const [projects] = await pool.query(
      'SELECT * FROM student_projects WHERE student_id = ? ORDER BY created_at DESC',
      [studentProfileId]
    );

    const [certifications] = await pool.query(
      'SELECT * FROM student_certifications WHERE student_id = ? ORDER BY issue_date DESC',
      [studentProfileId]
    );

    const [achievements] = await pool.query(
      'SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC',
      [studentProfileId]
    );

    const portfolio = {
      profile: profileRows[0],
      skills,
      projects,
      certifications,
      achievements
    };

    return sendSuccess(res, portfolio, 'Digital portfolio retrieved');
  } catch (error) {
    console.error('[Portfolio getPortfolio Error]', error);
    return sendError(res, 'Failed to fetch portfolio', 500);
  }
}

/**
 * Add project to portfolio [STUDENT ONLY]
 */
async function addProject(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const { title, description, technologies, project_url, github_url } = req.body;
    if (!title) return sendError(res, 'Project title is required', 400);

    const [result] = await pool.query(
      `INSERT INTO student_projects (student_id, title, description, technologies, project_url, github_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, title, description || '', technologies || '', project_url || '', github_url || '']
    );

    return sendSuccess(res, { id: result.insertId }, 'Project added to portfolio', 201);
  } catch (error) {
    console.error('[Portfolio addProject Error]', error);
    return sendError(res, 'Failed to add project', 500);
  }
}

/**
 * Add certification to portfolio [STUDENT ONLY]
 */
async function addCertification(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const { name, issuing_organization, issue_date, credential_id, certificate_url } = req.body;
    if (!name || !issuing_organization) return sendError(res, 'Certification name and issuing organization are required', 400);

    const [result] = await pool.query(
      `INSERT INTO student_certifications (student_id, name, issuing_organization, issue_date, credential_id, certificate_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, name, issuing_organization, issue_date || null, credential_id || '', certificate_url || '']
    );

    return sendSuccess(res, { id: result.insertId }, 'Certification added to portfolio', 201);
  } catch (error) {
    console.error('[Portfolio addCertification Error]', error);
    return sendError(res, 'Failed to add certification', 500);
  }
}

module.exports = {
  getPortfolio,
  addProject,
  addCertification
};

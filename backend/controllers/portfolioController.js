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

    // Get internships
    const [internships] = await pool.query(
      'SELECT * FROM student_internships WHERE student_id = ? ORDER BY COALESCE(start_date, created_at) DESC',
      [studentProfileId]
    );

    const portfolio = {
      profile: profileRows[0],
      skills,
      projects,
      certifications,
      achievements,
      internships
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

    const {
      title,
      description = '',
      technologies = '',
      project_url = '',
      github_url = '',
      image_url = '',
      role = 'Full Stack Developer',
      featured = 0
    } = req.body;

    if (!title || !title.trim()) return sendError(res, 'Project title is required', 400);

    const [result] = await pool.query(
      `INSERT INTO student_projects 
       (student_id, title, description, technologies, project_url, github_url, image_url, role, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        title.trim(),
        description,
        technologies,
        project_url,
        github_url,
        image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        role,
        featured ? 1 : 0
      ]
    );

    // Activity log
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'PROJECT_ADDED', 'Added Technical Project', ?)`,
      [userId, `Added project: ${title}`]
    );

    return sendSuccess(res, { id: result.insertId }, 'Project added to portfolio', 201);
  } catch (error) {
    console.error('[Portfolio addProject Error]', error);
    return sendError(res, 'Failed to add project: ' + error.message, 500);
  }
}

/**
 * Update project in portfolio [STUDENT ONLY]
 */
async function updateProject(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const projectId = req.params.id;
    const {
      title,
      description,
      technologies,
      project_url,
      github_url,
      image_url,
      role,
      featured
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM student_projects WHERE id = ? AND student_id = ? LIMIT 1', [projectId, studentId]);
    if (existing.length === 0) return sendError(res, 'Project not found or unauthorized', 404);

    await pool.query(
      `UPDATE student_projects SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        technologies = COALESCE(?, technologies),
        project_url = COALESCE(?, project_url),
        github_url = COALESCE(?, github_url),
        image_url = COALESCE(?, image_url),
        role = COALESCE(?, role),
        featured = COALESCE(?, featured)
       WHERE id = ? AND student_id = ?`,
      [title, description, technologies, project_url, github_url, image_url, role, featured, projectId, studentId]
    );

    return sendSuccess(res, { id: projectId }, 'Project updated successfully');
  } catch (error) {
    console.error('[Portfolio updateProject Error]', error);
    return sendError(res, 'Failed to update project: ' + error.message, 500);
  }
}

/**
 * Delete project from portfolio [STUDENT ONLY]
 */
async function deleteProject(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const projectId = req.params.id;
    const [result] = await pool.query('DELETE FROM student_projects WHERE id = ? AND student_id = ?', [projectId, studentId]);
    if (result.affectedRows === 0) return sendError(res, 'Project not found or unauthorized', 404);

    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    console.error('[Portfolio deleteProject Error]', error);
    return sendError(res, 'Failed to delete project: ' + error.message, 500);
  }
}

/**
 * Add internship to portfolio [STUDENT ONLY]
 */
async function addInternship(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const {
      company_name,
      role,
      duration = '3 Months',
      location = 'Remote / Hybrid',
      start_date,
      end_date,
      description = '',
      technologies_used = '',
      certificate_url = ''
    } = req.body;

    if (!company_name || !role) return sendError(res, 'Company name and role are required', 400);

    const [result] = await pool.query(
      `INSERT INTO student_internships 
       (student_id, company_name, role, duration, location, start_date, end_date, description, technologies_used, certificate_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        company_name,
        role,
        duration,
        location,
        start_date || null,
        end_date || null,
        description,
        technologies_used,
        certificate_url
      ]
    );

    return sendSuccess(res, { id: result.insertId }, 'Internship added to portfolio', 201);
  } catch (error) {
    console.error('[Portfolio addInternship Error]', error);
    return sendError(res, 'Failed to add internship: ' + error.message, 500);
  }
}

/**
 * Delete internship [STUDENT ONLY]
 */
async function deleteInternship(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const internshipId = req.params.id;
    const [result] = await pool.query('DELETE FROM student_internships WHERE id = ? AND student_id = ?', [internshipId, studentId]);
    if (result.affectedRows === 0) return sendError(res, 'Internship not found or unauthorized', 404);

    return sendSuccess(res, null, 'Internship deleted successfully');
  } catch (error) {
    console.error('[Portfolio deleteInternship Error]', error);
    return sendError(res, 'Failed to delete internship: ' + error.message, 500);
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
  updateProject,
  deleteProject,
  addInternship,
  deleteInternship,
  addCertification
};

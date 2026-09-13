const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get student profile
 */
async function getStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.user_id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }

    return sendSuccess(res, rows[0], 'Student profile fetched successfully');
  } catch (error) {
    console.error('[Student getProfile Error]', error);
    return sendError(res, 'Failed to fetch student profile', 500);
  }
}

/**
 * Update student profile
 */
async function updateStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      headline,
      bio,
      department,
      degree,
      enrollment_number,
      graduation_year,
      cgpa,
      github_url,
      linkedin_url,
      tenth_board,
      tenth_school,
      tenth_year,
      tenth_percentage,
      twelfth_board,
      twelfth_college,
      twelfth_year,
      twelfth_percentage,
      ug_university,
      ug_college,
      address,
      phone
    } = req.body;

    await pool.query(
      `UPDATE student_profiles SET
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio),
        department = COALESCE(?, department),
        degree = COALESCE(?, degree),
        enrollment_number = COALESCE(?, enrollment_number),
        graduation_year = COALESCE(?, graduation_year),
        cgpa = COALESCE(?, cgpa),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        tenth_board = COALESCE(?, tenth_board),
        tenth_school = COALESCE(?, tenth_school),
        tenth_year = COALESCE(?, tenth_year),
        tenth_percentage = COALESCE(?, tenth_percentage),
        twelfth_board = COALESCE(?, twelfth_board),
        twelfth_college = COALESCE(?, twelfth_college),
        twelfth_year = COALESCE(?, twelfth_year),
        twelfth_percentage = COALESCE(?, twelfth_percentage),
        ug_university = COALESCE(?, ug_university),
        ug_college = COALESCE(?, ug_college),
        address = COALESCE(?, address),
        profile_completed_pct = 95
       WHERE user_id = ?`,
      [
        headline, bio, department, degree, enrollment_number, graduation_year, cgpa,
        github_url, linkedin_url, tenth_board, tenth_school, tenth_year, tenth_percentage,
        twelfth_board, twelfth_college, twelfth_year, twelfth_percentage,
        ug_university, ug_college, address, userId
      ]
    );

    if (phone) {
      await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone, userId]);
    }

    // Log profile update in user_activity_logs
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'PROFILE_UPDATE', 'Updated Educational Profile', 'Updated academic qualifications, portfolio links, and career preferences.')`,
      [userId]
    );

    return sendSuccess(res, null, 'Student profile and qualifications updated successfully');
  } catch (error) {
    console.error('[Student updateProfile Error]', error);
    return sendError(res, 'Failed to update student profile', 500);
  }
}

/**
 * Get student assessed skills
 */
async function getStudentSkills(req, res) {
  try {
    const userId = req.user.id;
    const [profile] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (profile.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }
    const studentId = profile[0].id;

    const [skills] = await pool.query(
      `SELECT ss.*, s.name AS skill_name, s.description AS skill_desc, sc.name AS category_name, sc.type AS category_type
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE ss.student_id = ?
       ORDER BY ss.score DESC`,
      [studentId]
    );

    return sendSuccess(res, skills, 'Student skills retrieved successfully');
  } catch (error) {
    console.error('[Student getSkills Error]', error);
    return sendError(res, 'Failed to fetch student skills', 500);
  }
}

/**
 * Get student skill gap analysis
 */
async function getStudentSkillGaps(req, res) {
  try {
    const userId = req.user.id;
    const [profile] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (profile.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }
    const studentId = profile[0].id;

    const [gaps] = await pool.query(
      `SELECT sg.*, s.name AS skill_name, s.industry_demand_pct, sc.name AS category_name
       FROM skill_gaps sg
       JOIN skills s ON sg.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE sg.student_id = ?
       ORDER BY (sg.required_score - sg.current_score) DESC`,
      [studentId]
    );

    return sendSuccess(res, gaps, 'Student skill gaps retrieved successfully');
  } catch (error) {
    console.error('[Student getSkillGaps Error]', error);
    return sendError(res, 'Failed to fetch student skill gaps', 500);
  }
}

/**
 * Get student dashboard summary
 */
async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;
    const [profile] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (profile.length === 0) {
      return sendError(res, 'Student profile not found', 404);
    }
    const student = profile[0];

    // Count applications
    const [apps] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "SHORTLISTED" THEN 1 ELSE 0 END) as shortlisted FROM applications WHERE applicant_id = ?',
      [userId]
    );

    // Count certifications & projects
    const [certs] = await pool.query('SELECT COUNT(*) as total FROM student_certifications WHERE student_id = ?', [student.id]);
    const [projs] = await pool.query('SELECT COUNT(*) as total FROM student_projects WHERE student_id = ?', [student.id]);

    const summary = {
      overallScore: student.overall_skill_score || 0,
      techScore: student.technical_skill_score || 0,
      softScore: student.soft_skill_score || 0,
      profileCompletion: student.profile_completed_pct || 50,
      totalApplications: apps[0].total || 0,
      shortlisted: apps[0].shortlisted || 0,
      certifications: certs[0].total || 0,
      projects: projs[0].total || 0,
      isPlaced: Boolean(student.is_placed)
    };

    return sendSuccess(res, summary, 'Student dashboard summary retrieved');
  } catch (error) {
    console.error('[Student getDashboardSummary Error]', error);
    return sendError(res, 'Failed to fetch dashboard summary', 500);
  }
}

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  getStudentSkillGaps,
  getDashboardSummary
};

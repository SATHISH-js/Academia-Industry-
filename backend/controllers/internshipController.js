const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * List all active internships with search, filters, and optional candidate match score
 */
async function listInternships(req, res) {
  try {
    const { keyword, workMode, location } = req.query;

    let query = `
      SELECT i.*, ip.company_name, ip.city AS company_city, ip.website AS company_website,
             GROUP_CONCAT(s.name SEPARATOR ', ') AS skill_names
      FROM internships i
      JOIN industry_profiles ip ON i.industry_id = ip.id
      LEFT JOIN internship_skills isk ON i.id = isk.internship_id
      LEFT JOIN skills s ON isk.skill_id = s.id
      WHERE i.status = 'ACTIVE'
    `;
    const params = [];

    if (keyword) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ? OR ip.company_name LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (workMode) {
      query += ` AND i.work_mode = ?`;
      params.push(workMode);
    }

    if (location) {
      query += ` AND (i.location LIKE ? OR ip.city LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`);
    }

    query += ` GROUP BY i.id ORDER BY i.created_at DESC`;

    const [rows] = await pool.query(query, params);

    // If a student is authenticated, enrich internships with dynamic skill match calculation!
    if (req.user && req.user.role === 'STUDENT') {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [req.user.id]);
      if (stu.length > 0) {
        const studentId = stu[0].id;
        const [studentSkills] = await pool.query(
          'SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
          [studentId]
        );

        for (const item of rows) {
          const [reqSkills] = await pool.query(
            'SELECT isk.*, s.name as skill_name FROM internship_skills isk JOIN skills s ON isk.skill_id = s.id WHERE isk.internship_id = ?',
            [item.id]
          );
          const matchResult = calculateSkillMatch(studentSkills, reqSkills);
          item.matchScore = matchResult.matchScore;
          item.matchedSkills = matchResult.matchedSkills;
          item.skillGaps = matchResult.skillGaps;
        }
      }
    }

    return sendSuccess(res, rows, 'Internships retrieved successfully');
  } catch (error) {
    console.error('[Internship listInternships Error]', error);
    return sendError(res, 'Failed to fetch internships', 500);
  }
}

/**
 * Get internship details with required skills
 */
async function getInternshipById(req, res) {
  try {
    const internshipId = req.params.id;

    const [rows] = await pool.query(
      `SELECT i.*, ip.company_name, ip.city AS company_city, ip.website AS company_website, ip.description AS company_desc
       FROM internships i
       JOIN industry_profiles ip ON i.industry_id = ip.id
       WHERE i.id = ? LIMIT 1`,
      [internshipId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Internship opportunity not found', 404);
    }

    const internship = rows[0];

    // Get required skills
    const [skills] = await pool.query(
      `SELECT isk.*, s.name AS skill_name, s.description AS skill_desc
       FROM internship_skills isk
       JOIN skills s ON isk.skill_id = s.id
       WHERE isk.internship_id = ?`,
      [internshipId]
    );

    internship.requiredSkills = skills;

    // If student is logged in, calculate compatibility
    if (req.user && req.user.role === 'STUDENT') {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [req.user.id]);
      if (stu.length > 0) {
        const [studentSkills] = await pool.query(
          'SELECT ss.skill_id, ss.score, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
          [stu[0].id]
        );
        const matchResult = calculateSkillMatch(studentSkills, skills);
        internship.matchScore = matchResult.matchScore;
        internship.matchedSkills = matchResult.matchedSkills;
        internship.missingSkills = matchResult.missingSkills;
        internship.skillGaps = matchResult.skillGaps;
      }
    }

    return sendSuccess(res, internship, 'Internship details retrieved');
  } catch (error) {
    console.error('[Internship getInternshipById Error]', error);
    return sendError(res, 'Failed to fetch internship details', 500);
  }
}

/**
 * Create a new internship posting [INDUSTRY ONLY]
 */
async function createInternship(req, res) {
  const userId = req.user.id;
  const {
    title,
    description,
    location,
    work_mode,
    duration_months,
    stipend_amount,
    openings,
    deadline,
    min_skill_score,
    education_requirement,
    skills // Array of { skill_id, min_required_score, is_mandatory }
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ind] = await connection.query('SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (ind.length === 0) {
      await connection.rollback();
      return sendError(res, 'Industry profile not found', 404);
    }
    const industryId = ind[0].id;

    const [result] = await connection.query(
      `INSERT INTO internships (industry_id, title, description, location, work_mode, duration_months, stipend_amount, openings, deadline, min_skill_score, education_requirement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [industryId, title, description, location || 'Bengaluru', work_mode || 'HYBRID', duration_months || 3, stipend_amount || 'Stipend provided', openings || 2, deadline, min_skill_score || 60, education_requirement || 'B.Tech / MCA']
    );

    const internshipId = result.insertId;

    if (skills && Array.isArray(skills)) {
      for (const sk of skills) {
        await connection.query(
          `INSERT INTO internship_skills (internship_id, skill_id, min_required_score, is_mandatory)
           VALUES (?, ?, ?, ?)`,
          [internshipId, sk.skill_id, sk.min_required_score || 70, sk.is_mandatory !== false]
        );
      }
    }

    await connection.commit();
    return sendSuccess(res, { id: internshipId }, 'Internship posted successfully', 201);
  } catch (error) {
    await connection.rollback();
    console.error('[Internship createInternship Error]', error);
    return sendError(res, 'Failed to post internship: ' + error.message, 500);
  } finally {
    connection.release();
  }
}

module.exports = {
  listInternships,
  getInternshipById,
  createInternship
};

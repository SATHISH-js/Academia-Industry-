const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * List all active jobs with search and filter
 */
async function listJobs(req, res) {
  try {
    const { keyword, workMode, location } = req.query;

    let query = `
      SELECT j.*, ip.company_name, ip.city AS company_city, ip.website AS company_website,
             GROUP_CONCAT(s.name SEPARATOR ', ') AS skill_names
      FROM jobs j
      JOIN industry_profiles ip ON j.industry_id = ip.id
      LEFT JOIN job_skills jsk ON j.id = jsk.job_id
      LEFT JOIN skills s ON jsk.skill_id = s.id
      WHERE j.status = 'ACTIVE'
    `;
    const params = [];

    if (keyword) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR ip.company_name LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (workMode) {
      query += ` AND j.work_mode = ?`;
      params.push(workMode);
    }

    if (location) {
      query += ` AND (j.location LIKE ? OR ip.city LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`);
    }

    query += ` GROUP BY j.id ORDER BY j.created_at DESC`;

    const [rows] = await pool.query(query, params);

    // Calculate match score if student is logged in
    if (req.user && req.user.role === 'STUDENT') {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [req.user.id]);
      if (stu.length > 0) {
        const studentId = stu[0].id;
        const [studentSkills] = await pool.query(
          'SELECT ss.skill_id, ss.score, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
          [studentId]
        );

        for (const item of rows) {
          const [reqSkills] = await pool.query(
            'SELECT jsk.*, s.name as skill_name FROM job_skills jsk JOIN skills s ON jsk.skill_id = s.id WHERE jsk.job_id = ?',
            [item.id]
          );
          const matchResult = calculateSkillMatch(studentSkills, reqSkills);
          item.matchScore = matchResult.matchScore;
          item.matchedSkills = matchResult.matchedSkills;
          item.skillGaps = matchResult.skillGaps;
        }
      }
    }

    return sendSuccess(res, rows, 'Jobs retrieved successfully');
  } catch (error) {
    console.error('[Job listJobs Error]', error);
    return sendError(res, 'Failed to fetch jobs', 500);
  }
}

/**
 * Get job details by ID with required skills
 */
async function getJobById(req, res) {
  try {
    const jobId = req.params.id;

    const [rows] = await pool.query(
      `SELECT j.*, ip.company_name, ip.city AS company_city, ip.website AS company_website, ip.description AS company_desc
       FROM jobs j
       JOIN industry_profiles ip ON j.industry_id = ip.id
       WHERE j.id = ? LIMIT 1`,
      [jobId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Job opportunity not found', 404);
    }

    const job = rows[0];

    const [skills] = await pool.query(
      `SELECT jsk.*, s.name AS skill_name, s.description AS skill_desc
       FROM job_skills jsk
       JOIN skills s ON jsk.skill_id = s.id
       WHERE jsk.job_id = ?`,
      [jobId]
    );

    job.requiredSkills = skills;

    return sendSuccess(res, job, 'Job details retrieved');
  } catch (error) {
    console.error('[Job getJobById Error]', error);
    return sendError(res, 'Failed to fetch job details', 500);
  }
}

/**
 * Create a new job posting [INDUSTRY ONLY]
 */
async function createJob(req, res) {
  const userId = req.user.id;
  const {
    title,
    description,
    location,
    work_mode,
    salary_range,
    experience_years,
    education,
    openings,
    deadline,
    skills
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
      `INSERT INTO jobs (industry_id, title, description, location, work_mode, salary_range, experience_years, education, openings, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [industryId, title, description, location || 'Bengaluru', work_mode || 'ONSITE', salary_range || 'Competitive', experience_years || 0, education || 'B.Tech / MCA', openings || 1, deadline]
    );

    const jobId = result.insertId;

    if (skills && Array.isArray(skills)) {
      for (const sk of skills) {
        await connection.query(
          `INSERT INTO job_skills (job_id, skill_id, min_required_score, is_mandatory)
           VALUES (?, ?, ?, ?)`,
          [jobId, sk.skill_id, sk.min_required_score || 75, sk.is_mandatory !== false]
        );
      }
    }

    await connection.commit();
    return sendSuccess(res, { id: jobId }, 'Job posted successfully', 201);
  } catch (error) {
    await connection.rollback();
    console.error('[Job createJob Error]', error);
    return sendError(res, 'Failed to post job', 500);
  } finally {
    connection.release();
  }
}

module.exports = {
  listJobs,
  getJobById,
  createJob
};

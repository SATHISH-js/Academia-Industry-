const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Advanced candidate search & role matching with skill compatibility score
 * [INDUSTRY ONLY]
 */
async function searchCandidates(req, res) {
  try {
    const {
      opportunityType,
      opportunityId,
      minScore,
      department,
      minCgpa,
      graduationYear,
      keyword
    } = req.query;

    // 1. Determine benchmark skills to match against
    let requiredSkills = [];

    if (opportunityType && opportunityId) {
      if (opportunityType.toUpperCase() === 'INTERNSHIP') {
        const [skills] = await pool.query(
          `SELECT isk.skill_id, isk.min_required_score, isk.is_mandatory, s.name AS skill_name
           FROM internship_skills isk
           JOIN skills s ON isk.skill_id = s.id
           WHERE isk.internship_id = ?`,
          [opportunityId]
        );
        requiredSkills = skills;
      } else if (opportunityType.toUpperCase() === 'JOB') {
        const [skills] = await pool.query(
          `SELECT jsk.skill_id, jsk.min_required_score, jsk.is_mandatory, s.name AS skill_name
           FROM job_skills jsk
           JOIN skills s ON jsk.skill_id = s.id
           WHERE jsk.job_id = ?`,
          [opportunityId]
        );
        requiredSkills = skills;
      }
    }

    // Default benchmark skills if none specified (Top Full-Stack & Engineering benchmarks)
    if (requiredSkills.length === 0) {
      const [defaultSkills] = await pool.query(
        `SELECT id AS skill_id, name AS skill_name, 75 AS min_required_score, TRUE AS is_mandatory
         FROM skills
         WHERE name IN ('Python', 'React', 'SQL', 'Data Structures & Algorithms', 'Node.js', 'Git')
         LIMIT 4`
      );
      requiredSkills = defaultSkills;
    }

    // 2. Query student candidates with profile and academic details
    let studentQuery = `
      SELECT sp.id AS student_id, sp.user_id, u.name, u.email, u.phone, sp.department, sp.degree,
             sp.graduation_year, sp.cgpa, sp.overall_skill_score, sp.headline, sp.bio,
             sp.address, sp.github_url, sp.linkedin_url,
             sp.tenth_percentage, sp.twelfth_percentage,
             inst.institution_name
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN institution_profiles inst ON sp.institution_id = inst.id
      WHERE u.is_active = TRUE
    `;
    const params = [];

    if (department) {
      studentQuery += ` AND sp.department LIKE ?`;
      params.push(`%${department}%`);
    }

    if (minCgpa) {
      studentQuery += ` AND sp.cgpa >= ?`;
      params.push(parseFloat(minCgpa));
    }

    if (graduationYear) {
      studentQuery += ` AND sp.graduation_year = ?`;
      params.push(parseInt(graduationYear, 10));
    }

    if (keyword) {
      studentQuery += ` AND (u.name LIKE ? OR sp.headline LIKE ? OR sp.department LIKE ? OR sp.bio LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw, kw);
    }

    const [students] = await pool.query(studentQuery, params);

    // 3. Calculate match score for every candidate
    const candidates = [];
    const minThreshold = minScore ? parseInt(minScore, 10) : 0;

    for (const stu of students) {
      const [studentSkills] = await pool.query(
        `SELECT ss.skill_id, ss.score, ss.level, s.name AS skill_name
         FROM student_skills ss
         JOIN skills s ON ss.skill_id = s.id
         WHERE ss.student_id = ?`,
        [stu.student_id]
      );

      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);

      // Filter by minScore threshold
      if (matchResult.matchScore >= minThreshold) {
        candidates.push({
          ...stu,
          matchScore: matchResult.matchScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          skillGaps: matchResult.skillGaps,
          skills: studentSkills
        });
      }
    }

    // Sort descending by match score, then by CGPA
    candidates.sort((a, b) => b.matchScore - a.matchScore || (b.cgpa || 0) - (a.cgpa || 0));

    return sendSuccess(res, {
      benchmarkSkills: requiredSkills,
      totalMatches: candidates.length,
      candidates
    }, 'Candidates filtered and ranked by role match score successfully');
  } catch (error) {
    console.error('[Industry searchCandidates Error]', error);
    return sendError(res, 'Failed to search matching candidates: ' + error.message, 500);
  }
}

/**
 * Send in-app message / direct outreach invitation to a candidate
 * [INDUSTRY ONLY]
 */
async function sendMessageToStudent(req, res) {
  try {
    const userId = req.user.id;
    const {
      student_id,
      opportunity_type,
      opportunity_id,
      subject,
      message,
      message_type
    } = req.body;

    if (!student_id || !subject || !message) {
      return sendError(res, 'Student ID, subject, and message are required', 400);
    }

    // Get industry profile
    const [ind] = await pool.query(
      'SELECT id, company_name FROM industry_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industry = ind[0];

    // Get student profile and user_id
    const [stu] = await pool.query(
      'SELECT id, user_id FROM student_profiles WHERE id = ? LIMIT 1',
      [student_id]
    );
    if (stu.length === 0) return sendError(res, 'Student candidate not found', 404);
    const student = stu[0];

    // Insert direct message
    const [result] = await pool.query(
      `INSERT INTO industry_student_messages 
       (industry_id, student_id, opportunity_type, opportunity_id, subject, message, message_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SENT')`,
      [
        industry.id,
        student.id,
        opportunity_type || 'GENERAL',
        opportunity_id || null,
        subject,
        message,
        message_type || 'ROLE_INQUIRY'
      ]
    );

    // Push in-app notification to the student
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'OPPORTUNITY', '/student/portfolio')`,
      [
        student.user_id,
        `New Message from ${industry.company_name}: ${subject}`,
        message.length > 250 ? message.substring(0, 247) + '...' : message
      ]
    );

    // Log industry activity
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'APPLICATION', ?, ?)`,
      [
        userId,
        `Contacted Candidate #${student.id}`,
        `Sent ${message_type || 'role inquiry'} regarding ${subject}`
      ]
    );

    return sendSuccess(res, { message_id: result.insertId }, 'Message sent to student successfully', 201);
  } catch (error) {
    console.error('[Industry sendMessageToStudent Error]', error);
    return sendError(res, 'Failed to send message to student: ' + error.message, 500);
  }
}

/**
 * Get all outreach messages sent by this industry
 * [INDUSTRY ONLY]
 */
async function getSentMessages(req, res) {
  try {
    const userId = req.user.id;
    const [ind] = await pool.query(
      'SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industryId = ind[0].id;

    const [rows] = await pool.query(
      `SELECT ism.*, u.name AS student_name, u.email AS student_email,
              sp.headline AS student_headline, sp.department AS student_dept,
              sp.degree AS student_degree, sp.cgpa AS student_cgpa
       FROM industry_student_messages ism
       JOIN student_profiles sp ON ism.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE ism.industry_id = ?
       ORDER BY ism.created_at DESC`,
      [industryId]
    );

    return sendSuccess(res, rows, 'Sent messages retrieved successfully');
  } catch (error) {
    console.error('[Industry getSentMessages Error]', error);
    return sendError(res, 'Failed to fetch sent messages', 500);
  }
}

/**
 * List all verified institutions for campus recruitment & placement drives
 * [INDUSTRY ONLY]
 */
async function getInstitutions(req, res) {
  try {
    const [institutions] = await pool.query(
      `SELECT ip.id, ip.user_id, ip.institution_name, ip.institution_type,
              ip.website, ip.city, ip.state, ip.accreditation, ip.description,
              COUNT(DISTINCT sp.id) AS student_count
       FROM institution_profiles ip
       LEFT JOIN student_profiles sp ON ip.id = sp.institution_id
       GROUP BY ip.id
       ORDER BY ip.institution_name ASC`
    );

    return sendSuccess(res, institutions, 'Institutions directory retrieved successfully');
  } catch (error) {
    console.error('[Industry getInstitutions Error]', error);
    return sendError(res, 'Failed to fetch institutions', 500);
  }
}

/**
 * Propose a campus placement drive / partnership to an institution
 * [INDUSTRY ONLY]
 */
async function requestPlacementDrive(req, res) {
  try {
    const userId = req.user.id;
    const {
      institution_id,
      title,
      target_batch,
      target_departments,
      expected_hires,
      salary_package,
      proposed_date,
      proposal_details
    } = req.body;

    if (!institution_id || !title || !proposal_details) {
      return sendError(res, 'Institution ID, drive title, and proposal details are required', 400);
    }

    const [ind] = await pool.query(
      'SELECT id, company_name FROM industry_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industry = ind[0];

    // Find institution user_id for notifications
    const [inst] = await pool.query(
      'SELECT user_id, institution_name FROM institution_profiles WHERE id = ? LIMIT 1',
      [institution_id]
    );
    if (inst.length === 0) return sendError(res, 'Target institution not found', 404);
    const institution = inst[0];

    const [result] = await pool.query(
      `INSERT INTO institution_placement_requests
       (industry_id, institution_id, title, target_batch, target_departments, expected_hires, salary_package, proposed_date, proposal_details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        industry.id,
        institution_id,
        title,
        target_batch || '2025 - 2026',
        target_departments || 'Computer Science, IT',
        expected_hires || 5,
        salary_package || 'Competitive',
        proposed_date || null,
        proposal_details
      ]
    );

    // Notify institution user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/institution/partners')`,
      [
        institution.user_id,
        `Placement Partnership Request from ${industry.company_name}`,
        `${industry.company_name} has proposed a campus recruitment drive: "${title}".`
      ]
    );

    return sendSuccess(res, { request_id: result.insertId }, 'Campus placement drive requested successfully', 201);
  } catch (error) {
    console.error('[Industry requestPlacementDrive Error]', error);
    return sendError(res, 'Failed to request placement drive: ' + error.message, 500);
  }
}

/**
 * Get placement drive proposals submitted by this industry
 * [INDUSTRY ONLY]
 */
async function getMyPlacementRequests(req, res) {
  try {
    const userId = req.user.id;
    const [ind] = await pool.query(
      'SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industryId = ind[0].id;

    const [rows] = await pool.query(
      `SELECT ipr.*, ip.institution_name, ip.city AS institution_city, ip.website AS institution_website
       FROM institution_placement_requests ipr
       JOIN institution_profiles ip ON ipr.institution_id = ip.id
       WHERE ipr.industry_id = ?
       ORDER BY ipr.created_at DESC`,
      [industryId]
    );

    return sendSuccess(res, rows, 'Placement requests retrieved successfully');
  } catch (error) {
    console.error('[Industry getMyPlacementRequests Error]', error);
    return sendError(res, 'Failed to fetch placement requests', 500);
  }
}

/**
 * Get all opportunities posted by the current industry company with applicant counts
 * [INDUSTRY ONLY]
 */
async function getMyOpportunities(req, res) {
  try {
    const userId = req.user.id;
    const [ind] = await pool.query(
      'SELECT id, company_name FROM industry_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industryId = ind[0].id;

    // Fetch posted internships
    const [internships] = await pool.query(
      `SELECT i.*, 'INTERNSHIP' AS opportunity_type,
              COUNT(DISTINCT a.id) AS applicant_count,
              GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS skill_names
       FROM internships i
       LEFT JOIN applications a ON a.opportunity_type = 'INTERNSHIP' AND a.opportunity_id = i.id
       LEFT JOIN internship_skills isk ON i.id = isk.internship_id
       LEFT JOIN skills s ON isk.skill_id = s.id
       WHERE i.industry_id = ?
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [industryId]
    );

    // Fetch posted jobs
    const [jobs] = await pool.query(
      `SELECT j.*, 'JOB' AS opportunity_type,
              COUNT(DISTINCT a.id) AS applicant_count,
              GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS skill_names
       FROM jobs j
       LEFT JOIN applications a ON a.opportunity_type = 'JOB' AND a.opportunity_id = j.id
       LEFT JOIN job_skills jsk ON j.id = jsk.job_id
       LEFT JOIN skills s ON jsk.skill_id = s.id
       WHERE j.industry_id = ?
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [industryId]
    );

    return sendSuccess(res, {
      internships,
      jobs,
      totalOpportunities: internships.length + jobs.length
    }, 'My posted opportunities retrieved successfully');
  } catch (error) {
    console.error('[Industry getMyOpportunities Error]', error);
    return sendError(res, 'Failed to fetch posted opportunities', 500);
  }
}

module.exports = {
  searchCandidates,
  sendMessageToStudent,
  getSentMessages,
  getInstitutions,
  requestPlacementDrive,
  getMyPlacementRequests,
  getMyOpportunities
};

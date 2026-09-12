const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Submit an application for an internship, job, or research collaboration
 */
async function submitApplication(req, res) {
  const applicantId = req.user.id;
  const applicantRole = req.user.role;
  const { opportunity_type, opportunity_id, cover_note } = req.body;

  if (!opportunity_type || !opportunity_id) {
    return sendError(res, 'opportunity_type and opportunity_id are required', 400);
  }

  try {
    // Check for duplicate application
    const [dup] = await pool.query(
      'SELECT id FROM applications WHERE applicant_id = ? AND opportunity_type = ? AND opportunity_id = ? LIMIT 1',
      [applicantId, opportunity_type, opportunity_id]
    );
    if (dup.length > 0) {
      return sendError(res, 'You have already submitted an application for this opportunity.', 409);
    }

    let matchScore = 0;
    let industryUserId = null;
    let opportunityTitle = 'Opportunity';

    // Calculate match score if student
    if (applicantRole === 'STUDENT') {
      const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [applicantId]);
      if (stu.length > 0) {
        const studentId = stu[0].id;
        const [studentSkills] = await pool.query(
          'SELECT ss.skill_id, ss.score, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
          [studentId]
        );

        let reqSkills = [];
        if (opportunity_type === 'INTERNSHIP') {
          const [opp] = await pool.query(
            'SELECT i.title, ip.user_id as industry_user_id FROM internships i JOIN industry_profiles ip ON i.industry_id = ip.id WHERE i.id = ?',
            [opportunity_id]
          );
          if (opp.length > 0) {
            opportunityTitle = opp[0].title;
            industryUserId = opp[0].industry_user_id;
          }
          const [sk] = await pool.query(
            'SELECT isk.*, s.name as skill_name FROM internship_skills isk JOIN skills s ON isk.skill_id = s.id WHERE isk.internship_id = ?',
            [opportunity_id]
          );
          reqSkills = sk;
        } else if (opportunity_type === 'JOB') {
          const [opp] = await pool.query(
            'SELECT j.title, ip.user_id as industry_user_id FROM jobs j JOIN industry_profiles ip ON j.industry_id = ip.id WHERE j.id = ?',
            [opportunity_id]
          );
          if (opp.length > 0) {
            opportunityTitle = opp[0].title;
            industryUserId = opp[0].industry_user_id;
          }
          const [sk] = await pool.query(
            'SELECT jsk.*, s.name as skill_name FROM job_skills jsk JOIN skills s ON jsk.skill_id = s.id WHERE jsk.job_id = ?',
            [opportunity_id]
          );
          reqSkills = sk;
        }

        const match = calculateSkillMatch(studentSkills, reqSkills);
        matchScore = match.matchScore;
      }
    }

    // Insert application
    const [result] = await pool.query(
      `INSERT INTO applications (applicant_id, applicant_role, opportunity_type, opportunity_id, status, match_score, cover_note)
       VALUES (?, ?, ?, ?, 'APPLIED', ?, ?)`,
      [applicantId, applicantRole, opportunity_type, opportunity_id, matchScore, cover_note || '']
    );

    // Create notification for industry recruiter
    if (industryUserId) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'OPPORTUNITY', '/industry/applications')`,
        [
          industryUserId,
          'New Candidate Application',
          `${req.user.name} applied for "${opportunityTitle}" with a compatibility match score of ${matchScore}%.`
        ]
      );
    }

    // Create confirmation notification for applicant
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'APPLICATION_UPDATE', '/student/applications')`,
      [
        applicantId,
        'Application Submitted',
        `Your application for "${opportunityTitle}" has been received and forwarded to the hiring team.`
      ]
    );

    return sendSuccess(res, { id: result.insertId, matchScore, status: 'APPLIED' }, 'Application submitted successfully', 201);
  } catch (error) {
    console.error('[Application submitApplication Error]', error);
    return sendError(res, 'Failed to submit application: ' + error.message, 500);
  }
}

/**
 * Get applications (Role-sensitive)
 */
async function getApplications(req, res) {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    if (role === 'STUDENT' || role === 'ACADEMICIAN') {
      // Return the user's submitted applications
      const [rows] = await pool.query(
        `SELECT a.*,
          CASE
            WHEN a.opportunity_type = 'INTERNSHIP' THEN (SELECT title FROM internships WHERE id = a.opportunity_id)
            WHEN a.opportunity_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = a.opportunity_id)
            WHEN a.opportunity_type = 'RESEARCH' THEN (SELECT title FROM research_projects WHERE id = a.opportunity_id)
            ELSE 'Opportunity'
          END AS opportunity_title,
          CASE
            WHEN a.opportunity_type = 'INTERNSHIP' THEN (SELECT ip.company_name FROM internships i JOIN industry_profiles ip ON i.industry_id = ip.id WHERE i.id = a.opportunity_id)
            WHEN a.opportunity_type = 'JOB' THEN (SELECT ip.company_name FROM jobs j JOIN industry_profiles ip ON j.industry_id = ip.id WHERE j.id = a.opportunity_id)
            WHEN a.opportunity_type = 'RESEARCH' THEN (SELECT ip.company_name FROM research_projects rp JOIN industry_profiles ip ON rp.industry_id = ip.id WHERE rp.id = a.opportunity_id)
            ELSE 'Enterprise'
          END AS company_name
         FROM applications a
         WHERE a.applicant_id = ?
         ORDER BY a.created_at DESC`,
        [userId]
      );
      return sendSuccess(res, rows, 'User applications retrieved');
    } else if (role === 'INDUSTRY') {
      // Return applications for opportunities posted by this industry
      const [ind] = await pool.query('SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1', [userId]);
      if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
      const industryId = ind[0].id;

      const [rows] = await pool.query(
        `SELECT a.*, u.name as candidate_name, u.email as candidate_email,
                sp.department, sp.cgpa, sp.overall_skill_score,
                CASE
                  WHEN a.opportunity_type = 'INTERNSHIP' THEN (SELECT title FROM internships WHERE id = a.opportunity_id)
                  WHEN a.opportunity_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = a.opportunity_id)
                  WHEN a.opportunity_type = 'RESEARCH' THEN (SELECT title FROM research_projects WHERE id = a.opportunity_id)
                  ELSE 'Opportunity'
                END AS opportunity_title
         FROM applications a
         JOIN users u ON a.applicant_id = u.id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE (a.opportunity_type = 'INTERNSHIP' AND a.opportunity_id IN (SELECT id FROM internships WHERE industry_id = ?))
            OR (a.opportunity_type = 'JOB' AND a.opportunity_id IN (SELECT id FROM jobs WHERE industry_id = ?))
            OR (a.opportunity_type = 'RESEARCH' AND a.opportunity_id IN (SELECT id FROM research_projects WHERE industry_id = ?))
         ORDER BY a.match_score DESC, a.created_at DESC`,
        [industryId, industryId, industryId]
      );
      return sendSuccess(res, rows, 'Industry candidate applications retrieved');
    }

    return sendError(res, 'Unauthorized to view applications', 403);
  } catch (error) {
    console.error('[Application getApplications Error]', error);
    return sendError(res, 'Failed to fetch applications', 500);
  }
}

/**
 * Update application status [INDUSTRY ONLY]
 */
async function updateApplicationStatus(req, res) {
  const applicationId = req.params.id;
  const { status, feedback } = req.body;

  const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  try {
    const [appRows] = await pool.query('SELECT * FROM applications WHERE id = ? LIMIT 1', [applicationId]);
    if (appRows.length === 0) {
      return sendError(res, 'Application not found', 404);
    }
    const app = appRows[0];

    // Update status
    await pool.query(
      'UPDATE applications SET status = ?, feedback = COALESCE(?, feedback), updated_at = NOW() WHERE id = ?',
      [status, feedback, applicationId]
    );

    // Notify applicant
    const notifMsg = `Your application status has been updated to ${status}.` + (feedback ? ` Note: ${feedback}` : '');
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'APPLICATION_UPDATE', '/student/applications')`,
      [app.applicant_id, `Application Update: ${status}`, notifMsg]
    );

    return sendSuccess(res, { id: applicationId, status }, 'Application status updated successfully');
  } catch (error) {
    console.error('[Application updateStatus Error]', error);
    return sendError(res, 'Failed to update application status', 500);
  }
}

module.exports = {
  submitApplication,
  getApplications,
  updateApplicationStatus
};

const { pool } = require('../config/db');
const { calculateSkillMatch } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get candidate leaderboard for an opportunity ranked by skill compatibility [INDUSTRY ONLY]
 */
async function getOpportunityCandidates(req, res) {
  const { type, id } = req.params;

  try {
    // 1. Fetch required skills for the opportunity
    let requiredSkills = [];
    if (type.toUpperCase() === 'INTERNSHIP') {
      const [skills] = await pool.query(
        'SELECT isk.*, s.name as skill_name FROM internship_skills isk JOIN skills s ON isk.skill_id = s.id WHERE isk.internship_id = ?',
        [id]
      );
      requiredSkills = skills;
    } else if (type.toUpperCase() === 'JOB') {
      const [skills] = await pool.query(
        'SELECT jsk.*, s.name as skill_name FROM job_skills jsk JOIN skills s ON jsk.skill_id = s.id WHERE jsk.job_id = ?',
        [id]
      );
      requiredSkills = skills;
    }

    // 2. Fetch all student candidates
    const [students] = await pool.query(
      `SELECT sp.id AS student_id, sp.user_id, u.name, u.email, sp.department, sp.degree, sp.graduation_year,
              sp.cgpa, sp.overall_skill_score, sp.headline, sp.github_url, sp.linkedin_url
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE u.is_active = TRUE`
    );

    const candidates = [];

    for (const stu of students) {
      // Fetch this student's skills
      const [studentSkills] = await pool.query(
        'SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
        [stu.student_id]
      );

      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);

      candidates.push({
        ...stu,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        skillGaps: matchResult.skillGaps
      });
    }

    // Sort by matchScore descending
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    return sendSuccess(res, candidates, 'Candidates compatibility ranking generated');
  } catch (error) {
    console.error('[Recommendation getOpportunityCandidates Error]', error);
    return sendError(res, 'Failed to compute candidate rankings', 500);
  }
}

/**
 * Get recommended internships ranked by student compatibility
 */
async function getRecommendedInternships(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const [studentSkills] = await pool.query(
      'SELECT ss.skill_id, ss.score, s.name as skill_name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?',
      [studentId]
    );

    const [internships] = await pool.query(
      `SELECT i.*, ip.company_name, ip.city as company_city, ip.website as company_website
       FROM internships i
       JOIN industry_profiles ip ON i.industry_id = ip.id
       WHERE i.status = 'ACTIVE'`
    );

    const ranked = [];

    for (const intern of internships) {
      const [reqSkills] = await pool.query(
        'SELECT isk.*, s.name as skill_name FROM internship_skills isk JOIN skills s ON isk.skill_id = s.id WHERE isk.internship_id = ?',
        [intern.id]
      );

      const match = calculateSkillMatch(studentSkills, reqSkills);

      ranked.push({
        ...intern,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        skillGaps: match.skillGaps
      });
    }

    // Sort descending by matchScore
    ranked.sort((a, b) => b.matchScore - a.matchScore);

    return sendSuccess(res, ranked, 'Recommended internships retrieved');
  } catch (error) {
    console.error('[Recommendation getRecommendedInternships Error]', error);
    return sendError(res, 'Failed to calculate internship recommendations', 500);
  }
}

module.exports = {
  getOpportunityCandidates,
  getRecommendedInternships
};

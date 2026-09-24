const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get academician profile
 */
async function getAcademicianProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT ap.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
       FROM academician_profiles ap
       JOIN users u ON ap.user_id = u.id
       LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id
       WHERE ap.user_id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) return sendError(res, 'Academician profile not found', 404);
    return sendSuccess(res, rows[0], 'Academician profile retrieved');
  } catch (error) {
    console.error('[Academician getProfile Error]', error);
    return sendError(res, 'Failed to fetch academician profile', 500);
  }
}

/**
 * Update academician profile
 */
async function updateAcademicianProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      avatar_url,
      designation,
      department,
      qualification,
      experience_years,
      specialization,
      research_interests,
      publications_count,
      linkedin_url
    } = req.body;

    await pool.query(
      `UPDATE academician_profiles SET
        designation = COALESCE(?, designation),
        department = COALESCE(?, department),
        qualification = COALESCE(?, qualification),
        experience_years = COALESCE(?, experience_years),
        specialization = COALESCE(?, specialization),
        research_interests = COALESCE(?, research_interests),
        publications_count = COALESCE(?, publications_count),
        linkedin_url = COALESCE(?, linkedin_url)
       WHERE user_id = ?`,
      [designation, department, qualification, experience_years, specialization, research_interests, publications_count, linkedin_url, userId]
    );

    if (name || phone || avatar_url !== undefined) {
      await pool.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
        [name || null, phone || null, avatar_url !== undefined ? avatar_url : null, userId]
      );
    }

    return sendSuccess(res, null, 'Academician profile updated successfully');
  } catch (error) {
    console.error('[Academician updateProfile Error]', error);
    return sendError(res, 'Failed to update profile', 500);
  }
}

/**
 * Get academician opportunities (Research projects, workshops, guest lectures)
 */
async function getAcademicianOpportunities(req, res) {
  try {
    const [research] = await pool.query(
      `SELECT rp.*, ip.company_name, 'RESEARCH_PROJECT' as opportunity_category
       FROM research_projects rp
       JOIN industry_profiles ip ON rp.industry_id = ip.id
       WHERE rp.status = 'ACTIVE'`
    );

    const [workshops] = await pool.query(
      `SELECT w.*, ip.company_name, 'WORKSHOP' as opportunity_category
       FROM workshops w
       JOIN industry_profiles ip ON w.industry_id = ip.id
       WHERE w.status = 'UPCOMING'`
    );

    return sendSuccess(res, { research, workshops }, 'Academician opportunities retrieved');
  } catch (error) {
    console.error('[Academician getOpportunities Error]', error);
    return sendError(res, 'Failed to fetch academician opportunities', 500);
  }
}

module.exports = {
  getAcademicianProfile,
  updateAcademicianProfile,
  getAcademicianOpportunities
};

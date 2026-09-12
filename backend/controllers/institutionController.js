const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get institution comprehensive analytics
 */
async function getInstitutionAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : null;

    // Total & assessed students
    const [stuStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN overall_skill_score > 0 THEN 1 ELSE 0 END) as assessed_students,
        AVG(CASE WHEN overall_skill_score > 0 THEN overall_skill_score ELSE NULL END) as avg_skill_score,
        SUM(CASE WHEN is_placed = TRUE THEN 1 ELSE 0 END) as placed_students
       FROM student_profiles
       WHERE ? IS NULL OR institution_id = ?`,
      [institutionId, institutionId]
    );

    // Active industry connections
    const [partners] = await pool.query(
      `SELECT COUNT(*) as active_partners FROM institution_industry_connections
       WHERE status = 'ACTIVE' AND (? IS NULL OR institution_id = ?)`,
      [institutionId, institutionId]
    );

    // Department benchmark breakdown
    const [deptStats] = await pool.query(
      `SELECT 
        department as dept,
        COUNT(*) as student_count,
        ROUND(AVG(COALESCE(overall_skill_score, 0))) as avgScore,
        ROUND((SUM(CASE WHEN is_placed = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100) as placedPct
       FROM student_profiles
       WHERE ? IS NULL OR institution_id = ?
       GROUP BY department`,
      [institutionId, institutionId]
    );

    const total = stuStats[0].total_students || 0;
    const placed = stuStats[0].placed_students || 0;
    const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;

    const data = {
      totalStudents: total,
      assessedStudents: stuStats[0].assessed_students || 0,
      averageSkillScore: Math.round(stuStats[0].avg_skill_score || 0),
      placedStudents: placed,
      placementRate,
      activePartners: partners[0].active_partners || 0,
      departmentStats: deptStats
    };

    return sendSuccess(res, data, 'Institution analytics fetched successfully');
  } catch (error) {
    console.error('[Institution getAnalytics Error]', error);
    return sendError(res, 'Failed to fetch analytics: ' + error.message, 500);
  }
}

/**
 * Get student directory for institution
 */
async function getInstitutionStudents(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : null;

    const [rows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE ? IS NULL OR sp.institution_id = ?
       ORDER BY sp.overall_skill_score DESC`,
      [institutionId, institutionId]
    );

    return sendSuccess(res, rows, 'Institution student directory retrieved');
  } catch (error) {
    console.error('[Institution getStudents Error]', error);
    return sendError(res, 'Failed to fetch student directory', 500);
  }
}

/**
 * Get academician directory for institution
 */
async function getInstitutionAcademicians(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : null;

    const [rows] = await pool.query(
      `SELECT ap.*, u.name, u.email, u.phone
       FROM academician_profiles ap
       JOIN users u ON ap.user_id = u.id
       WHERE ? IS NULL OR ap.institution_id = ?`,
      [institutionId, institutionId]
    );

    return sendSuccess(res, rows, 'Institution faculty directory retrieved');
  } catch (error) {
    console.error('[Institution getAcademicians Error]', error);
    return sendError(res, 'Failed to fetch academician directory', 500);
  }
}

/**
 * Get active industry partners / MoUs
 */
async function getInstitutionPartners(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : null;

    const [rows] = await pool.query(
      `SELECT conn.*, ip.company_name, ip.website, ip.city, ip.industry_domain
       FROM institution_industry_connections conn
       JOIN industry_profiles ip ON conn.industry_id = ip.id
       WHERE ? IS NULL OR conn.institution_id = ?`,
      [institutionId, institutionId]
    );

    return sendSuccess(res, rows, 'Institution industry partners retrieved');
  } catch (error) {
    console.error('[Institution getPartners Error]', error);
    return sendError(res, 'Failed to fetch industry partners', 500);
  }
}

module.exports = {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getInstitutionAcademicians,
  getInstitutionPartners
};

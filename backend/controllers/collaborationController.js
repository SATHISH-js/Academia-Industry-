const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function listCollaborations(req, res) {
  try {
    const [mentorships] = await pool.query(
      `SELECT m.*, ip.company_name, 'MENTORSHIP' as item_type
       FROM mentorships m
       JOIN industry_profiles ip ON m.industry_id = ip.id`
    );

    const [workshops] = await pool.query(
      `SELECT w.*, ip.company_name, 'WORKSHOP' as item_type
       FROM workshops w
       JOIN industry_profiles ip ON w.industry_id = ip.id`
    );

    const [challenges] = await pool.query(
      `SELECT ic.*, ip.company_name, 'INNOVATION_CHALLENGE' as item_type
       FROM innovation_challenges ic
       JOIN industry_profiles ip ON ic.industry_id = ip.id`
    );

    const [research] = await pool.query(
      `SELECT rp.*, ip.company_name, 'RESEARCH_PROJECT' as item_type
       FROM research_projects rp
       JOIN industry_profiles ip ON rp.industry_id = ip.id`
    );

    return sendSuccess(res, {
      mentorships,
      workshops,
      challenges,
      research
    }, 'Industry collaboration initiatives retrieved');
  } catch (error) {
    console.error('[Collaboration listCollaborations Error]', error);
    return sendError(res, 'Failed to fetch collaborations', 500);
  }
}

async function createMentorship(req, res) {
  const userId = req.user.id;
  const { title, mentor_name, mentor_designation, description, domain, duration, max_participants } = req.body;

  try {
    const [ind] = await pool.query('SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industryId = ind[0].id;

    const [result] = await pool.query(
      `INSERT INTO mentorships (industry_id, title, mentor_name, mentor_designation, description, domain, duration, max_participants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [industryId, title, mentor_name, mentor_designation || 'Principal Engineer', description, domain || 'Software', duration || '3 Months', max_participants || 10]
    );

    return sendSuccess(res, { id: result.insertId }, 'Mentorship program created', 201);
  } catch (error) {
    console.error('[Collaboration createMentorship Error]', error);
    return sendError(res, 'Failed to create mentorship', 500);
  }
}

async function createWorkshop(req, res) {
  const userId = req.user.id;
  const { title, speaker_name, description, workshop_date, duration_hours, mode, max_attendees } = req.body;

  try {
    const [ind] = await pool.query('SELECT id FROM industry_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (ind.length === 0) return sendError(res, 'Industry profile not found', 404);
    const industryId = ind[0].id;

    const [result] = await pool.query(
      `INSERT INTO workshops (industry_id, title, speaker_name, description, workshop_date, duration_hours, mode, max_attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [industryId, title, speaker_name, description, workshop_date || new Date(), duration_hours || 3, mode || 'VIRTUAL', max_attendees || 100]
    );

    return sendSuccess(res, { id: result.insertId }, 'Workshop announced successfully', 201);
  } catch (error) {
    console.error('[Collaboration createWorkshop Error]', error);
    return sendError(res, 'Failed to create workshop', 500);
  }
}

module.exports = {
  listCollaborations,
  createMentorship,
  createWorkshop
};

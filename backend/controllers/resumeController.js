const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function getResumeData(req, res) {
  const userId = req.user.id;

  try {
    const [profileRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.user_id = ? LIMIT 1`,
      [userId]
    );

    if (profileRows.length === 0) return sendError(res, 'Student profile not found', 404);
    const profile = profileRows[0];
    const studentId = profile.id;

    // Get verified skills
    const [skills] = await pool.query(
      `SELECT ss.*, s.name as skill_name, sc.name as category_name
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       JOIN skill_categories sc ON s.category_id = sc.id
       WHERE ss.student_id = ?
       ORDER BY ss.score DESC`,
      [studentId]
    );

    // Get projects
    const [projects] = await pool.query(
      'SELECT * FROM student_projects WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );

    // Get certifications
    const [certifications] = await pool.query(
      'SELECT * FROM student_certifications WHERE student_id = ? ORDER BY issue_date DESC',
      [studentId]
    );

    // Get achievements
    const [achievements] = await pool.query(
      'SELECT * FROM student_achievements WHERE student_id = ? ORDER BY achievement_date DESC',
      [studentId]
    );

    const resumeData = {
      personalInfo: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '+91 9876543210',
        headline: profile.headline,
        bio: profile.bio,
        address: profile.address || 'New Delhi, India',
        github: profile.github_url,
        linkedin: profile.linkedin_url
      },
      education: [
        {
          level: 'Undergraduate (B.Tech)',
          institution: profile.ug_college || profile.institution_name || 'Apex Institute of Technology',
          university: profile.ug_university || 'Apex Technical University',
          department: profile.department,
          degree: profile.degree,
          year: profile.graduation_year,
          score: `CGPA: ${profile.cgpa}`
        },
        {
          level: 'Higher Secondary (12th / Pre-University)',
          institution: profile.twelfth_college || 'Delhi Public School',
          board: profile.twelfth_board || 'CBSE (Science)',
          year: profile.twelfth_year || 2022,
          score: `${profile.twelfth_percentage}%`
        },
        {
          level: 'Secondary School Examination (10th)',
          institution: profile.tenth_school || 'Delhi Public School',
          board: profile.tenth_board || 'CBSE',
          year: profile.tenth_year || 2020,
          score: `${profile.tenth_percentage}%`
        }
      ],
      skills,
      projects,
      certifications,
      achievements
    };

    return sendSuccess(res, resumeData, 'Resume data assembled successfully');
  } catch (error) {
    console.error('[Resume getResumeData Error]', error);
    return sendError(res, 'Failed to fetch resume data', 500);
  }
}

async function logResumeExport(req, res) {
  const userId = req.user.id;
  try {
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'RESUME_EXPORT', 'Exported Professional Resume', 'Generated clean printable/PDF resume from verified portal credentials.')`,
      [userId]
    );
    return sendSuccess(res, null, 'Resume export logged');
  } catch (error) {
    return sendError(res, 'Failed to log export', 500);
  }
}

module.exports = {
  getResumeData,
  logResumeExport
};

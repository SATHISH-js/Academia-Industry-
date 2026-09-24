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
      name,
      avatar_url,
      headline,
      bio,
      department,
      degree,
      enrollment_number,
      graduation_year,
      cgpa,
      institution_id,
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
      city,
      state,
      pincode,
      current_semester,
      section,
      register_number,
      current_year,
      active_backlogs,
      attendance_percentage,
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
        institution_id = COALESCE(?, institution_id),
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
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        current_semester = COALESCE(?, current_semester),
        section = COALESCE(?, section),
        register_number = COALESCE(?, register_number),
        current_year = COALESCE(?, current_year),
        active_backlogs = COALESCE(?, active_backlogs),
        attendance_percentage = COALESCE(?, attendance_percentage),
        profile_completed_pct = 95
       WHERE user_id = ?`,
      [
        headline, bio, department, degree, enrollment_number, graduation_year, cgpa, institution_id || null,
        github_url, linkedin_url, tenth_board, tenth_school, tenth_year, tenth_percentage,
        twelfth_board, twelfth_college, twelfth_year, twelfth_percentage,
        ug_university, ug_college, address, city, state, pincode, current_semester, section, register_number,
        current_year, active_backlogs, attendance_percentage, userId
      ]
    );

    if (name || phone || avatar_url !== undefined) {
      await pool.query(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
        [name || null, phone || null, avatar_url !== undefined ? avatar_url : null, userId]
      );
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

/**
 * Get student certifications (with category filtering and statistics)
 */
async function getStudentCertifications(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const { category, search } = req.query;

    let query = 'SELECT * FROM student_certifications WHERE student_id = ?';
    const params = [studentId];

    if (category && category.toUpperCase() !== 'ALL') {
      query += ' AND category = ?';
      params.push(category.toUpperCase());
    }

    if (search && search.trim()) {
      query += ' AND (name LIKE ? OR issuing_organization LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY COALESCE(issue_date, created_at) DESC';

    const [rows] = await pool.query(query, params);

    // Compute stats
    const [allStudentCerts] = await pool.query(
      'SELECT category, achievement_type FROM student_certifications WHERE student_id = ?',
      [studentId]
    );

    const stats = {
      total: allStudentCerts.length,
      pptCount: allStudentCerts.filter(c => c.category === 'PPT').length,
      hackathonCount: allStudentCerts.filter(c => c.category === 'HACKATHON').length,
      competitionCount: allStudentCerts.filter(c => c.category === 'COMPETITION').length,
      workshopCount: allStudentCerts.filter(c => c.category === 'WORKSHOP').length,
      sportsCulturalCount: allStudentCerts.filter(c => c.category === 'SPORTS_CULTURAL').length,
      technicalCount: allStudentCerts.filter(c => c.category === 'TECHNICAL').length,
      winnerCount: allStudentCerts.filter(c => ['WINNER', 'FIRST_PLACE', 'RUNNER_UP', 'THIRD_PLACE'].includes(c.achievement_type)).length
    };

    return sendSuccess(res, { certifications: rows, stats }, 'Certifications retrieved successfully');
  } catch (error) {
    console.error('[Student getCertifications Error]', error);
    return sendError(res, 'Failed to fetch student certifications', 500);
  }
}

/**
 * Add a certification or extra-curricular achievement
 */
async function addStudentCertification(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const {
      name,
      issuing_organization,
      issue_date,
      credential_id,
      certificate_url,
      category = 'EXTRA_CURRICULAR',
      level = 'COLLEGE',
      achievement_type = 'PARTICIPATION',
      description = '',
      team_members = '',
      event_location = ''
    } = req.body;

    if (!name || !issuing_organization) {
      return sendError(res, 'Certificate/Event name and issuing organization are required', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO student_certifications 
       (student_id, name, issuing_organization, issue_date, credential_id, certificate_url, 
        category, level, achievement_type, description, team_members, event_location, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        studentId,
        name,
        issuing_organization,
        issue_date || null,
        credential_id || '',
        certificate_url || '',
        category,
        level,
        achievement_type,
        description,
        team_members,
        event_location
      ]
    );

    // Activity log
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'CERTIFICATE_ADDED', 'Added Certificate', ?)`,
      [userId, `Added ${category} certificate: ${name} from ${issuing_organization}`]
    );

    return sendSuccess(res, { id: result.insertId }, 'Certification added successfully', 201);
  } catch (error) {
    console.error('[Student addCertification Error]', error);
    return sendError(res, 'Failed to add certification: ' + error.message, 500);
  }
}

/**
 * Update an existing certification
 */
async function updateStudentCertification(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const certId = req.params.id;
    const {
      name,
      issuing_organization,
      issue_date,
      credential_id,
      certificate_url,
      category,
      level,
      achievement_type,
      description,
      team_members,
      event_location
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM student_certifications WHERE id = ? AND student_id = ? LIMIT 1',
      [certId, studentId]
    );
    if (existing.length === 0) {
      return sendError(res, 'Certification not found or unauthorized', 404);
    }

    await pool.query(
      `UPDATE student_certifications SET
        name = COALESCE(?, name),
        issuing_organization = COALESCE(?, issuing_organization),
        issue_date = COALESCE(?, issue_date),
        credential_id = COALESCE(?, credential_id),
        certificate_url = COALESCE(?, certificate_url),
        category = COALESCE(?, category),
        level = COALESCE(?, level),
        achievement_type = COALESCE(?, achievement_type),
        description = COALESCE(?, description),
        team_members = COALESCE(?, team_members),
        event_location = COALESCE(?, event_location)
       WHERE id = ? AND student_id = ?`,
      [
        name,
        issuing_organization,
        issue_date,
        credential_id,
        certificate_url,
        category,
        level,
        achievement_type,
        description,
        team_members,
        event_location,
        certId,
        studentId
      ]
    );

    return sendSuccess(res, { id: certId }, 'Certification updated successfully');
  } catch (error) {
    console.error('[Student updateCertification Error]', error);
    return sendError(res, 'Failed to update certification: ' + error.message, 500);
  }
}

/**
 * Delete a certification
 */
async function deleteStudentCertification(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const certId = req.params.id;
    const [result] = await pool.query(
      'DELETE FROM student_certifications WHERE id = ? AND student_id = ?',
      [certId, studentId]
    );

    if (result.affectedRows === 0) {
      return sendError(res, 'Certification not found or unauthorized', 404);
    }

    return sendSuccess(res, null, 'Certification deleted successfully');
  } catch (error) {
    console.error('[Student deleteCertification Error]', error);
    return sendError(res, 'Failed to delete certification: ' + error.message, 500);
  }
}

/**
 * Get messages between student and industry recruiters
 */
async function getStudentOutreachMessages(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stu[0].id;

    const [rows] = await pool.query(
      `SELECT ism.*, 
              CASE WHEN ism.sender_role = 'STUDENT' THEN 'SENT' ELSE 'RECEIVED' END AS direction,
              ip.company_name, ip.website AS company_website, ip.city AS company_city,
              u.name AS recruiter_name, u.email AS recruiter_email,
              CASE
                WHEN ism.opportunity_type = 'INTERNSHIP' THEN (SELECT title FROM internships WHERE id = ism.opportunity_id)
                WHEN ism.opportunity_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = ism.opportunity_id)
                ELSE 'General Inquiry'
              END AS opportunity_title
       FROM industry_student_messages ism
       JOIN industry_profiles ip ON ism.industry_id = ip.id
       JOIN users u ON ip.user_id = u.id
       WHERE ism.student_id = ?
       ORDER BY ism.created_at DESC`,
      [studentId]
    );

    return sendSuccess(res, rows, 'Student messages retrieved successfully');
  } catch (error) {
    console.error('[Student getStudentOutreachMessages Error]', error);
    return sendError(res, 'Failed to fetch messages: ' + error.message, 500);
  }
}

/**
 * Student replies to an industry outreach message
 */
async function replyToIndustryMessage(req, res) {
  try {
    const userId = req.user.id;
    const [stu] = await pool.query('SELECT id, user_id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stu.length === 0) return sendError(res, 'Student profile not found', 404);
    const student = stu[0];

    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Message cannot be empty', 400);
    }

    const [origRows] = await pool.query('SELECT * FROM industry_student_messages WHERE id = ? AND student_id = ? LIMIT 1', [id, student.id]);
    if (origRows.length === 0) return sendError(res, 'Original message not found', 404);
    const orig = origRows[0];

    const replySubject = orig.subject.startsWith('Re:') ? orig.subject : `Re: ${orig.subject}`;

    const [result] = await pool.query(
      `INSERT INTO industry_student_messages
       (industry_id, student_id, opportunity_type, opportunity_id, subject, message, message_type, status, sender_role, reply_to_id)
       VALUES (?, ?, ?, ?, ?, ?, 'REPLY', 'RECEIVED', 'STUDENT', ?)`,
      [
        orig.industry_id,
        student.id,
        orig.opportunity_type,
        orig.opportunity_id,
        replySubject,
        message.trim(),
        id
      ]
    );

    // Get industry user_id for notification
    const [ind] = await pool.query('SELECT user_id, company_name FROM industry_profiles WHERE id = ?', [orig.industry_id]);
    const [u] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    const studentName = u.length > 0 ? u[0].name : 'Candidate';

    if (ind.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'APPLICATION', '/industry/outreach')`,
        [
          ind[0].user_id,
          `Reply from Candidate ${studentName}: ${replySubject}`,
          message.length > 250 ? message.substring(0, 247) + '...' : message
        ]
      );
    }

    return sendSuccess(res, { message_id: result.insertId }, 'Reply sent to recruiter successfully', 201);
  } catch (error) {
    console.error('[Student replyToIndustryMessage Error]', error);
    return sendError(res, 'Failed to send reply: ' + error.message, 500);
  }
}

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  getStudentSkillGaps,
  getDashboardSummary,
  getStudentCertifications,
  addStudentCertification,
  updateStudentCertification,
  deleteStudentCertification,
  getStudentOutreachMessages,
  replyToIndustryMessage
};

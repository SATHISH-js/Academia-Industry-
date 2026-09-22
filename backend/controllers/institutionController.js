const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get institution comprehensive analytics
 */
async function getInstitutionAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id, institution_name, city, state FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    // Total & assessed students strictly for this institution
    const [stuStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN overall_skill_score > 0 THEN 1 ELSE 0 END) as assessed_students,
        AVG(CASE WHEN overall_skill_score > 0 THEN overall_skill_score ELSE NULL END) as avg_skill_score,
        SUM(CASE WHEN is_placed = TRUE THEN 1 ELSE 0 END) as placed_students
       FROM student_profiles
       WHERE (? IS NULL OR institution_id = ?)`,
      [institutionId, institutionId]
    );

    // Active industry connections / MoUs
    const [partners] = await pool.query(
      `SELECT COUNT(*) as active_partners FROM institution_industry_connections
       WHERE status = 'ACTIVE' AND (? IS NULL OR institution_id = ?)`,
      [institutionId, institutionId]
    );

    // Total faculty academicians
    const [acadStats] = await pool.query(
      `SELECT COUNT(*) as total_faculty FROM academician_profiles
       WHERE ? IS NULL OR institution_id = ?`,
      [institutionId, institutionId]
    );

    // Faculty department breakdown
    const [facultyDeptStats] = await pool.query(
      `SELECT department, COUNT(*) as faculty_count
       FROM academician_profiles
       WHERE ? IS NULL OR institution_id = ?
       GROUP BY department`,
      [institutionId, institutionId]
    );

    // Department benchmark breakdown for students
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

    // Count recent regular activities
    const [recentAct] = await pool.query(
      `SELECT COUNT(*) as activity_count
       FROM user_activity_logs ual
       JOIN student_profiles sp ON ual.user_id = sp.user_id
       WHERE ? IS NULL OR sp.institution_id = ?`,
      [institutionId, institutionId]
    );

    const total = stuStats[0].total_students || 0;
    const placed = stuStats[0].placed_students || 0;
    const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;

    const data = {
      institutionId,
      institutionName: inst[0]?.institution_name || 'Academic Institution',
      city: inst[0]?.city || '',
      state: inst[0]?.state || '',
      totalStudents: total,
      assessedStudents: stuStats[0].assessed_students || 0,
      averageSkillScore: Math.round(stuStats[0].avg_skill_score || 0),
      placedStudents: placed,
      placementRate,
      activePartners: partners[0].active_partners || 0,
      totalFaculty: acadStats[0].total_faculty || 0,
      facultyDepartmentStats: facultyDeptStats,
      departmentStats: deptStats,
      totalActivities: recentAct[0]?.activity_count || 0
    };

    return sendSuccess(res, data, 'Institution analytics fetched successfully');
  } catch (error) {
    console.error('[Institution getAnalytics Error]', error);
    return sendError(res, 'Failed to fetch analytics: ' + error.message, 500);
  }
}

/**
 * Get student directory for institution with filters
 */
async function getInstitutionStudents(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { department, graduation_year, min_cgpa, search, register_number } = req.query;

    let query = `
      SELECT sp.*, u.name, u.email, u.phone, ip.institution_name
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
      WHERE (? IS NULL OR sp.institution_id = ?)
    `;
    const params = [institutionId, institutionId];

    if (register_number) {
      query += ` AND sp.enrollment_number LIKE ?`;
      params.push(`%${register_number.trim()}%`);
    }

    if (department) {
      query += ` AND sp.department LIKE ?`;
      params.push(`%${department.trim()}%`);
    }

    if (graduation_year) {
      query += ` AND sp.graduation_year = ?`;
      params.push(parseInt(graduation_year, 10));
    }

    if (min_cgpa) {
      query += ` AND sp.cgpa >= ?`;
      params.push(parseFloat(min_cgpa));
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR sp.enrollment_number LIKE ? OR sp.headline LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY sp.overall_skill_score DESC`;

    const [rows] = await pool.query(query, params);

    // Enrich with verified skills
    for (const stu of rows) {
      const [skills] = await pool.query(
        `SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name
         FROM student_skills ss
         JOIN skills s ON ss.skill_id = s.id
         WHERE ss.student_id = ?`,
        [stu.id]
      );
      stu.verifiedSkills = skills;
    }

    return sendSuccess(res, rows, 'Institution student directory retrieved');
  } catch (error) {
    console.error('[Institution getStudents Error]', error);
    return sendError(res, 'Failed to fetch student directory: ' + error.message, 500);
  }
}

/**
 * Get specific student's in-app activity timeline for institution monitoring
 */
async function getStudentActivityHistory(req, res) {
  try {
    const userId = req.user.id;
    const studentId = req.params.studentId;

    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    // Check student profile and affiliation
    const [stuRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.id = ? AND (? IS NULL OR sp.institution_id = ?) LIMIT 1`,
      [studentId, institutionId, institutionId]
    );

    if (stuRows.length === 0) {
      return sendError(res, 'Student not found or not affiliated with your institution', 404);
    }
    const student = stuRows[0];

    // Fetch verified skills
    const [skills] = await pool.query(
      `SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?`,
      [student.id]
    );

    // Fetch in-app activity logs
    const [activities] = await pool.query(
      `SELECT * FROM user_activity_logs
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [student.user_id]
    );

    // Fetch mock interviews
    const [mockInterviews] = await pool.query(
      `SELECT * FROM mock_interviews
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [student.id]
    );

    // Fetch applications
    const [applications] = await pool.query(
      `SELECT a.*, 
        CASE 
          WHEN a.opportunity_type = 'INTERNSHIP' THEN (SELECT title FROM internships WHERE id = a.opportunity_id)
          WHEN a.opportunity_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = a.opportunity_id)
          ELSE 'Opportunity'
        END AS opportunity_title
       FROM applications a
       WHERE a.applicant_id = ?
       ORDER BY a.created_at DESC`,
      [student.user_id]
    );

    return sendSuccess(res, {
      student,
      verifiedSkills: skills,
      activities,
      mockInterviews,
      applications
    }, 'Student monitoring details retrieved successfully');
  } catch (error) {
    console.error('[Institution getStudentActivityHistory Error]', error);
    return sendError(res, 'Failed to fetch student activity timeline: ' + error.message, 500);
  }
}

/**
 * Get academician directory for institution
 */
async function getInstitutionAcademicians(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { department, search, employee_id } = req.query;

    let query = `
      SELECT ap.*, u.name, u.email, u.phone
      FROM academician_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE (? IS NULL OR ap.institution_id = ?)
    `;
    const params = [institutionId, institutionId];

    if (employee_id) {
      query += ` AND ap.employee_id LIKE ?`;
      params.push(`%${employee_id.trim()}%`);
    }

    if (department) {
      query += ` AND ap.department LIKE ?`;
      params.push(`%${department.trim()}%`);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR ap.employee_id LIKE ? OR ap.specialization LIKE ? OR ap.designation LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    query += ` ORDER BY ap.experience_years DESC`;

    const [rows] = await pool.query(query, params);

    return sendSuccess(res, {
      totalAcademicians: rows.length,
      academicians: rows
    }, 'Institution faculty directory retrieved');
  } catch (error) {
    console.error('[Institution getAcademicians Error]', error);
    return sendError(res, 'Failed to fetch academician directory: ' + error.message, 500);
  }
}

/**
 * Get active industry partners & MoUs
 */
async function getInstitutionPartners(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const [rows] = await pool.query(
      `SELECT conn.*, ip.company_name, ip.website, ip.city, ip.industry_domain, ip.description as company_description
       FROM institution_industry_connections conn
       JOIN industry_profiles ip ON conn.industry_id = ip.id
       WHERE ? IS NULL OR conn.institution_id = ?
       ORDER BY conn.created_at DESC`,
      [institutionId, institutionId]
    );

    // Also fetch all available industry companies for MoU proposals
    const [allCompanies] = await pool.query(
      `SELECT id, company_name, industry_domain, city, website
       FROM industry_profiles
       ORDER BY company_name ASC`
    );

    return sendSuccess(res, {
      connections: rows,
      availableCompanies: allCompanies
    }, 'Institution industry partners and MoUs retrieved');
  } catch (error) {
    console.error('[Institution getPartners Error]', error);
    return sendError(res, 'Failed to fetch industry partners: ' + error.message, 500);
  }
}

/**
 * Propose a new MoU or collaboration agreement to an industry company
 */
async function proposeMou(req, res) {
  try {
    const userId = req.user.id;
    const { industry_id, partnership_type, valid_until, notes, proposal_note } = req.body;

    if (!industry_id || !partnership_type) {
      return sendError(res, 'Industry partner ID and partnership type are required', 400);
    }

    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (inst.length === 0) return sendError(res, 'Institution profile not found', 404);
    const institution = inst[0];

    // Check if an entry already exists
    const [existing] = await pool.query(
      `SELECT id FROM institution_industry_connections WHERE institution_id = ? AND industry_id = ? LIMIT 1`,
      [institution.id, industry_id]
    );

    let connectionId;
    if (existing.length > 0) {
      await pool.query(
        `UPDATE institution_industry_connections
         SET partnership_type = ?, valid_until = ?, notes = ?, proposal_note = ?, status = 'PENDING', initiator = 'INSTITUTION'
         WHERE id = ?`,
        [partnership_type, valid_until || null, notes || null, proposal_note || null, existing[0].id]
      );
      connectionId = existing[0].id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO institution_industry_connections
         (institution_id, industry_id, partnership_type, valid_until, notes, proposal_note, status, initiator)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'INSTITUTION')`,
        [institution.id, industry_id, partnership_type, valid_until || null, notes || null, proposal_note || null]
      );
      connectionId = result.insertId;
    }

    // Notify the industry company user
    const [indUsers] = await pool.query(
      `SELECT user_id, company_name FROM industry_profiles WHERE id = ? LIMIT 1`,
      [industry_id]
    );
    if (indUsers.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'INFO', '/industry/collaborations')`,
        [
          indUsers[0].user_id,
          `MoU Partnership Proposal from ${institution.institution_name}`,
          `${institution.institution_name} has proposed a new ${partnership_type.replace('_', ' ')} agreement.`
        ]
      );
    }

    return sendSuccess(res, { connectionId }, 'MoU collaboration agreement proposed successfully', 201);
  } catch (error) {
    console.error('[Institution proposeMou Error]', error);
    return sendError(res, 'Failed to propose MoU: ' + error.message, 500);
  }
}

/**
 * Search industry collaborations (innovation challenges, research grants, guest lectures, workshops)
 */
async function searchIndustryCollaborations(req, res) {
  try {
    const { keyword, domain, type } = req.query;

    const results = [];

    // 1. Innovation Challenges
    if (!type || type === 'ALL' || type === 'INNOVATION') {
      let q = `
        SELECT ic.id, 'INNOVATION_CHALLENGE' as category, ic.title, ic.problem_statement as description,
               ic.rewards, ic.deadline, ic.status, ip.company_name, ip.website as company_website, ip.city, ip.id as industry_id, ip.industry_domain
        FROM innovation_challenges ic
        JOIN industry_profiles ip ON ic.industry_id = ip.id
        WHERE ic.status = 'OPEN'
      `;
      const p = [];
      if (keyword) {
        q += ` AND (ic.title LIKE ? OR ic.problem_statement LIKE ? OR ip.company_name LIKE ?)`;
        const kw = `%${keyword}%`;
        p.push(kw, kw, kw);
      }
      const [challenges] = await pool.query(q, p);
      results.push(...challenges);
    }

    // 2. Sponsored Research Projects
    if (!type || type === 'ALL' || type === 'RESEARCH') {
      let q = `
        SELECT rp.id, 'RESEARCH_PROJECT' as category, rp.title, rp.description,
               rp.grant_amount as rewards, rp.deadline, rp.status, ip.company_name, ip.website as company_website, ip.city, ip.id as industry_id, ip.industry_domain
        FROM research_projects rp
        JOIN industry_profiles ip ON rp.industry_id = ip.id
        WHERE rp.status = 'PROPOSED' OR rp.status = 'ACTIVE'
      `;
      const p = [];
      if (keyword) {
        q += ` AND (rp.title LIKE ? OR rp.domain LIKE ? OR ip.company_name LIKE ?)`;
        const kw = `%${keyword}%`;
        p.push(kw, kw, kw);
      }
      const [research] = await pool.query(q, p);
      results.push(...research);
    }

    // 3. Technical Workshops & Guest Lectures
    if (!type || type === 'ALL' || type === 'WORKSHOP') {
      let q = `
        SELECT ws.id, 'WORKSHOP' as category, ws.title, ws.description,
               CONCAT(ws.duration_hours, ' Hours Workshop') as rewards, ws.workshop_date as deadline, ws.status,
               ip.company_name, ip.website as company_website, ip.city, ip.id as industry_id, ip.industry_domain
        FROM workshops ws
        JOIN industry_profiles ip ON ws.industry_id = ip.id
        WHERE ws.status = 'UPCOMING'
      `;
      const p = [];
      if (keyword) {
        q += ` AND (ws.title LIKE ? OR ip.company_name LIKE ?)`;
        const kw = `%${keyword}%`;
        p.push(kw, kw);
      }
      const [workshops] = await pool.query(q, p);
      results.push(...workshops);
    }

    return sendSuccess(res, {
      totalFound: results.length,
      collaborations: results
    }, 'Industry collaboration opportunities retrieved successfully');
  } catch (error) {
    console.error('[Institution searchIndustryCollaborations Error]', error);
    return sendError(res, 'Failed to search collaborations: ' + error.message, 500);
  }
}

/**
 * Public endpoint to list institutions for dropdowns in student registration / profile
 */
async function getPublicInstitutions(req, res) {
  try {
    const [institutions] = await pool.query(
      `SELECT id, institution_name, institution_type, city, state
       FROM institution_profiles
       ORDER BY institution_name ASC`
    );
    return sendSuccess(res, institutions, 'Public institutions list retrieved');
  } catch (error) {
    console.error('[Institution getPublicInstitutions Error]', error);
    return sendError(res, 'Failed to fetch public institutions: ' + error.message, 500);
  }
}

/**
 * Access a student directly by register / enrollment number
 */
async function getStudentByRegisterNumber(req, res) {
  try {
    const userId = req.user.id;
    const { regNumber } = req.params;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const [rows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.institution_id = ? AND (sp.enrollment_number = ? OR sp.enrollment_number LIKE ?) LIMIT 1`,
      [institutionId, regNumber.trim(), `%${regNumber.trim()}%`]
    );

    if (rows.length === 0) {
      return sendError(res, `Student with Register Number "${regNumber}" not found in your institution.`, 404);
    }

    const student = rows[0];
    const [skills] = await pool.query(
      `SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?`,
      [student.id]
    );
    student.verifiedSkills = skills;

    return sendSuccess(res, student, 'Student retrieved by register number');
  } catch (error) {
    console.error('[Institution getStudentByRegisterNumber Error]', error);
    return sendError(res, 'Failed to fetch student by register number: ' + error.message, 500);
  }
}

/**
 * Get institutional regular activities and live student/faculty activity stream
 */
async function getInstitutionActivities(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;
    const { limit = 25, action_type } = req.query;

    let query = `
      SELECT ual.id, ual.action_type, ual.title, ual.description, ual.created_at,
             u.name as user_name, u.email as user_email, u.role as user_role,
             sp.enrollment_number as register_number, sp.department, sp.id as student_id
      FROM user_activity_logs ual
      JOIN users u ON ual.user_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.institution_id = ?
    `;
    const params = [institutionId];

    if (action_type && action_type !== 'ALL') {
      query += ` AND ual.action_type = ?`;
      params.push(action_type);
    }

    query += ` ORDER BY ual.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, rows, 'Institutional regular activities retrieved successfully');
  } catch (error) {
    console.error('[Institution getInstitutionActivities Error]', error);
    return sendError(res, 'Failed to fetch regular activities: ' + error.message, 500);
  }
}

/**
 * Contact a student directly with an in-app outreach message and notification
 */
async function contactStudent(req, res) {
  try {
    const userId = req.user.id;
    const { student_id, subject, message, contact_type = 'ACADEMIC_NOTICE' } = req.body;

    if (!student_id || !subject || !message) {
      return sendError(res, 'Student ID, subject, and message are required', 400);
    }

    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (inst.length === 0) return sendError(res, 'Institution profile not found', 404);
    const institution = inst[0];

    const [stuRows] = await pool.query(
      'SELECT sp.id, sp.user_id, sp.enrollment_number, u.name, u.email FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = ? AND sp.institution_id = ? LIMIT 1',
      [student_id, institution.id]
    );
    if (stuRows.length === 0) {
      return sendError(res, 'Student not found or not affiliated with your institution', 404);
    }
    const student = stuRows[0];

    const [result] = await pool.query(
      `INSERT INTO institution_outreach_messages 
       (institution_id, recipient_type, recipient_user_id, student_id, contact_type, subject, message, status)
       VALUES (?, 'STUDENT', ?, ?, ?, ?, ?, 'SENT')`,
      [institution.id, student.user_id, student.id, contact_type, subject, message]
    );

    // Trigger in-app notification to student
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/student/profile')`,
      [
        student.user_id,
        `Official Notice from ${institution.institution_name}: ${subject}`,
        message.length > 250 ? message.substring(0, 247) + '...' : message
      ]
    );

    // Log action in user_activity_logs
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'COMMUNICATION', ?, ?)`,
      [
        userId,
        `Contacted Student: ${student.name} (${student.enrollment_number || 'Enrolled'})`,
        `Dispatched ${contact_type} regarding "${subject}"`
      ]
    );

    return sendSuccess(res, { message_id: result.insertId }, `Message dispatched to student ${student.name} successfully`, 201);
  } catch (error) {
    console.error('[Institution contactStudent Error]', error);
    return sendError(res, 'Failed to dispatch message to student: ' + error.message, 500);
  }
}

/**
 * Contact an academician / faculty member directly
 */
async function contactAcademician(req, res) {
  try {
    const userId = req.user.id;
    const { academician_id, subject, message, contact_type = 'FACULTY_MEETING' } = req.body;

    if (!academician_id || !subject || !message) {
      return sendError(res, 'Academician ID, subject, and message are required', 400);
    }

    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (inst.length === 0) return sendError(res, 'Institution profile not found', 404);
    const institution = inst[0];

    const [acadRows] = await pool.query(
      'SELECT ap.id, ap.user_id, ap.employee_id, u.name, u.email FROM academician_profiles ap JOIN users u ON ap.user_id = u.id WHERE ap.id = ? AND ap.institution_id = ? LIMIT 1',
      [academician_id, institution.id]
    );
    if (acadRows.length === 0) {
      return sendError(res, 'Faculty member not found or not affiliated with your institution', 404);
    }
    const faculty = acadRows[0];

    const [result] = await pool.query(
      `INSERT INTO institution_outreach_messages 
       (institution_id, recipient_type, recipient_user_id, academician_id, contact_type, subject, message, status)
       VALUES (?, 'ACADEMICIAN', ?, ?, ?, ?, ?, 'SENT')`,
      [institution.id, faculty.user_id, faculty.id, contact_type, subject, message]
    );

    // Trigger notification to academician
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/academician/dashboard')`,
      [
        faculty.user_id,
        `Institutional Communication from ${institution.institution_name}: ${subject}`,
        message.length > 250 ? message.substring(0, 247) + '...' : message
      ]
    );

    // Log in activity logs
    await pool.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'COMMUNICATION', ?, ?)`,
      [
        userId,
        `Contacted Faculty: ${faculty.name} (${faculty.employee_id || 'Staff'})`,
        `Dispatched ${contact_type} regarding "${subject}"`
      ]
    );

    return sendSuccess(res, { message_id: result.insertId }, `Message dispatched to faculty member ${faculty.name} successfully`, 201);
  } catch (error) {
    console.error('[Institution contactAcademician Error]', error);
    return sendError(res, 'Failed to dispatch message to faculty: ' + error.message, 500);
  }
}

/**
 * Get all outreach messages sent by this institution
 */
async function getSentMessages(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const [rows] = await pool.query(
      `SELECT iom.*, u.name as recipient_name, u.email as recipient_email, u.role as recipient_role
       FROM institution_outreach_messages iom
       JOIN users u ON iom.recipient_user_id = u.id
       WHERE iom.institution_id = ?
       ORDER BY iom.created_at DESC`,
      [institutionId]
    );

    return sendSuccess(res, rows, 'Sent messages retrieved successfully');
  } catch (error) {
    console.error('[Institution getSentMessages Error]', error);
    return sendError(res, 'Failed to fetch sent messages: ' + error.message, 500);
  }
}

/**
 * Add / affiliate an academician by their register / employee number
 */
async function addInstitutionAcademician(req, res) {
  const bcrypt = require('bcryptjs');
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const [inst] = await connection.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (inst.length === 0) {
      connection.release();
      return sendError(res, 'Institution profile not found', 404);
    }
    const institution = inst[0];

    const {
      employee_id,
      name,
      email,
      department,
      designation = 'Assistant Professor',
      qualification = 'Ph.D / M.Tech',
      experience_years = 5,
      specialization = 'Computer Science & Engineering'
    } = req.body;

    if (!employee_id || !name || !email || !department) {
      connection.release();
      return sendError(res, 'Faculty Register/Employee Number, Name, Email, and Department are required', 400);
    }

    await connection.beginTransaction();

    // Check if user with this email exists
    const [existingUsers] = await connection.query('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);

    let targetUserId;
    if (existingUsers.length > 0) {
      targetUserId = existingUsers[0].id;
      // Check if profile exists
      const [existingProf] = await connection.query('SELECT id FROM academician_profiles WHERE user_id = ? LIMIT 1', [targetUserId]);
      if (existingProf.length > 0) {
        await connection.query(
          `UPDATE academician_profiles SET
            institution_id = ?,
            employee_id = ?,
            department = ?,
            designation = ?,
            qualification = COALESCE(?, qualification),
            experience_years = COALESCE(?, experience_years),
            specialization = COALESCE(?, specialization)
           WHERE id = ?`,
          [institution.id, employee_id.trim(), department.trim(), designation, qualification, experience_years, specialization, existingProf[0].id]
        );
      } else {
        await connection.query(
          `INSERT INTO academician_profiles (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [targetUserId, institution.id, employee_id.trim(), department.trim(), designation, qualification, experience_years, specialization]
        );
      }
    } else {
      // Create user account with default hashed password
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('Faculty@2026', salt);

      const [newUserRes] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "ACADEMICIAN")',
        [name.trim(), email.trim(), defaultHash]
      );
      targetUserId = newUserRes.insertId;

      await connection.query(
        `INSERT INTO academician_profiles (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [targetUserId, institution.id, employee_id.trim(), department.trim(), designation, qualification, experience_years, specialization]
      );
    }

    await connection.commit();

    // Notify the user
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/academician/dashboard')`,
      [
        targetUserId,
        `Affiliated with ${institution.institution_name}`,
        `You have been registered as ${designation} in ${department} under Faculty Reg No: ${employee_id}.`
      ]
    );

    return sendSuccess(res, { employee_id, name, email, department, designation }, 'Academician successfully added and linked to institution', 201);
  } catch (error) {
    await connection.rollback();
    console.error('[Institution addAcademician Error]', error);
    return sendError(res, 'Failed to add academician: ' + error.message, 500);
  } finally {
    connection.release();
  }
}

module.exports = {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getStudentByRegisterNumber,
  getStudentActivityHistory,
  getInstitutionActivities,
  getInstitutionAcademicians,
  addInstitutionAcademician,
  contactStudent,
  contactAcademician,
  getSentMessages,
  getInstitutionPartners,
  proposeMou,
  searchIndustryCollaborations,
  getPublicInstitutions
};

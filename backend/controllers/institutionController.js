const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get institution comprehensive analytics
 */
async function getInstitutionAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

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
      institutionName: inst[0]?.institution_name || 'Academic Institution',
      totalStudents: total,
      assessedStudents: stuStats[0].assessed_students || 0,
      averageSkillScore: Math.round(stuStats[0].avg_skill_score || 0),
      placedStudents: placed,
      placementRate,
      activePartners: partners[0].active_partners || 0,
      totalFaculty: acadStats[0].total_faculty || 0,
      departmentStats: deptStats
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
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { department, graduation_year, min_cgpa, search } = req.query;

    let query = `
      SELECT sp.*, u.name, u.email, u.phone
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE (? IS NULL OR sp.institution_id = ?)
    `;
    const params = [institutionId, institutionId];

    if (department) {
      query += ` AND sp.department LIKE ?`;
      params.push(`%${department}%`);
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
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR sp.headline LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
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

    const { department, search } = req.query;

    let query = `
      SELECT ap.*, u.name, u.email, u.phone
      FROM academician_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE (? IS NULL OR ap.institution_id = ?)
    `;
    const params = [institutionId, institutionId];

    if (department) {
      query += ` AND ap.department LIKE ?`;
      params.push(`%${department}%`);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR ap.research_areas LIKE ? OR ap.designation LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
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
    const { region, search } = req.query;
    let sql = `SELECT id, institution_name, institution_type, city, state FROM institution_profiles WHERE 1=1`;
    const params = [];

    if (region && region !== 'ALL' && region !== 'All Regions') {
      sql += ` AND state = ?`;
      params.push(region);
    }

    if (search && search.trim()) {
      sql += ` AND (institution_name LIKE ? OR city LIKE ? OR state LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY institution_name ASC`;

    const [institutions] = await pool.query(sql, params);
    return sendSuccess(res, institutions, 'Public institutions list retrieved');
  } catch (error) {
    console.error('[Institution getPublicInstitutions Error]', error);
    return sendError(res, 'Failed to fetch public institutions: ' + error.message, 500);
  }
}

/**
 * Create a new Student account under this institution
 * The student is immediately given login credentials
 */
async function createInstitutionStudent(req, res) {
  const connection = await pool.getConnection();
  try {
    const institutionUserId = req.user.id;
    const [inst] = await connection.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [institutionUserId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const {
      name,
      email,
      password,
      department,
      degree = 'B.Tech',
      graduation_year = 2026,
      cgpa = 8.0,
      enrollment_number,
      phone,
      headline,
      bio
    } = req.body;

    if (!name || !email || !password || !department) {
      return sendError(res, 'Full name, email, password, and department are required.', 400);
    }

    await connection.beginTransaction();

    // Check duplicate email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in users table
    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, "STUDENT", ?)',
      [name, email, passwordHash, phone || null]
    );
    const newUserId = userRes.insertId;

    // Create student profile
    const studentHeadline = headline || `${department} Student`;
    const studentBio = bio || `Student enrolled at ${inst[0]?.institution_name || 'Academic Institution'}.`;

    const [stuRes] = await connection.query(
      `INSERT INTO student_profiles 
       (user_id, institution_id, enrollment_number, department, degree, graduation_year, cgpa, headline, bio, profile_completed_pct)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 65)`,
      [
        newUserId,
        institutionId,
        enrollment_number || `STU-${Date.now().toString().slice(-6)}`,
        department,
        degree,
        parseInt(graduation_year, 10),
        parseFloat(cgpa) || null,
        studentHeadline,
        studentBio
      ]
    );

    // Log activity
    await connection.query(
      `INSERT INTO user_activity_logs (user_id, action_type, title, description)
       VALUES (?, 'PROFILE_UPDATE', 'Account Onboarded by Institution', ?)`,
      [newUserId, `Enrolled into ${department} at ${inst[0]?.institution_name || 'Institution'}`]
    );

    await connection.commit();

    return sendSuccess(
      res,
      {
        userId: newUserId,
        studentId: stuRes.insertId,
        name,
        email,
        role: 'STUDENT',
        department,
        institutionName: inst[0]?.institution_name || 'Institution'
      },
      'Student account created successfully. The student can now log in at /login with their email and password.',
      201
    );
  } catch (error) {
    await connection.rollback();
    console.error('[Institution createStudent Error]', error);
    return sendError(res, 'Failed to create student account: ' + error.message, 500);
  } finally {
    connection.release();
  }
}

/**
 * Create a new Faculty / Academician account under this institution
 * The academician is immediately given login credentials
 */
async function createInstitutionAcademician(req, res) {
  const connection = await pool.getConnection();
  try {
    const institutionUserId = req.user.id;
    const [inst] = await connection.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [institutionUserId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const {
      name,
      email,
      password,
      department,
      designation = 'Assistant Professor',
      employee_id,
      experience_years = 5,
      specialization = 'Computer Science & Engineering',
      qualification = 'Ph.D / M.Tech',
      phone
    } = req.body;

    if (!name || !email || !password || !department) {
      return sendError(res, 'Full name, email, password, and department are required.', 400);
    }

    await connection.beginTransaction();

    // Check duplicate email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in users table
    const [userRes] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, "ACADEMICIAN", ?)',
      [name, email, passwordHash, phone || null]
    );
    const newUserId = userRes.insertId;

    // Create academician profile
    const [acadRes] = await connection.query(
      `INSERT INTO academician_profiles 
       (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUserId,
        institutionId,
        employee_id || `FAC-${Date.now().toString().slice(-5)}`,
        department,
        designation,
        qualification,
        parseInt(experience_years, 10) || 1,
        specialization
      ]
    );

    await connection.commit();

    return sendSuccess(
      res,
      {
        userId: newUserId,
        academicianId: acadRes.insertId,
        name,
        email,
        role: 'ACADEMICIAN',
        department,
        designation,
        institutionName: inst[0]?.institution_name || 'Institution'
      },
      'Faculty member onboarded successfully. The academician can now log in at /login with their email and password.',
      201
    );
  } catch (error) {
    await connection.rollback();
    console.error('[Institution createAcademician Error]', error);
    return sendError(res, 'Failed to create faculty account: ' + error.message, 500);
  } finally {
    connection.release();
  }
}

/**
 * Get institution departments list (dynamic)
 */
async function getInstitutionDepartments(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const [rows] = await pool.query(
      `SELECT id, name, code, head_of_department, created_at
       FROM institution_departments
       WHERE institution_id = ?
       ORDER BY name ASC`,
      [institutionId]
    );

    return sendSuccess(res, rows, 'Institution departments retrieved');
  } catch (error) {
    console.error('[Institution getDepartments Error]', error);
    return sendError(res, 'Failed to fetch departments: ' + error.message, 500);
  }
}

/**
 * Create a new department for the institution
 */
async function createInstitutionDepartment(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { name, code, head_of_department } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Department name is required', 400);
    }

    const deptName = name.trim();
    const deptCode = code ? code.trim().toUpperCase() : deptName.split(' ').map(w => w[0]).join('').slice(0, 8).toUpperCase();

    // Check if duplicate
    const [existing] = await pool.query(
      'SELECT id FROM institution_departments WHERE institution_id = ? AND name = ? LIMIT 1',
      [institutionId, deptName]
    );
    if (existing.length > 0) {
      return sendError(res, 'A department with this name already exists in your institution.', 409);
    }

    const [result] = await pool.query(
      `INSERT INTO institution_departments (institution_id, name, code, head_of_department)
       VALUES (?, ?, ?, ?)`,
      [institutionId, deptName, deptCode, head_of_department ? head_of_department.trim() : null]
    );

    return sendSuccess(
      res,
      {
        id: result.insertId,
        institution_id: institutionId,
        name: deptName,
        code: deptCode,
        head_of_department: head_of_department || null
      },
      'Department added successfully',
      201
    );
  } catch (error) {
    console.error('[Institution createDepartment Error]', error);
    return sendError(res, 'Failed to add department: ' + error.message, 500);
  }
}

/**
 * Autocomplete search for industries (replaces static dropdown)
 */
async function searchIndustries(req, res) {
  try {
    const { q } = req.query;
    let query = `
      SELECT id, company_name, industry_domain, city, state, website, company_size
      FROM industry_profiles
    `;
    const params = [];

    if (q && q.trim()) {
      query += ` WHERE company_name LIKE ? OR industry_domain LIKE ? OR city LIKE ?`;
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY company_name ASC LIMIT 25`;

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, rows, 'Industry partners search results');
  } catch (error) {
    console.error('[Institution searchIndustries Error]', error);
    return sendError(res, 'Failed to search industry partners: ' + error.message, 500);
  }
}

/**
 * Get Industry-Provided Training Programs
 */
async function getIndustryTrainingPrograms(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { domain, audience, keyword } = req.query;

    let query = `
      SELECT itp.*, ip.company_name, ip.website as company_website, ip.city as company_city, ip.industry_domain,
             ite.id as enrollment_id, ite.status as enrollment_status, ite.requested_batch_size, ite.created_at as enrolled_at
      FROM industry_training_programs itp
      JOIN industry_profiles ip ON itp.industry_id = ip.id
      LEFT JOIN institution_training_enrollments ite 
        ON itp.id = ite.program_id AND ite.institution_id = ?
      WHERE itp.status = 'OPEN'
    `;
    const params = [institutionId];

    if (domain && domain !== 'ALL') {
      query += ` AND itp.domain = ?`;
      params.push(domain);
    }

    if (audience && audience !== 'ALL') {
      query += ` AND (itp.target_audience = ? OR itp.target_audience = 'ALL')`;
      params.push(audience);
    }

    if (keyword && keyword.trim()) {
      query += ` AND (itp.title LIKE ? OR itp.description LIKE ? OR ip.company_name LIKE ? OR itp.skills_covered LIKE ?)`;
      const kw = `%${keyword.trim()}%`;
      params.push(kw, kw, kw, kw);
    }

    query += ` ORDER BY itp.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, rows, 'Industry training programs retrieved successfully');
  } catch (error) {
    console.error('[Institution getTrainingPrograms Error]', error);
    return sendError(res, 'Failed to fetch training programs: ' + error.message, 500);
  }
}

/**
 * Request enrollment of institution student or faculty cohort in an industry training program
 */
async function requestTrainingEnrollment(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    const { program_id, requested_batch_size = 30, preferred_start_date, notes } = req.body;

    if (!program_id) {
      return sendError(res, 'Training program ID is required', 400);
    }

    // Check if training program exists
    const [prog] = await pool.query(
      `SELECT itp.*, ip.user_id as industry_user_id, ip.company_name 
       FROM industry_training_programs itp
       JOIN industry_profiles ip ON itp.industry_id = ip.id
       WHERE itp.id = ? LIMIT 1`,
      [program_id]
    );

    if (prog.length === 0) {
      return sendError(res, 'Training program not found', 404);
    }

    // Insert or update enrollment
    const [existing] = await pool.query(
      'SELECT id FROM institution_training_enrollments WHERE institution_id = ? AND program_id = ? LIMIT 1',
      [institutionId, program_id]
    );

    let enrollmentId;
    if (existing.length > 0) {
      await pool.query(
        `UPDATE institution_training_enrollments 
         SET requested_batch_size = ?, preferred_start_date = ?, notes = ?, status = 'PENDING'
         WHERE id = ?`,
        [requested_batch_size, preferred_start_date || null, notes || null, existing[0].id]
      );
      enrollmentId = existing[0].id;
    } else {
      const [insRes] = await pool.query(
        `INSERT INTO institution_training_enrollments 
         (institution_id, program_id, requested_batch_size, preferred_start_date, notes, status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [institutionId, program_id, requested_batch_size, preferred_start_date || null, notes || null]
      );
      enrollmentId = insRes.insertId;
    }

    // Notify the industry provider
    if (prog[0].industry_user_id) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'INFO', '/industry/opportunities')`,
        [
          prog[0].industry_user_id,
          `Cohort Enrollment Request from ${inst[0]?.institution_name || 'Institution'}`,
          `${inst[0]?.institution_name || 'An Institution'} has requested cohort training for '${prog[0].title}' (${requested_batch_size} participants).`
        ]
      );
    }

    return sendSuccess(
      res,
      { enrollmentId, status: 'PENDING', programTitle: prog[0].title },
      'Training cohort enrollment requested successfully. The industry provider has been notified.',
      201
    );
  } catch (error) {
    console.error('[Institution requestTrainingEnrollment Error]', error);
    return sendError(res, 'Failed to request training enrollment: ' + error.message, 500);
  }
}

/**
 * Get placement field analytics & responsive visual graph statistics
 */
async function getPlacementFieldAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const [inst] = await pool.query('SELECT id, institution_name FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = inst.length > 0 ? inst[0].id : 1;

    // Overall metrics
    const [overall] = await pool.query(
      `SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN is_placed = TRUE THEN 1 ELSE 0 END) as placed_students
       FROM student_profiles
       WHERE ? IS NULL OR institution_id = ?`,
      [institutionId, institutionId]
    );

    const totalStudents = overall[0].total_students || 0;
    const placedStudents = overall[0].placed_students || 0;
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // Field-wise breakdown of placed students
    const [fieldRows] = await pool.query(
      `SELECT 
        COALESCE(placement_field, 'Software Engineering') as field,
        COUNT(*) as placed_count,
        GROUP_CONCAT(DISTINCT placed_company SEPARATOR ', ') as hiring_companies,
        AVG(CASE 
          WHEN placed_package LIKE '%LPA%' THEN CAST(REPLACE(placed_package, ' LPA', '') AS DECIMAL(4,2))
          ELSE 12.0
        END) as avg_ctc,
        MAX(CASE 
          WHEN placed_package LIKE '%LPA%' THEN CAST(REPLACE(placed_package, ' LPA', '') AS DECIMAL(4,2))
          ELSE 16.5
        END) as max_ctc
       FROM student_profiles
       WHERE (is_placed = TRUE) AND (? IS NULL OR institution_id = ?)
       GROUP BY COALESCE(placement_field, 'Software Engineering')
       ORDER BY placed_count DESC`,
      [institutionId, institutionId]
    );

    // Compute field percentages relative to placed students
    const fieldsData = fieldRows.map(f => {
      const count = f.placed_count;
      const pct = placedStudents > 0 ? Math.round((count / placedStudents) * 100) : 0;
      return {
        field: f.field,
        placedCount: count,
        percentage: pct,
        avgCtc: parseFloat(Number(f.avg_ctc || 12).toFixed(1)),
        maxCtc: parseFloat(Number(f.max_ctc || 16).toFixed(1)),
        hiringCompanies: f.hiring_companies ? f.hiring_companies.split(', ') : ['Enterprise Partners']
      };
    });

    // Detailed placed roster
    const [roster] = await pool.query(
      `SELECT sp.id, u.name, u.email, sp.department, sp.degree, sp.graduation_year, sp.cgpa,
              sp.placed_company, sp.placed_package, COALESCE(sp.placement_field, 'Software Engineering') as placement_field
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.is_placed = TRUE AND (? IS NULL OR sp.institution_id = ?)
       ORDER BY sp.cgpa DESC`,
      [institutionId, institutionId]
    );

    // Overall package summary
    const avgOverallCtc = fieldsData.length > 0
      ? (fieldsData.reduce((acc, curr) => acc + curr.avgCtc, 0) / fieldsData.length).toFixed(1)
      : '14.5';
    const highestCtc = fieldsData.length > 0
      ? Math.max(...fieldsData.map(f => f.maxCtc)).toFixed(1)
      : '18.0';

    return sendSuccess(res, {
      institutionName: inst[0]?.institution_name || 'Academic Institution',
      totalStudents,
      placedStudents,
      placementRate,
      averagePackage: `${avgOverallCtc} LPA`,
      highestPackage: `${highestCtc} LPA`,
      fieldsData,
      placedRoster: roster
    }, 'Placement field analytics retrieved successfully');
  } catch (error) {
    console.error('[Institution getPlacementFieldAnalytics Error]', error);
    return sendError(res, 'Failed to fetch placement analytics: ' + error.message, 500);
  }
}

module.exports = {
  getInstitutionAnalytics,
  getInstitutionStudents,
  getStudentActivityHistory,
  getInstitutionAcademicians,
  getInstitutionPartners,
  proposeMou,
  searchIndustryCollaborations,
  getPublicInstitutions,
  createInstitutionStudent,
  createInstitutionAcademician,
  getInstitutionDepartments,
  createInstitutionDepartment,
  searchIndustries,
  getIndustryTrainingPrograms,
  requestTrainingEnrollment,
  getPlacementFieldAnalytics
};

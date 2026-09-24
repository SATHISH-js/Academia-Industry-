const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Get academician profile
 */
async function getAcademicianProfile(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT ap.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name, ip.city as institution_city
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
      linkedin_url,
      city,
      state,
      is_open_guest_lecture,
      guest_lecture_topics,
      guest_lecture_mode,
      guest_lecture_bio
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
        linkedin_url = COALESCE(?, linkedin_url),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        is_open_guest_lecture = COALESCE(?, is_open_guest_lecture),
        guest_lecture_topics = COALESCE(?, guest_lecture_topics),
        guest_lecture_mode = COALESCE(?, guest_lecture_mode),
        guest_lecture_bio = COALESCE(?, guest_lecture_bio)
       WHERE user_id = ?`,
      [
        designation,
        department,
        qualification,
        experience_years,
        specialization,
        research_interests,
        publications_count,
        linkedin_url,
        city,
        state,
        is_open_guest_lecture !== undefined ? (is_open_guest_lecture ? 1 : 0) : null,
        guest_lecture_topics,
        guest_lecture_mode,
        guest_lecture_bio,
        userId
      ]
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

/**
 * Get campus departments for the academician's institution
 * Enables visiting cohorts under their department or visiting other campus departments
 */
async function getDepartmentList(req, res) {
  try {
    const userId = req.user.id;
    const [acadRows] = await pool.query('SELECT institution_id, department FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const institutionId = acadRows.length > 0 ? acadRows[0].institution_id : 1;
    const myDepartment = acadRows.length > 0 ? acadRows[0].department : 'Computer Science & Engineering';

    const [depts] = await pool.query(
      `SELECT 
        COALESCE(sp.department, 'General Engineering') as department,
        COUNT(sp.id) as student_count,
        ROUND(AVG(COALESCE(sp.cgpa, 0)), 2) as avg_cgpa,
        SUM(CASE WHEN sp.is_placed = 1 THEN 1 ELSE 0 END) as placed_count
       FROM student_profiles sp
       WHERE sp.institution_id = ?
       GROUP BY sp.department
       ORDER BY student_count DESC`,
      [institutionId]
    );

    return sendSuccess(res, {
      myDepartment,
      departments: depts
    }, 'Institution departments retrieved');
  } catch (error) {
    console.error('[Academician getDepartmentList Error]', error);
    return sendError(res, 'Failed to fetch departments', 500);
  }
}

/**
 * Get students under the academician's department (or visited department)
 * Includes rich filters: section, year, semester, CGPA, attendance status, search
 */
async function getAcademicianStudents(req, res) {
  try {
    const userId = req.user.id;
    const [acadRows] = await pool.query('SELECT id, institution_id, department FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (acadRows.length === 0) return sendError(res, 'Academician profile not found', 404);

    const institutionId = acadRows[0].institution_id;
    const defaultDept = acadRows[0].department;

    const {
      department = defaultDept,
      section,
      year,
      semester,
      min_cgpa,
      attendance_status, // 'ALL', 'LOW' (< 75%), 'CRITICAL' (< 65%), 'GOOD' (>= 75%)
      search
    } = req.query;

    let query = `
      SELECT sp.*, u.name, u.email, u.phone, u.avatar_url
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.institution_id = ?
    `;
    const params = [institutionId];

    if (department && department !== 'ALL') {
      query += ` AND sp.department LIKE ?`;
      params.push(`%${department}%`);
    }

    if (section && section !== 'ALL') {
      query += ` AND sp.section = ?`;
      params.push(section);
    }

    if (year && year !== 'ALL') {
      query += ` AND (sp.current_year = ? OR sp.graduation_year = ?)`;
      params.push(year, year);
    }

    if (semester && semester !== 'ALL') {
      query += ` AND sp.current_semester = ?`;
      params.push(semester);
    }

    if (min_cgpa) {
      query += ` AND sp.cgpa >= ?`;
      params.push(parseFloat(min_cgpa));
    }

    if (attendance_status === 'LOW') {
      query += ` AND CAST(REPLACE(sp.attendance_percentage, '%', '') AS DECIMAL(5,2)) < 75.0`;
    } else if (attendance_status === 'CRITICAL') {
      query += ` AND CAST(REPLACE(sp.attendance_percentage, '%', '') AS DECIMAL(5,2)) < 65.0`;
    } else if (attendance_status === 'GOOD') {
      query += ` AND CAST(REPLACE(sp.attendance_percentage, '%', '') AS DECIMAL(5,2)) >= 75.0`;
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR sp.register_number LIKE ? OR sp.enrollment_number LIKE ?)`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY sp.cgpa DESC, sp.overall_skill_score DESC`;

    const [students] = await pool.query(query, params);

    // Enrich with verified skills and roadmap milestone stats
    for (const stu of students) {
      const [skills] = await pool.query(
        `SELECT ss.skill_id, ss.score, ss.level, s.name as skill_name
         FROM student_skills ss
         JOIN skills s ON ss.skill_id = s.id
         WHERE ss.student_id = ? LIMIT 6`,
        [stu.id]
      );
      stu.verifiedSkills = skills;

      // Count roadmap tasks
      const [taskStats] = await pool.query(
        `SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks
         FROM student_roadmap_tasks
         WHERE student_id = ?`,
        [stu.id]
      );
      stu.roadmapStats = {
        total: taskStats[0]?.total_tasks || 0,
        completed: taskStats[0]?.completed_tasks || 0,
        pct: taskStats[0]?.total_tasks > 0 ? Math.round((taskStats[0].completed_tasks / taskStats[0].total_tasks) * 100) : 0
      };

      // Check unread messages from this student
      const [unread] = await pool.query(
        `SELECT COUNT(*) as count
         FROM academician_student_messages
         WHERE academician_id = ? AND student_id = ? AND sender_role = 'STUDENT' AND is_read = 0`,
        [acadRows[0].id, stu.id]
      );
      stu.unreadMessagesCount = unread[0]?.count || 0;
    }

    return sendSuccess(res, {
      department: department || defaultDept,
      totalCount: students.length,
      students
    }, 'Department students retrieved');
  } catch (error) {
    console.error('[Academician getStudents Error]', error);
    return sendError(res, 'Failed to fetch department students: ' + error.message, 500);
  }
}

/**
 * Get comprehensive student monitoring detail for modal inspection
 */
async function getStudentMonitoringDetail(req, res) {
  try {
    const userId = req.user.id;
    const studentId = req.params.studentId;

    const [acadRows] = await pool.query('SELECT id, institution_id FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (acadRows.length === 0) return sendError(res, 'Academician profile not found', 404);
    const academician = acadRows[0];

    // Fetch student profile
    const [stuRows] = await pool.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
       WHERE sp.id = ? AND sp.institution_id = ? LIMIT 1`,
      [studentId, academician.institution_id]
    );

    if (stuRows.length === 0) {
      return sendError(res, 'Student profile not found in your institution', 404);
    }
    const student = stuRows[0];

    // Verified skills
    const [skills] = await pool.query(
      `SELECT ss.*, s.name as skill_name, s.domain
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ?
       ORDER BY ss.score DESC`,
      [student.id]
    );

    // Roadmap milestones
    const [roadmapTasks] = await pool.query(
      `SELECT srt.*, rt.title as task_title, rt.task_type, rm.title as milestone_title
       FROM student_roadmap_tasks srt
       JOIN roadmap_tasks rt ON srt.task_id = rt.id
       LEFT JOIN roadmap_milestones rm ON rt.milestone_id = rm.id
       WHERE srt.student_id = ?
       ORDER BY srt.created_at DESC LIMIT 15`,
      [student.id]
    );

    // Mock interviews
    const [mockInterviews] = await pool.query(
      `SELECT * FROM mock_interviews WHERE student_id = ? ORDER BY created_at DESC LIMIT 5`,
      [student.id]
    );

    // Active applications
    const [applications] = await pool.query(
      `SELECT a.*, 
        CASE 
          WHEN a.opportunity_type = 'INTERNSHIP' THEN (SELECT title FROM internships WHERE id = a.opportunity_id)
          WHEN a.opportunity_type = 'JOB' THEN (SELECT title FROM jobs WHERE id = a.opportunity_id)
          ELSE 'Opportunity'
        END AS opportunity_title
       FROM applications a
       WHERE a.applicant_id = ?
       ORDER BY a.created_at DESC LIMIT 5`,
      [student.user_id]
    );

    // Exchanged messages with this academician
    const [messages] = await pool.query(
      `SELECT * FROM academician_student_messages
       WHERE academician_id = ? AND student_id = ?
       ORDER BY created_at ASC`,
      [academician.id, student.id]
    );

    // Mark unread messages as read
    await pool.query(
      `UPDATE academician_student_messages 
       SET is_read = 1 
       WHERE academician_id = ? AND student_id = ? AND sender_role = 'STUDENT'`,
      [academician.id, student.id]
    );

    return sendSuccess(res, {
      student,
      verifiedSkills: skills,
      roadmapTasks,
      mockInterviews,
      applications,
      messages
    }, 'Student monitoring details retrieved');
  } catch (error) {
    console.error('[Academician getStudentMonitoringDetail Error]', error);
    return sendError(res, 'Failed to fetch student details: ' + error.message, 500);
  }
}

/**
 * Get direct messages between academician and student
 */
async function getStudentGuidanceMessages(req, res) {
  try {
    const userId = req.user.id;
    const studentId = req.params.studentId;

    const [acadRows] = await pool.query('SELECT id FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);
    const academicianId = acadRows[0].id;

    const [messages] = await pool.query(
      `SELECT asm.*, 
              CASE WHEN asm.sender_role = 'ACADEMICIAN' THEN u1.name ELSE u2.name END as sender_name
       FROM academician_student_messages asm
       JOIN academician_profiles ap ON asm.academician_id = ap.id
       JOIN users u1 ON ap.user_id = u1.id
       JOIN student_profiles sp ON asm.student_id = sp.id
       JOIN users u2 ON sp.user_id = u2.id
       WHERE asm.academician_id = ? AND asm.student_id = ?
       ORDER BY asm.created_at ASC`,
      [academicianId, studentId]
    );

    return sendSuccess(res, messages, 'Guidance messages retrieved');
  } catch (error) {
    console.error('[Academician getStudentGuidanceMessages Error]', error);
    return sendError(res, 'Failed to fetch messages', 500);
  }
}

/**
 * Send direct guidance/mentorship message to student
 */
async function sendStudentGuidanceMessage(req, res) {
  try {
    const userId = req.user.id;
    const studentId = req.params.studentId;
    const { subject, message, message_type = 'GUIDANCE' } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 'Message text is required', 400);
    }

    const [acadRows] = await pool.query(
      'SELECT ap.id, ap.user_id, u.name, ap.department FROM academician_profiles ap JOIN users u ON ap.user_id = u.id WHERE ap.user_id = ? LIMIT 1',
      [userId]
    );
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);
    const academician = acadRows[0];

    const [stuRows] = await pool.query(
      'SELECT sp.id, sp.user_id, u.name, u.email FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = ? LIMIT 1',
      [studentId]
    );
    if (stuRows.length === 0) return sendError(res, 'Student not found', 404);
    const student = stuRows[0];

    const [result] = await pool.query(
      `INSERT INTO academician_student_messages
       (academician_id, academician_user_id, student_id, student_user_id, sender_role, subject, message, message_type, is_read)
       VALUES (?, ?, ?, ?, 'ACADEMICIAN', ?, ?, ?, 0)`,
      [academician.id, academician.user_id, student.id, student.user_id, subject || 'Academic Guidance & Mentorship', message.trim(), message_type]
    );

    // Notify student
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/student/roadmap')`,
      [
        student.user_id,
        `Faculty Guidance from ${academician.name}`,
        `${academician.name} (${academician.department}) sent you an academic guidance note: "${message.trim().substring(0, 90)}..."`
      ]
    );

    const insertedMsg = {
      id: result.insertId,
      academician_id: academician.id,
      student_id: student.id,
      sender_role: 'ACADEMICIAN',
      sender_name: academician.name,
      subject: subject || 'Academic Guidance & Mentorship',
      message: message.trim(),
      message_type,
      created_at: new Date().toISOString()
    };

    return sendSuccess(res, insertedMsg, 'Message sent to student successfully', 201);
  } catch (error) {
    console.error('[Academician sendStudentGuidanceMessage Error]', error);
    return sendError(res, 'Failed to send message: ' + error.message, 500);
  }
}

/**
 * Get institutional commands/directives for this academician
 */
async function getInstitutionDirectives(req, res) {
  try {
    const userId = req.user.id;
    const [acadRows] = await pool.query('SELECT institution_id, department FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);

    const institutionId = acadRows[0].institution_id;
    const department = acadRows[0].department;

    const { priority, status = 'ALL', category } = req.query;

    let query = `
      SELECT id.*, ip.institution_name
      FROM institution_directives id
      JOIN institution_profiles ip ON id.institution_id = ip.id
      WHERE id.institution_id = ?
        AND (id.target_type IN ('ALL_DEPARTMENTS', 'ALL_FACULTY') 
             OR id.target_department IS NULL 
             OR id.target_department LIKE ?)
    `;
    const params = [institutionId, `%${department}%`];

    if (priority && priority !== 'ALL') {
      query += ` AND id.priority = ?`;
      params.push(priority);
    }

    if (status && status !== 'ALL') {
      query += ` AND id.status = ?`;
      params.push(status);
    }

    if (category && category !== 'ALL') {
      query += ` AND id.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY CASE WHEN id.priority = 'URGENT' THEN 1 WHEN id.priority = 'HIGH' THEN 2 WHEN id.priority = 'MEDIUM' THEN 3 ELSE 4 END, id.created_at DESC`;

    const [directives] = await pool.query(query, params);

    return sendSuccess(res, {
      total: directives.length,
      directives
    }, 'Institution directives retrieved');
  } catch (error) {
    console.error('[Academician getInstitutionDirectives Error]', error);
    return sendError(res, 'Failed to fetch directives: ' + error.message, 500);
  }
}

/**
 * Acknowledge or update status of an institutional directive
 */
async function acknowledgeDirective(req, res) {
  try {
    const directiveId = req.params.id;
    const { status = 'ACTIONED' } = req.body;

    await pool.query(
      'UPDATE institution_directives SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, directiveId]
    );

    return sendSuccess(res, { id: directiveId, status }, 'Directive status updated successfully');
  } catch (error) {
    console.error('[Academician acknowledgeDirective Error]', error);
    return sendError(res, 'Failed to update directive status', 500);
  }
}

/**
 * Toggle academician's "Open to take Guest Lectures" availability
 */
async function toggleGuestLectureAvailability(req, res) {
  try {
    const userId = req.user.id;
    const { is_open_guest_lecture, guest_lecture_topics, guest_lecture_mode, guest_lecture_bio, guest_lecture_experience } = req.body;

    await pool.query(
      `UPDATE academician_profiles SET
        is_open_guest_lecture = ?,
        guest_lecture_topics = COALESCE(?, guest_lecture_topics),
        guest_lecture_mode = COALESCE(?, guest_lecture_mode),
        guest_lecture_bio = COALESCE(?, guest_lecture_bio),
        guest_lecture_experience = COALESCE(?, guest_lecture_experience)
       WHERE user_id = ?`,
      [
        is_open_guest_lecture ? 1 : 0,
        guest_lecture_topics,
        guest_lecture_mode,
        guest_lecture_bio,
        guest_lecture_experience,
        userId
      ]
    );

    return sendSuccess(res, { is_open_guest_lecture: !!is_open_guest_lecture }, 'Guest lecture availability updated successfully');
  } catch (error) {
    console.error('[Academician toggleGuestLectureAvailability Error]', error);
    return sendError(res, 'Failed to update guest lecture settings', 500);
  }
}

/**
 * Inter-College Directory: Find faculty from other colleges open to taking guest lectures
 */
async function getGuestLectureDirectory(req, res) {
  try {
    const userId = req.user.id;
    const [currentAcad] = await pool.query('SELECT id, institution_id FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    const myInstitutionId = currentAcad.length > 0 ? currentAcad[0].institution_id : null;

    const { search, topic, mode, institution_id, exclude_self = 'true' } = req.query;

    let query = `
      SELECT ap.id, ap.user_id, ap.institution_id, ap.department, ap.designation, ap.qualification,
             ap.experience_years, ap.specialization, ap.publications_count,
             ap.is_open_guest_lecture, ap.guest_lecture_topics, ap.guest_lecture_mode, ap.guest_lecture_bio,
             ap.city, ap.state,
             u.name as speaker_name, u.email as speaker_email, u.avatar_url,
             ip.institution_name, ip.city as institution_city, ip.state as institution_state
      FROM academician_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN institution_profiles ip ON ap.institution_id = ip.id
      WHERE ap.is_open_guest_lecture = 1
    `;
    const params = [];

    if (exclude_self === 'true' && currentAcad.length > 0) {
      query += ` AND ap.id != ?`;
      params.push(currentAcad[0].id);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ` AND (u.name LIKE ? OR ap.department LIKE ? OR ap.guest_lecture_topics LIKE ? OR ip.institution_name LIKE ?)`;
      params.push(s, s, s, s);
    }

    if (topic && topic.trim()) {
      query += ` AND ap.guest_lecture_topics LIKE ?`;
      params.push(`%${topic.trim()}%`);
    }

    if (mode && mode !== 'ALL') {
      query += ` AND (ap.guest_lecture_mode = ? OR ap.guest_lecture_mode = 'HYBRID')`;
      params.push(mode);
    }

    if (institution_id) {
      query += ` AND ap.institution_id = ?`;
      params.push(parseInt(institution_id, 10));
    }

    query += ` ORDER BY ap.experience_years DESC, ap.publications_count DESC`;

    const [speakers] = await pool.query(query, params);

    return sendSuccess(res, {
      total: speakers.length,
      myInstitutionId,
      speakers
    }, 'Inter-college guest lecture faculty directory retrieved');
  } catch (error) {
    console.error('[Academician getGuestLectureDirectory Error]', error);
    return sendError(res, 'Failed to fetch guest lecture directory: ' + error.message, 500);
  }
}

/**
 * Get guest lectures for the logged-in academician (both incoming invitations and outgoing requests)
 */
async function getFacultyGuestLectures(req, res) {
  try {
    const userId = req.user.id;
    const [acadRows] = await pool.query('SELECT id, institution_id FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);
    const academicianId = acadRows[0].id;

    // 1. Incoming: Where this academician is invited to speak
    const [incoming] = await pool.query(
      `SELECT fgl.*, 
              u_req.name as requester_name, u_req.email as requester_email,
              ap_req.department as requester_department, ap_req.designation as requester_designation,
              ip_req.institution_name as host_institution_name, ip_req.city as host_institution_city
       FROM faculty_guest_lectures fgl
       JOIN academician_profiles ap_req ON fgl.requester_academician_id = ap_req.id
       JOIN users u_req ON ap_req.user_id = u_req.id
       JOIN institution_profiles ip_req ON fgl.requester_institution_id = ip_req.id
       WHERE fgl.speaker_academician_id = ?
       ORDER BY fgl.created_at DESC`,
      [academicianId]
    );

    // 2. Outgoing: Where this academician requested a speaker from another college or proposed a lecture
    const [outgoing] = await pool.query(
      `SELECT fgl.*, 
              u_spk.name as speaker_name, u_spk.email as speaker_email,
              ap_spk.department as speaker_department, ap_spk.designation as speaker_designation,
              ip_spk.institution_name as speaker_institution_name, ip_spk.city as speaker_institution_city
       FROM faculty_guest_lectures fgl
       JOIN academician_profiles ap_spk ON fgl.speaker_academician_id = ap_spk.id
       JOIN users u_spk ON ap_spk.user_id = u_spk.id
       JOIN institution_profiles ip_spk ON fgl.speaker_institution_id = ip_spk.id
       WHERE fgl.requester_academician_id = ?
       ORDER BY fgl.created_at DESC`,
      [academicianId]
    );

    return sendSuccess(res, { incoming, outgoing }, 'Faculty guest lectures retrieved');
  } catch (error) {
    console.error('[Academician getFacultyGuestLectures Error]', error);
    return sendError(res, 'Failed to fetch guest lectures: ' + error.message, 500);
  }
}

/**
 * Send / Request a Guest Lecture for or from another college
 */
async function requestFacultyGuestLecture(req, res) {
  try {
    const userId = req.user.id;
    const [acadRows] = await pool.query(
      `SELECT ap.id, ap.institution_id, u.name, ip.institution_name 
       FROM academician_profiles ap 
       JOIN users u ON ap.user_id = u.id 
       JOIN institution_profiles ip ON ap.institution_id = ip.id 
       WHERE ap.user_id = ? LIMIT 1`,
      [userId]
    );
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);
    const requester = acadRows[0];

    const {
      speaker_academician_id,
      request_type = 'INVITATION', // 'INVITATION' or 'PROPOSAL'
      topic,
      description,
      target_audience = 'Undergraduate Engineering Students',
      delivery_mode = 'VIRTUAL',
      proposed_date,
      meeting_link,
      venue
    } = req.body;

    if (!speaker_academician_id || !topic) {
      return sendError(res, 'Speaker and topic are required', 400);
    }

    // Get speaker info
    const [spkRows] = await pool.query(
      `SELECT ap.id, ap.institution_id, ap.user_id, u.name 
       FROM academician_profiles ap 
       JOIN users u ON ap.user_id = u.id 
       WHERE ap.id = ? LIMIT 1`,
      [speaker_academician_id]
    );
    if (spkRows.length === 0) return sendError(res, 'Target speaker not found', 404);
    const speaker = spkRows[0];

    const [result] = await pool.query(
      `INSERT INTO faculty_guest_lectures
       (requester_academician_id, requester_institution_id, speaker_academician_id, speaker_institution_id, request_type, topic, description, target_audience, delivery_mode, proposed_date, meeting_link, venue, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        requester.id,
        requester.institution_id,
        speaker.id,
        speaker.institution_id,
        request_type,
        topic.trim(),
        description || '',
        target_audience,
        delivery_mode,
        proposed_date || null,
        meeting_link || null,
        venue || null
      ]
    );

    // Notify speaker
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'OPPORTUNITY', '/academician/guest-lectures')`,
      [
        speaker.user_id,
        `Guest Lecture Invitation: ${topic}`,
        `${requester.name} from ${requester.institution_name} invited you to deliver a guest lecture on "${topic}".`
      ]
    );

    return sendSuccess(res, { id: result.insertId, status: 'PENDING' }, 'Guest lecture request submitted successfully', 201);
  } catch (error) {
    console.error('[Academician requestFacultyGuestLecture Error]', error);
    return sendError(res, 'Failed to submit guest lecture request: ' + error.message, 500);
  }
}

/**
 * Update status of guest lecture (ACCEPT, DECLINE, SCHEDULE, COMPLETE)
 */
async function updateFacultyGuestLectureStatus(req, res) {
  try {
    const lectureId = req.params.id;
    const { status, meeting_link, venue, response_notes } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'DECLINED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const [lectures] = await pool.query('SELECT * FROM faculty_guest_lectures WHERE id = ? LIMIT 1', [lectureId]);
    if (lectures.length === 0) return sendError(res, 'Guest lecture not found', 404);
    const lecture = lectures[0];

    await pool.query(
      `UPDATE faculty_guest_lectures SET
        status = ?,
        meeting_link = COALESCE(?, meeting_link),
        venue = COALESCE(?, venue),
        response_notes = COALESCE(?, response_notes),
        updated_at = NOW()
       WHERE id = ?`,
      [status, meeting_link, venue, response_notes, lectureId]
    );

    // Notify requester
    const [reqAcads] = await pool.query('SELECT user_id FROM academician_profiles WHERE id = ? LIMIT 1', [lecture.requester_academician_id]);
    if (reqAcads.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, ?, ?, 'OPPORTUNITY', '/academician/guest-lectures')`,
        [
          reqAcads[0].user_id,
          `Guest Lecture Update: ${status}`,
          `Your guest lecture session on "${lecture.topic}" has been updated to ${status}.`
        ]
      );
    }

    return sendSuccess(res, { id: lectureId, status }, 'Guest lecture status updated successfully');
  } catch (error) {
    console.error('[Academician updateFacultyGuestLectureStatus Error]', error);
    return sendError(res, 'Failed to update guest lecture status', 500);
  }
}

/**
 * Student endpoint: Get academic guidance messages from faculty
 */
async function getStudentGuidanceInbox(req, res) {
  try {
    const userId = req.user.id;
    const [stuRows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (stuRows.length === 0) return sendError(res, 'Student profile not found', 404);
    const studentId = stuRows[0].id;

    const [messages] = await pool.query(
      `SELECT asm.*, 
              u.name as academician_name, u.email as academician_email, u.avatar_url as academician_avatar,
              ap.department, ap.designation
       FROM academician_student_messages asm
       JOIN academician_profiles ap ON asm.academician_id = ap.id
       JOIN users u ON ap.user_id = u.id
       WHERE asm.student_id = ?
       ORDER BY asm.created_at DESC`,
      [studentId]
    );

    return sendSuccess(res, messages, 'Academic guidance messages retrieved');
  } catch (error) {
    console.error('[Student getGuidanceInbox Error]', error);
    return sendError(res, 'Failed to fetch student guidance messages', 500);
  }
}

/**
 * Student endpoint: Reply to faculty guidance message
 */
async function replyToAcademicianMessage(req, res) {
  try {
    const userId = req.user.id;
    const { academician_id, subject, message } = req.body;

    if (!academician_id || !message || !message.trim()) {
      return sendError(res, 'academician_id and message are required', 400);
    }

    const [stuRows] = await pool.query(
      'SELECT sp.id, sp.user_id, u.name FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.user_id = ? LIMIT 1',
      [userId]
    );
    if (stuRows.length === 0) return sendError(res, 'Student profile not found', 404);
    const student = stuRows[0];

    const [acadRows] = await pool.query(
      'SELECT user_id FROM academician_profiles WHERE id = ? LIMIT 1',
      [academician_id]
    );
    if (acadRows.length === 0) return sendError(res, 'Academician not found', 404);

    const [result] = await pool.query(
      `INSERT INTO academician_student_messages
       (academician_id, academician_user_id, student_id, student_user_id, sender_role, subject, message, message_type, is_read)
       VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, 'FEEDBACK', 0)`,
      [academician_id, acadRows[0].user_id, student.id, student.user_id, subject || 'Student Reply', message.trim()]
    );

    // Notify academician
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'INFO', '/academician/students')`,
      [
        acadRows[0].user_id,
        `Student Reply from ${student.name}`,
        `${student.name} replied: "${message.trim().substring(0, 90)}..."`
      ]
    );

    return sendSuccess(res, { id: result.insertId }, 'Reply sent successfully', 201);
  } catch (error) {
    console.error('[Student replyToAcademicianMessage Error]', error);
    return sendError(res, 'Failed to send reply', 500);
  }
}

module.exports = {
  getAcademicianProfile,
  updateAcademicianProfile,
  getAcademicianOpportunities,
  getDepartmentList,
  getAcademicianStudents,
  getStudentMonitoringDetail,
  getStudentGuidanceMessages,
  sendStudentGuidanceMessage,
  getInstitutionDirectives,
  acknowledgeDirective,
  toggleGuestLectureAvailability,
  getGuestLectureDirectory,
  getFacultyGuestLectures,
  requestFacultyGuestLecture,
  updateFacultyGuestLectureStatus,
  getStudentGuidanceInbox,
  replyToAcademicianMessage
};

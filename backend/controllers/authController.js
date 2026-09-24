const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Register a new user and initialize role-specific profile
 */
async function register(req, res) {
  const {
    name,
    email,
    password,
    phone,
    role,
    institution_id,
    target_role,
    department,
    degree,
    graduation_year,
    enrollment_number,
    skills,
    // Academician fields
    designation,
    employee_id,
    qualification,
    experience_years,
    specialization,
    // Industry fields
    company_name,
    industry_domain,
    // Institution fields
    institution_name,
    institution_type,
    city,
    state
  } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check for duplicate email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || null]
    );
    const userId = userResult.insertId;

    // Create corresponding profile record
    if (role === 'STUDENT') {
      const studentHeadline = target_role || 'Student Scholar';
      const studentDept = department || 'Computer Science & Engineering';
      const studentDegree = degree || 'B.Tech / B.E';
      const studentGradYear = graduation_year ? parseInt(graduation_year, 10) : 2026;
      const studentEnrollment = enrollment_number || null;
      const { address, city, state, pincode } = req.body;

      const [stuRes] = await connection.query(
        `INSERT INTO student_profiles (user_id, headline, bio, institution_id, department, degree, graduation_year, enrollment_number, address, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          studentHeadline,
          `Enthusiastic student pursuing ${studentDegree} in ${studentDept}, aspiring to excel as a ${studentHeadline}.`,
          institution_id || null,
          studentDept,
          studentDegree,
          studentGradYear,
          studentEnrollment,
          address || null,
          city || null,
          state || null,
          pincode || null
        ]
      );
      const studentId = stuRes.insertId;

      // Seed initial skills if provided
      if (Array.isArray(skills) && skills.length > 0) {
        for (const skillItem of skills) {
          const sId = typeof skillItem === 'object' ? skillItem.id : parseInt(skillItem, 10);
          if (sId && !isNaN(sId)) {
            await connection.query(
              `INSERT IGNORE INTO student_skills (student_id, skill_id, level, score) VALUES (?, ?, 'INTERMEDIATE', 70)`,
              [studentId, sId]
            );
          }
        }
      }
    } else if (role === 'ACADEMICIAN') {
      const { address, city, state, pincode } = req.body;
      await connection.query(
        `INSERT INTO academician_profiles (user_id, institution_id, designation, department, employee_id, qualification, experience_years, specialization, address, city, state, pincode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          institution_id || null,
          designation || 'Assistant Professor',
          department || 'Computer Science & Engineering',
          employee_id || null,
          qualification || 'Ph.D. in Engineering',
          experience_years ? parseInt(experience_years, 10) : 5,
          specialization || 'Applied Research & Curriculum Alignment',
          address || null,
          city || null,
          state || null,
          pincode || null
        ]
      );
    } else if (role === 'INDUSTRY') {
      await connection.query(
        'INSERT INTO industry_profiles (user_id, company_name, industry_domain, description) VALUES (?, ?, ?, ?)',
        [userId, company_name || name, industry_domain || 'Information Technology', 'Technology and Solutions Provider']
      );
    } else if (role === 'INSTITUTION') {
      await connection.query(
        'INSERT INTO institution_profiles (user_id, institution_name, institution_type, city, state) VALUES (?, ?, ?, ?, ?)',
        [userId, institution_name || name, institution_type || 'COLLEGE', city || null, state || null]
      );
    }

    await connection.commit();

    const newUser = { id: userId, name, email, role };
    const token = generateToken(newUser);

    return sendSuccess(res, { user: newUser, token }, 'Registration successful', 201);
  } catch (error) {
    await connection.rollback();
    console.error('[Auth Register Error]', error);
    return sendError(res, 'Failed to register account: ' + error.message, 500);
  } finally {
    connection.release();
  }
}

/**
 * Authenticate user with email and password
 */
async function login(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, role, avatar_url, is_active FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      await pool.query(
        'INSERT INTO login_history (email, ip_address, user_agent, status) VALUES (?, ?, ?, "FAILED")',
        [email, ipAddress, userAgent]
      );
      return sendError(res, 'Invalid credentials. Please verify your email and password.', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      await pool.query(
        'INSERT INTO login_history (user_id, email, ip_address, user_agent, status) VALUES (?, ?, ?, ?, "FAILED")',
        [user.id, email, ipAddress, userAgent]
      );
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await pool.query(
        'INSERT INTO login_history (user_id, email, ip_address, user_agent, status) VALUES (?, ?, ?, ?, "FAILED")',
        [user.id, email, ipAddress, userAgent]
      );
      return sendError(res, 'Invalid credentials. Please verify your email and password.', 401);
    }

    // Record successful login audit
    await pool.query(
      'INSERT INTO login_history (user_id, email, ip_address, user_agent, status) VALUES (?, ?, ?, ?, "SUCCESS")',
      [user.id, email, ipAddress, userAgent]
    );

    // Load role profile details
    let profile = null;
    if (user.role === 'STUDENT') {
      const [p] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1', [user.id]);
      profile = p[0] || null;
    } else if (user.role === 'ACADEMICIAN') {
      const [p] = await pool.query('SELECT * FROM academician_profiles WHERE user_id = ? LIMIT 1', [user.id]);
      profile = p[0] || null;
    } else if (user.role === 'INDUSTRY') {
      const [p] = await pool.query('SELECT * FROM industry_profiles WHERE user_id = ? LIMIT 1', [user.id]);
      profile = p[0] || null;
    } else if (user.role === 'INSTITUTION') {
      const [p] = await pool.query('SELECT * FROM institution_profiles WHERE user_id = ? LIMIT 1', [user.id]);
      profile = p[0] || null;
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      profile
    };

    const token = generateToken(userPayload);

    return sendSuccess(res, { user: userPayload, token }, 'Login successful');
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return sendError(res, 'Login failed: ' + error.message, 500);
  }
}

/**
 * Get user recent login history
 */
async function getLoginHistory(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, ip_address, user_agent, status, created_at FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
      [req.user.id]
    );
    return sendSuccess(res, rows, 'Login history retrieved');
  } catch (error) {
    console.error('[Auth getLoginHistory Error]', error);
    return sendError(res, 'Failed to fetch login history', 500);
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const [userRows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, phone FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const currentUser = userRows[0] || req.user;

    let profile = null;
    if (role === 'STUDENT') {
      const [p] = await pool.query(
        `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
         FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
         LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
         WHERE sp.user_id = ? LIMIT 1`,
        [userId]
      );
      profile = p[0] || null;
    } else if (role === 'ACADEMICIAN') {
      const [p] = await pool.query(
        `SELECT ap.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
         FROM academician_profiles ap
         JOIN users u ON ap.user_id = u.id
         LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id
         WHERE ap.user_id = ? LIMIT 1`,
        [userId]
      );
      profile = p[0] || null;
    } else if (role === 'INDUSTRY') {
      const [p] = await pool.query(
        `SELECT ip.*, u.name, u.email, u.phone, u.avatar_url
         FROM industry_profiles ip
         JOIN users u ON ip.user_id = u.id
         WHERE ip.user_id = ? LIMIT 1`,
        [userId]
      );
      profile = p[0] || null;
    } else if (role === 'INSTITUTION') {
      const [p] = await pool.query(
        `SELECT inp.*, u.name, u.email, u.phone, u.avatar_url
         FROM institution_profiles inp
         JOIN users u ON inp.user_id = u.id
         WHERE inp.user_id = ? LIMIT 1`,
        [userId]
      );
      profile = p[0] || null;
    }

    const userPayload = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      avatar_url: currentUser.avatar_url,
      phone: currentUser.phone,
      profile
    };

    return sendSuccess(res, { user: userPayload }, 'User profile fetched successfully');
  } catch (error) {
    console.error('[Auth getMe Error]', error);
    return sendError(res, 'Failed to fetch user session profile', 500);
  }
}

/**
 * Update current authenticated user profile & avatar
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { name, phone, avatar_url, ...roleFields } = req.body;

    // Update users table
    if (name !== undefined || phone !== undefined || avatar_url !== undefined) {
      await pool.query(
        `UPDATE users SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          avatar_url = COALESCE(?, avatar_url)
         WHERE id = ?`,
        [name !== undefined ? name : null, phone !== undefined ? phone : null, avatar_url !== undefined ? avatar_url : null, userId]
      );
    }

    // Role-specific updates
    if (role === 'STUDENT') {
      const {
        headline, bio, department, degree, enrollment_number, graduation_year, cgpa, institution_id,
        github_url, linkedin_url, tenth_board, tenth_school, tenth_year, tenth_percentage,
        twelfth_board, twelfth_college, twelfth_year, twelfth_percentage, ug_university, ug_college,
        address, city, state, pincode, current_semester, section, register_number
      } = roleFields;

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
          profile_completed_pct = 95
         WHERE user_id = ?`,
        [
          headline, bio, department, degree, enrollment_number, graduation_year, cgpa, institution_id || null,
          github_url, linkedin_url, tenth_board, tenth_school, tenth_year, tenth_percentage,
          twelfth_board, twelfth_college, twelfth_year, twelfth_percentage,
          ug_university, ug_college, address, city, state, pincode, current_semester, section, register_number, userId
        ]
      );
    } else if (role === 'ACADEMICIAN') {
      const {
        designation, department, qualification, experience_years, specialization,
        research_interests, publications_count, linkedin_url, employee_id, institution_id
      } = roleFields;

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
          employee_id = COALESCE(?, employee_id),
          institution_id = COALESCE(?, institution_id)
         WHERE user_id = ?`,
        [
          designation, department, qualification, experience_years, specialization,
          research_interests, publications_count, linkedin_url, employee_id, institution_id || null, userId
        ]
      );
    } else if (role === 'INDUSTRY') {
      const {
        company_name, industry_domain, company_size, website,
        city, state, country, address, description
      } = roleFields;

      await pool.query(
        `UPDATE industry_profiles SET
          company_name = COALESCE(?, company_name),
          industry_domain = COALESCE(?, industry_domain),
          company_size = COALESCE(?, company_size),
          website = COALESCE(?, website),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          country = COALESCE(?, country),
          address = COALESCE(?, address),
          description = COALESCE(?, description)
         WHERE user_id = ?`,
        [
          company_name, industry_domain, company_size, website,
          city, state, country, address, description, userId
        ]
      );
    } else if (role === 'INSTITUTION') {
      const {
        institution_name, institution_code, institution_type, city,
        state, country, website, accreditation, established_year, description
      } = roleFields;

      await pool.query(
        `UPDATE institution_profiles SET
          institution_name = COALESCE(?, institution_name),
          institution_code = COALESCE(?, institution_code),
          institution_type = COALESCE(?, institution_type),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          country = COALESCE(?, country),
          website = COALESCE(?, website),
          accreditation = COALESCE(?, accreditation),
          established_year = COALESCE(?, established_year),
          description = COALESCE(?, description)
         WHERE user_id = ?`,
        [
          institution_name, institution_code, institution_type, city,
          state, country, website, accreditation, established_year, description, userId
        ]
      );
    }

    // Fetch updated user & profile payload
    const [userRows] = await pool.query(
      'SELECT id, name, email, role, avatar_url, phone FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const updatedUser = userRows[0];

    let updatedProfile = null;
    if (role === 'STUDENT') {
      const [p] = await pool.query(
        `SELECT sp.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
         FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
         LEFT JOIN institution_profiles ip ON sp.institution_id = ip.id
         WHERE sp.user_id = ? LIMIT 1`,
        [userId]
      );
      updatedProfile = p[0] || null;
    } else if (role === 'ACADEMICIAN') {
      const [p] = await pool.query(
        `SELECT ap.*, u.name, u.email, u.phone, u.avatar_url, ip.institution_name
         FROM academician_profiles ap
         JOIN users u ON ap.user_id = u.id
         LEFT JOIN institution_profiles ip ON ap.institution_id = ip.id
         WHERE ap.user_id = ? LIMIT 1`,
        [userId]
      );
      updatedProfile = p[0] || null;
    } else if (role === 'INDUSTRY') {
      const [p] = await pool.query(
        `SELECT ip.*, u.name, u.email, u.phone, u.avatar_url
         FROM industry_profiles ip
         JOIN users u ON ip.user_id = u.id
         WHERE ip.user_id = ? LIMIT 1`,
        [userId]
      );
      updatedProfile = p[0] || null;
    } else if (role === 'INSTITUTION') {
      const [p] = await pool.query(
        `SELECT inp.*, u.name, u.email, u.phone, u.avatar_url
         FROM institution_profiles inp
         JOIN users u ON inp.user_id = u.id
         WHERE inp.user_id = ? LIMIT 1`,
        [userId]
      );
      updatedProfile = p[0] || null;
    }

    const payload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar_url: updatedUser.avatar_url,
      phone: updatedUser.phone,
      profile: updatedProfile
    };

    return sendSuccess(res, { user: payload }, 'Profile and user details updated successfully');
  } catch (error) {
    console.error('[Auth updateProfile Error]', error);
    return sendError(res, 'Failed to update profile: ' + error.message, 500);
  }
}

/**
 * Change current user password verifying old password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, 'Both current password and new password are required.', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters long.', 400);
    }

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
    if (rows.length === 0) {
      return sendError(res, 'User account not found.', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isMatch) {
      return sendError(res, 'Current password entered is incorrect.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    try {
      await pool.query(
        `INSERT INTO user_activity_logs (user_id, action_type, title, description)
         VALUES (?, 'SECURITY', 'Password Updated', 'User changed their password via settings.')`,
        [userId]
      );
    } catch (e) {
      // Non-blocking log error
    }

    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    console.error('[Auth changePassword Error]', error);
    return sendError(res, 'Failed to update password: ' + error.message, 500);
  }
}

module.exports = {
  register,
  login,
  getMe,
  getLoginHistory,
  updateProfile,
  changePassword
};


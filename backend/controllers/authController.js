const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Register a new user and initialize role-specific profile
 */
async function register(req, res) {
  const { name, email, password, role, institution_id } = req.body;
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
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    const userId = userResult.insertId;

    // Create corresponding profile record
    if (role === 'STUDENT') {
      await connection.query(
        'INSERT INTO student_profiles (user_id, headline, bio, institution_id) VALUES (?, ?, ?, ?)',
        [userId, 'Student Scholar', 'Enthusiastic learner focusing on industry-ready skills.', institution_id || null]
      );
    } else if (role === 'ACADEMICIAN') {
      await connection.query(
        'INSERT INTO academician_profiles (user_id, designation, department) VALUES (?, ?, ?)',
        [userId, 'Assistant Professor', 'Computer Science & Engineering']
      );
    } else if (role === 'INDUSTRY') {
      await connection.query(
        'INSERT INTO industry_profiles (user_id, company_name, description) VALUES (?, ?, ?)',
        [userId, name, 'Technology and Solutions Provider']
      );
    } else if (role === 'INSTITUTION') {
      await connection.query(
        'INSERT INTO institution_profiles (user_id, institution_name, institution_type) VALUES (?, ?, ?)',
        [userId, name, 'COLLEGE']
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

    let profile = null;
    if (role === 'STUDENT') {
      const [p] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
      profile = p[0] || null;
    } else if (role === 'ACADEMICIAN') {
      const [p] = await pool.query('SELECT * FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
      profile = p[0] || null;
    } else if (role === 'INDUSTRY') {
      const [p] = await pool.query('SELECT * FROM industry_profiles WHERE user_id = ? LIMIT 1', [userId]);
      profile = p[0] || null;
    } else if (role === 'INSTITUTION') {
      const [p] = await pool.query('SELECT * FROM institution_profiles WHERE user_id = ? LIMIT 1', [userId]);
      profile = p[0] || null;
    }

    const userPayload = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profile
    };

    return sendSuccess(res, { user: userPayload }, 'User profile fetched successfully');
  } catch (error) {
    console.error('[Auth getMe Error]', error);
    return sendError(res, 'Failed to fetch user session profile', 500);
  }
}

module.exports = {
  register,
  login,
  getMe,
  getLoginHistory
};

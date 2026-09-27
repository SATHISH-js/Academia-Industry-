const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

async function requireApprovedTrainer(userId) {
  const [rows] = await pool.query('SELECT approval_status FROM trainer_profiles WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.approval_status === 'APPROVED';
}

async function listPrograms(req, res) {
  try {
    const [rows] = await pool.query(`SELECT p.id, p.title, p.description, p.competency, p.level,
      p.duration_hours, p.created_at, u.name AS trainer_name,
      EXISTS(SELECT 1 FROM training_enrollments me WHERE me.program_id = p.id AND me.trainee_id = ?) AS is_enrolled,
      (SELECT COUNT(*) FROM training_enrollments e WHERE e.program_id = p.id AND e.status = 'ACTIVE') AS learner_count
      FROM training_programs p JOIN users u ON u.id = p.trainer_id
      JOIN trainer_profiles tp ON tp.user_id = u.id
      WHERE p.status = 'PUBLISHED' AND u.is_active = TRUE AND tp.approval_status = 'APPROVED'
      ORDER BY p.created_at DESC`, [req.user.id]);
    return sendSuccess(res, rows, 'Training programs retrieved');
  } catch (error) {
    console.error('[Training listPrograms]', error);
    return sendError(res, 'Could not load training programs', 500);
  }
}

async function getMyPrograms(req, res) {
  try {
    const [rows] = await pool.query(`SELECT p.*,
      (SELECT COUNT(*) FROM training_enrollments e WHERE e.program_id = p.id AND e.status = 'ACTIVE') AS learner_count
      FROM training_programs p WHERE p.trainer_id = ? ORDER BY p.created_at DESC`, [req.user.id]);
    return sendSuccess(res, rows, 'Your programs retrieved');
  } catch (error) {
    console.error('[Training getMyPrograms]', error);
    return sendError(res, 'Could not load your programs', 500);
  }
}

async function createProgram(req, res) {
  const { title, description, competency, level, duration_hours } = req.body;
  if (!title?.trim() || !description?.trim()) return sendError(res, 'Title and description are required', 400);
  if (!await requireApprovedTrainer(req.user.id)) return sendError(res, 'Trainer account is awaiting administrator approval', 403);
  try {
    const hours = Number(duration_hours) || 1;
    if (hours < 1 || hours > 5000) return sendError(res, 'Duration must be between 1 and 5000 hours', 400);
    const [result] = await pool.query(`INSERT INTO training_programs
      (trainer_id, title, description, competency, level, duration_hours)
      VALUES (?, ?, ?, ?, ?, ?)`, [req.user.id, title.trim(), description.trim(), competency?.trim() || null,
      ['BEGINNER','INTERMEDIATE','ADVANCED'].includes(level) ? level : 'BEGINNER', hours]);
    return sendSuccess(res, { id: result.insertId }, 'Training program created', 201);
  } catch (error) {
    console.error('[Training createProgram]', error);
    return sendError(res, 'Could not create training program', 500);
  }
}

async function createModule(req, res) {
  const { title, description, resource_url, sort_order } = req.body;
  if (!title?.trim()) return sendError(res, 'Module title is required', 400);
  if (!await requireApprovedTrainer(req.user.id)) return sendError(res, 'Trainer account is awaiting administrator approval', 403);
  if (resource_url?.trim()) {
    try {
      const parsed = new URL(resource_url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) return sendError(res, 'Learning resource URL must use HTTPS or HTTP', 400);
    } catch (error) {
      return sendError(res, 'Learning resource URL is invalid', 400);
    }
  }
  try {
    const [program] = await pool.query('SELECT id FROM training_programs WHERE id = ? AND trainer_id = ?', [req.params.id, req.user.id]);
    if (!program.length) return sendError(res, 'Training program not found', 404);
    const [result] = await pool.query(`INSERT INTO training_modules (program_id, title, description, resource_url, sort_order)
      VALUES (?, ?, ?, ?, ?)`, [req.params.id, title.trim(), description?.trim() || null, resource_url?.trim() || null, Number(sort_order) || 0]);
    return sendSuccess(res, { id: result.insertId }, 'Module added', 201);
  } catch (error) {
    console.error('[Training createModule]', error);
    return sendError(res, 'Could not add module', 500);
  }
}

async function getProgramModules(req, res) {
  try {
    const [enrollment] = await pool.query("SELECT id FROM training_enrollments WHERE program_id = ? AND trainee_id = ? AND status IN ('ACTIVE','COMPLETED')", [req.params.id, req.user.id]);
    if (!enrollment.length) return sendError(res, 'Enroll in this program to view its modules', 403);
    const [rows] = await pool.query(`SELECT m.id, m.title, m.description, m.resource_url, m.sort_order,
      (c.module_id IS NOT NULL) AS completed
      FROM training_modules m LEFT JOIN training_module_completions c ON c.module_id = m.id AND c.trainee_id = ?
      WHERE m.program_id = ? ORDER BY m.sort_order, m.id`, [req.user.id, req.params.id]);
    return sendSuccess(res, rows, 'Program modules retrieved');
  } catch (error) {
    console.error('[Training getProgramModules]', error);
    return sendError(res, 'Could not load program modules', 500);
  }
}

async function completeModule(req, res) {
  const completed = req.body.completed;
  if (typeof completed !== 'boolean') return sendError(res, 'completed must be a boolean', 400);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [moduleRows] = await connection.query(`SELECT m.id, m.program_id FROM training_modules m
      JOIN training_enrollments e ON e.program_id = m.program_id
      WHERE m.id = ? AND e.trainee_id = ? AND e.status = 'ACTIVE' LIMIT 1`, [req.params.id, req.user.id]);
    if (!moduleRows.length) {
      await connection.rollback();
      return sendError(res, 'Module or active enrollment not found', 404);
    }
    const module = moduleRows[0];
    if (completed) {
      await connection.query('INSERT IGNORE INTO training_module_completions (module_id, trainee_id) VALUES (?, ?)', [module.id, req.user.id]);
    } else {
      await connection.query('DELETE FROM training_module_completions WHERE module_id = ? AND trainee_id = ?', [module.id, req.user.id]);
    }
    const [[counts]] = await connection.query(`SELECT COUNT(m.id) AS total,
      SUM(c.module_id IS NOT NULL) AS done FROM training_modules m
      LEFT JOIN training_module_completions c ON c.module_id = m.id AND c.trainee_id = ?
      WHERE m.program_id = ?`, [req.user.id, module.program_id]);
    const percent = counts.total ? Math.round((Number(counts.done || 0) / Number(counts.total)) * 100) : 0;
    await connection.query(`UPDATE training_enrollments SET progress_percent = ?,
      status = IF(? = 100, 'COMPLETED', 'ACTIVE'),
      completed_at = IF(? = 100, COALESCE(completed_at, CURRENT_TIMESTAMP), NULL)
      WHERE program_id = ? AND trainee_id = ?`, [percent, percent, percent, module.program_id, req.user.id]);
    await connection.commit();
    return sendSuccess(res, { progress_percent: percent }, 'Module progress saved');
  } catch (error) {
    await connection.rollback();
    console.error('[Training completeModule]', error);
    return sendError(res, 'Could not save module progress', 500);
  } finally {
    connection.release();
  }
}

async function enroll(req, res) {
  try {
    const [program] = await pool.query("SELECT id FROM training_programs WHERE id = ? AND status = 'PUBLISHED'", [req.params.id]);
    if (!program.length) return sendError(res, 'Training program not found', 404);
    await pool.query('INSERT INTO training_enrollments (program_id, trainee_id) VALUES (?, ?)', [req.params.id, req.user.id]);
    return sendSuccess(res, null, 'Enrollment successful', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(res, 'You are already enrolled in this program', 409);
    console.error('[Training enroll]', error);
    return sendError(res, 'Could not enroll in this program', 500);
  }
}

async function getMyEnrollments(req, res) {
  try {
    const [rows] = await pool.query(`SELECT e.id, e.status, e.progress_percent, e.enrolled_at, e.completed_at,
      p.id AS program_id, p.title, p.description, p.competency, p.level, p.duration_hours, u.name AS trainer_name
      FROM training_enrollments e JOIN training_programs p ON p.id = e.program_id
      JOIN users u ON u.id = p.trainer_id WHERE e.trainee_id = ? ORDER BY e.enrolled_at DESC`, [req.user.id]);
    return sendSuccess(res, rows, 'Your learning is retrieved');
  } catch (error) {
    console.error('[Training getMyEnrollments]', error);
    return sendError(res, 'Could not load your enrollments', 500);
  }
}

async function listUsers(req, res) {
  try {
    const [rows] = await pool.query(`SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
      tp.approval_status AS trainer_approval
      FROM users u LEFT JOIN trainer_profiles tp ON tp.user_id = u.id
      WHERE u.role IN ('TRAINEE','TRAINER','ADMIN') ORDER BY u.created_at DESC`);
    return sendSuccess(res, rows, 'Platform users retrieved');
  } catch (error) {
    console.error('[Admin listUsers]', error);
    return sendError(res, 'Could not load platform users', 500);
  }
}

async function setUserActive(req, res) {
  const active = req.body.is_active;
  if (typeof active !== 'boolean') return sendError(res, 'is_active must be a boolean', 400);
  if (Number(req.params.id) === req.user.id && !active) return sendError(res, 'You cannot deactivate your own account', 400);
  try {
    const [result] = await pool.query("UPDATE users SET is_active = ? WHERE id = ? AND role IN ('TRAINEE','TRAINER','ADMIN')", [active, req.params.id]);
    if (!result.affectedRows) return sendError(res, 'Platform user not found', 404);
    return sendSuccess(res, null, 'Account status updated');
  } catch (error) {
    console.error('[Admin setUserActive]', error);
    return sendError(res, 'Could not update account status', 500);
  }
}

async function setTrainerApproval(req, res) {
  const status = req.body.approval_status;
  if (!['APPROVED','REJECTED','PENDING'].includes(status)) return sendError(res, 'Invalid trainer approval status', 400);
  try {
    const [result] = await pool.query('UPDATE trainer_profiles SET approval_status = ? WHERE user_id = ?', [status, req.params.id]);
    if (!result.affectedRows) return sendError(res, 'Trainer profile not found', 404);
    return sendSuccess(res, null, 'Trainer approval updated');
  } catch (error) {
    console.error('[Admin setTrainerApproval]', error);
    return sendError(res, 'Could not update trainer approval', 500);
  }
}

module.exports = { listPrograms, getMyPrograms, createProgram, createModule, getProgramModules, completeModule, enroll, getMyEnrollments, listUsers, setUserActive, setTrainerApproval };

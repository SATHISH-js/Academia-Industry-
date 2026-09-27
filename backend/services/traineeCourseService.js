const { pool } = require('../config/db');

const courseSelect = `SELECT lp.id, lp.title, lp.description,
  COALESCE(NULLIF(lp.subject, ''), s.name, lp.category) AS subject,
  COALESCE(NULLIF(trainer.name, ''), lp.provider) AS trainer, lp.thumbnail_url, lp.publication_status AS status,
  DATE_FORMAT(COALESCE(lp.published_at, lp.created_at), '%Y-%m-%d') AS published_date
  FROM learning_programs lp LEFT JOIN skills s ON s.id = lp.skill_id
  LEFT JOIN users trainer ON trainer.id = lp.trainer_user_id`;

async function getCatalog() {
  const [rows] = await pool.query(`${courseSelect} WHERE lp.publication_status = 'PUBLISHED' ORDER BY COALESCE(lp.published_at, lp.created_at) DESC, lp.id DESC`);
  return rows;
}

async function getCourse(userId, courseId) {
  const [courses] = await pool.query(`${courseSelect} WHERE lp.id = ? AND lp.publication_status = 'PUBLISHED' LIMIT 1`, [courseId]);
  if (!courses.length) return null;
  const [resources] = await pool.query(`SELECT cr.id, cr.title, cr.description, cr.resource_type, cr.resource_url,
      (crc.resource_id IS NOT NULL) AS completed
    FROM course_resources cr LEFT JOIN course_enrollments ce
      ON ce.learning_program_id = cr.learning_program_id AND ce.trainee_user_id = ?
    LEFT JOIN course_resource_completions crc ON crc.enrollment_id = ce.id AND crc.resource_id = cr.id
    WHERE cr.learning_program_id = ? AND cr.is_active = 1 ORDER BY cr.sort_order, cr.id`, [userId, courseId]);
  const [enrollments] = await pool.query(`SELECT ce.id AS enrollment_id, ce.enrollment_status, ce.enrolled_at,
      COALESCE(cp.status, 'NOT_STARTED') AS progress_status,
      COALESCE(cp.progress_percentage, 0) AS progress_percentage,
      cp.last_accessed_resource_id, DATE_FORMAT(cp.last_accessed_at, '%Y-%m-%d %H:%i:%s') AS last_accessed_at
    FROM course_enrollments ce LEFT JOIN course_progress cp ON cp.enrollment_id = ce.id
    WHERE ce.trainee_user_id = ? AND ce.learning_program_id = ? LIMIT 1`, [userId, courseId]);
  return { ...courses[0], resources, enrollment: enrollments[0] || null };
}

async function enroll(userId, courseId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [courses] = await connection.query(`SELECT id FROM learning_programs
      WHERE id = ? AND publication_status = 'PUBLISHED' LIMIT 1 FOR UPDATE`, [courseId]);
    if (!courses.length) {
      await connection.rollback();
      return null;
    }
    await connection.query(`INSERT IGNORE INTO course_enrollments (trainee_user_id, learning_program_id)
      VALUES (?, ?)`, [userId, courseId]);
    const [enrollments] = await connection.query(`SELECT id FROM course_enrollments
      WHERE trainee_user_id = ? AND learning_program_id = ? LIMIT 1`, [userId, courseId]);
    await connection.query('INSERT IGNORE INTO course_progress (enrollment_id) VALUES (?)', [enrollments[0].id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getCourse(userId, courseId);
}

async function getMyCourses(userId) {
  const [rows] = await pool.query(`SELECT lp.id, lp.title, lp.description,
      COALESCE(NULLIF(lp.subject, ''), s.name, lp.category) AS subject,
      COALESCE(NULLIF(trainer.name, ''), lp.provider) AS trainer, lp.thumbnail_url, lp.publication_status AS status,
      DATE_FORMAT(COALESCE(lp.published_at, lp.created_at), '%Y-%m-%d') AS published_date,
      ce.id AS enrollment_id, ce.enrollment_status, ce.enrolled_at,
      COALESCE(cp.status, 'NOT_STARTED') AS progress_status,
      COALESCE(cp.progress_percentage, 0) AS progress_percentage,
      cp.last_accessed_resource_id, DATE_FORMAT(cp.last_accessed_at, '%Y-%m-%d %H:%i:%s') AS last_accessed_at
    FROM course_enrollments ce JOIN learning_programs lp ON lp.id = ce.learning_program_id
    LEFT JOIN skills s ON s.id = lp.skill_id LEFT JOIN users trainer ON trainer.id = lp.trainer_user_id
    LEFT JOIN course_progress cp ON cp.enrollment_id = ce.id
    WHERE ce.trainee_user_id = ? ORDER BY ce.enrolled_at DESC`, [userId]);
  return rows;
}

async function getProgress(userId, courseId) {
  const [rows] = await pool.query(`SELECT ce.id AS enrollment_id, ce.enrollment_status, ce.enrolled_at,
      cp.status, cp.progress_percentage, cp.last_accessed_resource_id,
      DATE_FORMAT(cp.last_accessed_at, '%Y-%m-%d %H:%i:%s') AS last_accessed_at
    FROM course_enrollments ce JOIN course_progress cp ON cp.enrollment_id = ce.id
    WHERE ce.trainee_user_id = ? AND ce.learning_program_id = ? LIMIT 1`, [userId, courseId]);
  return rows[0] || null;
}

async function openResource(userId, courseId, resourceId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(`SELECT ce.id AS enrollment_id, cr.id, cr.title, cr.description,
        cr.resource_type, cr.resource_url
      FROM course_enrollments ce JOIN course_resources cr ON cr.learning_program_id = ce.learning_program_id
      WHERE ce.trainee_user_id = ? AND ce.learning_program_id = ? AND cr.id = ? AND cr.is_active = 1
      LIMIT 1 FOR UPDATE`, [userId, courseId, resourceId]);
    if (!rows.length) {
      await connection.rollback();
      return null;
    }
    await connection.query(`UPDATE course_progress SET status = IF(status = 'COMPLETED', status, 'IN_PROGRESS'),
      last_accessed_resource_id = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE enrollment_id = ?`,
    [resourceId, rows[0].enrollment_id]);
    await connection.commit();
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function completeResource(userId, courseId, resourceId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [enrollments] = await connection.query(`SELECT ce.id AS enrollment_id FROM course_enrollments ce
      JOIN course_resources cr ON cr.learning_program_id = ce.learning_program_id
      WHERE ce.trainee_user_id = ? AND ce.learning_program_id = ? AND cr.id = ? AND cr.is_active = 1
      LIMIT 1 FOR UPDATE`, [userId, courseId, resourceId]);
    if (!enrollments.length) {
      await connection.rollback();
      return null;
    }
    const enrollmentId = enrollments[0].enrollment_id;
    await connection.query(`INSERT IGNORE INTO course_resource_completions (enrollment_id, resource_id)
      VALUES (?, ?)`, [enrollmentId, resourceId]);
    const [totalRows] = await connection.query('SELECT COUNT(*) AS total FROM course_resources WHERE learning_program_id = ? AND is_active = 1', [courseId]);
    const [completedRows] = await connection.query('SELECT COUNT(*) AS completed FROM course_resource_completions WHERE enrollment_id = ?', [enrollmentId]);
    const total = Number(totalRows[0].total);
    const completed = Number(completedRows[0].completed);
    const percentage = total ? Math.min(100, Math.round(completed * 100 / total)) : 0;
    const status = percentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    await connection.query(`UPDATE course_progress SET status = ?, progress_percentage = ?,
      last_accessed_resource_id = ?, last_accessed_at = CURRENT_TIMESTAMP WHERE enrollment_id = ?`,
    [status, percentage, resourceId, enrollmentId]);
    await connection.query('UPDATE course_enrollments SET enrollment_status = ? WHERE id = ?',
      [status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE', enrollmentId]);
    await connection.commit();
    return { status, progress_percentage: percentage, completed_resources: completed, total_resources: total, last_accessed_resource_id: resourceId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { getCatalog, getCourse, enroll, getMyCourses, getProgress, openResource, completeResource };

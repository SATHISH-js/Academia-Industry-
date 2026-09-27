const { pool } = require('../config/db');

function ownerClause(actor, alias = 'lp') {
  return actor.role === 'ADMIN' ? { sql: '', params: [] } : { sql: ` AND ${alias}.trainer_user_id = ?`, params: [actor.id] };
}

async function listCourses(actor) {
  const owner = ownerClause(actor);
  const [rows] = await pool.query(`SELECT lp.id, lp.title, lp.description, lp.subject, lp.thumbnail_url,
    lp.publication_status AS status, DATE_FORMAT(lp.published_at,'%Y-%m-%d %H:%i:%s') AS published_at,
    lp.trainer_user_id, COALESCE(u.name, lp.provider) AS trainer
    FROM learning_programs lp LEFT JOIN users u ON u.id = lp.trainer_user_id
    WHERE 1=1${owner.sql} ORDER BY lp.updated_at DESC, lp.id DESC`, owner.params);
  return rows;
}

async function getCourse(actor, id) {
  const owner = ownerClause(actor);
  const [rows] = await pool.query(`SELECT lp.id, lp.title, lp.description, lp.subject, lp.thumbnail_url,
    lp.publication_status AS status, DATE_FORMAT(lp.published_at,'%Y-%m-%d %H:%i:%s') AS published_at,
    lp.trainer_user_id, COALESCE(u.name, lp.provider) AS trainer
    FROM learning_programs lp LEFT JOIN users u ON u.id = lp.trainer_user_id
    WHERE lp.id = ?${owner.sql} LIMIT 1`, [id, ...owner.params]);
  return rows[0] || null;
}

async function resolveTrainer(actor, requestedId, connection = pool) {
  const trainerId = actor.role === 'ADMIN' ? Number(requestedId) : Number(actor.id);
  if (!Number.isSafeInteger(trainerId) || trainerId <= 0) return null;
  const [rows] = await connection.query(`SELECT id, name FROM users
    WHERE id = ? AND role = 'TRAINER' AND account_status = 'ACTIVE' AND is_active = 1 LIMIT 1`, [trainerId]);
  return rows[0] || null;
}

async function createCourse(actor, data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const trainer = await resolveTrainer(actor, data.trainer_user_id, connection);
    if (!trainer) {
      await connection.rollback();
      return null;
    }
    const [result] = await connection.query(`INSERT INTO learning_programs
      (trainer_user_id, title, provider, category, duration, level, description, subject, thumbnail_url, publication_status, published_at)
      VALUES (?, ?, ?, 'Course', 'Self-paced', 'BEGINNER', ?, ?, ?, 'DRAFT', NULL)`,
    [trainer.id, data.title, trainer.name, data.description || null, data.subject, data.thumbnail_url || null]);
    await connection.query(`INSERT INTO course_resources
      (learning_program_id, title, description, resource_type, sort_order)
      VALUES (?, 'Course introduction', 'Starter resource placeholder. Learning materials can be added in a later trainer workflow.', 'PLACEHOLDER', 1)`,
    [result.insertId]);
    await connection.commit();
    return getCourse(actor, result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateCourse(actor, id, data) {
  const owner = ownerClause(actor);
  const [result] = await pool.query(`UPDATE learning_programs lp SET title = ?, description = ?, subject = ?, thumbnail_url = ?
    WHERE lp.id = ?${owner.sql}`, [data.title, data.description || null, data.subject, data.thumbnail_url || null, id, ...owner.params]);
  if (!result.affectedRows) return null;
  return getCourse(actor, id);
}

async function transitionCourse(actor, id, transition) {
  const owner = ownerClause(actor);
  const transitions = {
    publish: `UPDATE learning_programs lp SET publication_status = 'PUBLISHED', published_at = COALESCE(published_at, CURRENT_TIMESTAMP)
      WHERE lp.id = ? AND lp.publication_status = 'DRAFT'${owner.sql}`,
    unpublish: `UPDATE learning_programs lp SET publication_status = 'DRAFT', published_at = NULL
      WHERE lp.id = ? AND lp.publication_status = 'PUBLISHED'${owner.sql}`,
    archive: `UPDATE learning_programs lp SET publication_status = 'ARCHIVED'
      WHERE lp.id = ? AND lp.publication_status <> 'ARCHIVED'${owner.sql}`
  };
  const [result] = await pool.query(transitions[transition], [id, ...owner.params]);
  if (!result.affectedRows) {
    const current = await getCourse(actor, id);
    if (current && ((transition === 'publish' && current.status === 'PUBLISHED') || (transition === 'unpublish' && current.status === 'DRAFT') || (transition === 'archive' && current.status === 'ARCHIVED'))) return current;
    return null;
  }
  return getCourse(actor, id);
}

module.exports = { listCourses, getCourse, createCourse, updateCourse, transitionCourse };

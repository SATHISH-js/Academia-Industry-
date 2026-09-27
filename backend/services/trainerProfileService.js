const { pool } = require('../config/db');

async function ensureProfile(userId) {
  await pool.query(`INSERT IGNORE INTO academician_profiles
    (user_id, department, designation, qualification, experience_years, specialization)
    VALUES (?, NULL, NULL, NULL, NULL, NULL)`, [userId]);
  const [rows] = await pool.query('SELECT id FROM academician_profiles WHERE user_id = ? LIMIT 1', [userId]);
  if (!rows.length) throw new Error('Could not initialize trainer profile');
  return rows[0].id;
}

async function getProfile(userId) {
  const profileId = await ensureProfile(userId);
  const [[profiles], [experiences], [items]] = await Promise.all([
    pool.query(`SELECT ap.id, u.name, u.email, u.phone, u.avatar_url, ap.qualification,
      ap.experience_years, ap.specialization, ap.expertise, ap.bio
      FROM academician_profiles ap JOIN users u ON u.id = ap.user_id
      WHERE ap.id = ? AND ap.user_id = ? LIMIT 1`, [profileId, userId]),
    pool.query(`SELECT id, organization, designation, DATE_FORMAT(start_date,'%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date,'%Y-%m-%d') AS end_date, description FROM trainer_work_experiences
      WHERE trainer_profile_id = ? ORDER BY start_date DESC, id DESC`, [profileId]),
    pool.query(`SELECT id, item_type, title, issuing_organization,
      DATE_FORMAT(issue_date,'%Y-%m-%d') AS issue_date, credential_reference
      FROM trainer_profile_items WHERE trainer_profile_id = ? ORDER BY item_type, title`, [profileId])
  ]);
  return { ...profiles[0], experiences, items };
}

async function updateProfile(userId, data) {
  const profileId = await ensureProfile(userId);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [field, column] of Object.entries({ name: 'name', phone: 'phone', avatar_url: 'avatar_url' })) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        await connection.query(`UPDATE users SET \`${column}\` = ? WHERE id = ?`, [data[field], userId]);
      }
    }
    for (const [field, column] of Object.entries({ qualification: 'qualification', experience_years: 'experience_years', specialization: 'specialization', expertise: 'expertise', bio: 'bio' })) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        const value = data[field] === '' ? null : data[field];
        await connection.query(`UPDATE academician_profiles SET \`${column}\` = ? WHERE id = ? AND user_id = ?`, [value, profileId, userId]);
      }
    }
    await connection.commit();
    return getProfile(userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function addItem(userId, data) {
  const profileId = await ensureProfile(userId);
  await pool.query(`INSERT INTO trainer_profile_items
    (trainer_profile_id, item_type, title, issuing_organization, issue_date, credential_reference)
    VALUES (?, ?, ?, ?, ?, ?)`, [profileId, data.item_type, data.title,
    data.issuing_organization || null, data.issue_date || null, data.credential_reference || null]);
}

async function removeItem(userId, id) {
  const profileId = await ensureProfile(userId);
  const [result] = await pool.query('DELETE FROM trainer_profile_items WHERE id = ? AND trainer_profile_id = ?', [id, profileId]);
  return result.affectedRows > 0;
}

async function saveExperience(userId, data, id = null) {
  const profileId = await ensureProfile(userId);
  if (id) {
    const [result] = await pool.query(`UPDATE trainer_work_experiences SET organization = ?, designation = ?,
      start_date = ?, end_date = ?, description = ? WHERE id = ? AND trainer_profile_id = ?`,
    [data.organization, data.designation, data.start_date, data.end_date || null, data.description || null, id, profileId]);
    return result.affectedRows > 0;
  }
  await pool.query(`INSERT INTO trainer_work_experiences
    (trainer_profile_id, organization, designation, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)`,
  [profileId, data.organization, data.designation, data.start_date, data.end_date || null, data.description || null]);
  return true;
}

async function removeExperience(userId, id) {
  const profileId = await ensureProfile(userId);
  const [result] = await pool.query('DELETE FROM trainer_work_experiences WHERE id = ? AND trainer_profile_id = ?', [id, profileId]);
  return result.affectedRows > 0;
}

module.exports = { getProfile, updateProfile, addItem, removeItem, saveExperience, removeExperience };

const { pool } = require('../config/db');

async function ensureStudentProfile(userId) {
  // Legacy student_profiles defaults describe a demo student; new trainee records start blank.
  await pool.query(`INSERT IGNORE INTO student_profiles (user_id, department, degree, graduation_year, profile_completed_pct)
    VALUES (?, NULL, NULL, NULL, 0)`, [userId]);
  const [rows] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ? LIMIT 1', [userId]);
  if (!rows.length) throw new Error('Could not initialize trainee profile');
  return rows[0].id;
}

async function getProfile(userId) {
  const studentId = await ensureStudentProfile(userId);
  const [[profileRows], [skills], [experiences], [interests], [certificates]] = await Promise.all([
    pool.query(`SELECT sp.id, u.name, u.email, u.phone, u.avatar_url, sp.bio, sp.degree,
      COALESCE(NULLIF(sp.institution_name, ''), ip.institution_name, NULLIF(sp.ug_college, ''), NULLIF(sp.ug_university, '')) AS institution,
      sp.specialization, sp.graduation_year
      FROM student_profiles sp JOIN users u ON u.id = sp.user_id
      LEFT JOIN institution_profiles ip ON ip.id = sp.institution_id
      WHERE sp.id = ? AND sp.user_id = ? LIMIT 1`, [studentId, userId]),
    pool.query(`SELECT ss.id, s.name, ss.level, ss.score FROM student_skills ss
      JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ? ORDER BY s.name`, [studentId]),
    pool.query(`SELECT id, organization, designation, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date, description FROM trainee_work_experiences
      WHERE student_id = ? ORDER BY start_date DESC, id DESC`, [studentId]),
    pool.query('SELECT id, name FROM trainee_interests WHERE student_id = ? ORDER BY name', [studentId]),
    pool.query(`SELECT id, name AS title, issuing_organization, DATE_FORMAT(issue_date, '%Y-%m-%d') AS issue_date,
      credential_id, certificate_url, verification_status FROM student_certifications
      WHERE student_id = ? ORDER BY issue_date DESC, id DESC`, [studentId])
  ]);
  return { ...profileRows[0], skills, experiences, interests, certificates };
}

async function updateProfile(userId, data) {
  const studentId = await ensureStudentProfile(userId);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userFields = { name: 'name', phone: 'phone', avatar_url: 'avatar_url' };
    const profileFields = {
      bio: 'bio', degree: 'degree', institution: 'institution_name',
      specialization: 'specialization', graduation_year: 'graduation_year'
    };
    for (const [key, column] of Object.entries(userFields)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        await connection.query(`UPDATE users SET \`${column}\` = ? WHERE id = ?`, [data[key], userId]);
      }
    }
    for (const [key, column] of Object.entries(profileFields)) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        await connection.query(`UPDATE student_profiles SET \`${column}\` = ? WHERE id = ? AND user_id = ?`, [data[key], studentId, userId]);
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

async function addSkill(userId, name) {
  const studentId = await ensureStudentProfile(userId);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(`INSERT INTO skill_categories (name, type) VALUES ('PROFILE SKILLS', 'TECHNICAL')
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`);
    const [categoryRows] = await connection.query("SELECT id FROM skill_categories WHERE name = 'PROFILE SKILLS' LIMIT 1");
    await connection.query('INSERT IGNORE INTO skills (category_id, name) VALUES (?, ?)', [categoryRows[0].id, name]);
    const [skillRows] = await connection.query('SELECT id FROM skills WHERE name = ? LIMIT 1', [name]);
    if (!skillRows.length) throw new Error('Could not create skill');
    await connection.query('INSERT IGNORE INTO student_skills (student_id, skill_id) VALUES (?, ?)', [studentId, skillRows[0].id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function removeSkill(userId, skillLinkId) {
  const studentId = await ensureStudentProfile(userId);
  const [result] = await pool.query('DELETE FROM student_skills WHERE id = ? AND student_id = ?', [skillLinkId, studentId]);
  return result.affectedRows > 0;
}

async function addInterest(userId, name) {
  const studentId = await ensureStudentProfile(userId);
  await pool.query('INSERT IGNORE INTO trainee_interests (student_id, name) VALUES (?, ?)', [studentId, name]);
}

async function removeInterest(userId, id) {
  const studentId = await ensureStudentProfile(userId);
  const [result] = await pool.query('DELETE FROM trainee_interests WHERE id = ? AND student_id = ?', [id, studentId]);
  return result.affectedRows > 0;
}

async function saveExperience(userId, data, id = null) {
  const studentId = await ensureStudentProfile(userId);
  if (id) {
    const [result] = await pool.query(`UPDATE trainee_work_experiences SET organization = ?, designation = ?,
      start_date = ?, end_date = ?, description = ? WHERE id = ? AND student_id = ?`,
    [data.organization, data.designation, data.start_date, data.end_date || null, data.description || null, id, studentId]);
    return result.affectedRows > 0;
  }
  await pool.query(`INSERT INTO trainee_work_experiences
    (student_id, organization, designation, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)`,
  [studentId, data.organization, data.designation, data.start_date, data.end_date || null, data.description || null]);
  return true;
}

async function removeExperience(userId, id) {
  const studentId = await ensureStudentProfile(userId);
  const [result] = await pool.query('DELETE FROM trainee_work_experiences WHERE id = ? AND student_id = ?', [id, studentId]);
  return result.affectedRows > 0;
}

async function saveCertificate(userId, data, id = null) {
  const studentId = await ensureStudentProfile(userId);
  if (id) {
    const [result] = await pool.query(`UPDATE student_certifications SET name = ?, issuing_organization = ?,
      issue_date = ?, credential_id = ?, certificate_url = ? WHERE id = ? AND student_id = ?`,
    [data.title, data.issuing_organization, data.issue_date || null, data.credential_id || null, data.certificate_url || null, id, studentId]);
    return result.affectedRows > 0;
  }
  await pool.query(`INSERT INTO student_certifications
    (student_id, name, issuing_organization, issue_date, credential_id, certificate_url)
    VALUES (?, ?, ?, ?, ?, ?)`,
  [studentId, data.title, data.issuing_organization, data.issue_date || null, data.credential_id || null, data.certificate_url || null]);
  return true;
}

async function removeCertificate(userId, id) {
  const studentId = await ensureStudentProfile(userId);
  const [result] = await pool.query('DELETE FROM student_certifications WHERE id = ? AND student_id = ?', [id, studentId]);
  return result.affectedRows > 0;
}

module.exports = {
  getProfile, updateProfile, addSkill, removeSkill, addInterest, removeInterest,
  saveExperience, removeExperience, saveCertificate, removeCertificate
};

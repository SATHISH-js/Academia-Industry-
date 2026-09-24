const { pool } = require('../config/db');

async function fix() {
  try {
    await pool.query("ALTER TABLE industry_student_messages MODIFY COLUMN message_type VARCHAR(50) NOT NULL DEFAULT 'ROLE_INQUIRY'");
    await pool.query("ALTER TABLE industry_student_messages MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'SENT'");
    await pool.query("UPDATE industry_student_messages SET message_type = 'REPLY', status = 'RECEIVED' WHERE id = 5");
    await pool.query("UPDATE industry_student_messages SET message_type = 'APPLICATION_INQUIRY', status = 'RECEIVED' WHERE id = 6");
    console.log('Successfully adjusted columns to VARCHAR(50) and updated seed messages');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();

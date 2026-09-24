const { pool } = require('../config/db');

async function migrate() {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM industry_student_messages');
    const colNames = cols.map(c => c.Field);
    console.log('Existing columns in industry_student_messages:', colNames);

    if (!colNames.includes('sender_role')) {
      await pool.query("ALTER TABLE industry_student_messages ADD COLUMN sender_role VARCHAR(20) NOT NULL DEFAULT 'INDUSTRY'");
      console.log('Added sender_role column');
    }
    if (!colNames.includes('reply_to_id')) {
      await pool.query('ALTER TABLE industry_student_messages ADD COLUMN reply_to_id INT NULL');
      console.log('Added reply_to_id column');
    }
    if (!colNames.includes('is_read')) {
      await pool.query('ALTER TABLE industry_student_messages ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE');
      console.log('Added is_read column');
    }

    // Check if there are any received messages from student to industry
    const [receivedRows] = await pool.query("SELECT COUNT(*) as cnt FROM industry_student_messages WHERE sender_role = 'STUDENT'");
    if (receivedRows[0].cnt === 0) {
      // Seed a couple of realistic candidate responses so HR sees both sent and received in single pane immediately
      const [students] = await pool.query('SELECT sp.id, sp.user_id, u.name FROM student_profiles sp JOIN users u ON sp.user_id = u.id LIMIT 2');
      const [industries] = await pool.query('SELECT id, company_name FROM industry_profiles LIMIT 1');

      if (students.length > 0 && industries.length > 0) {
        const indId = industries[0].id;
        const stu1 = students[0];
        await pool.query(
          `INSERT INTO industry_student_messages 
           (industry_id, student_id, opportunity_type, subject, message, message_type, status, sender_role, is_read, created_at)
           VALUES (?, ?, 'INTERNSHIP', ?, ?, 'REPLY', 'RECEIVED', 'STUDENT', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR))`,
          [
            indId,
            stu1.id,
            `Re: Interview Availability - ${stu1.name}`,
            `Thank you for reaching out! I would love to interview for the Full Stack Engineer Intern position. Wednesday afternoon between 2:00 PM and 5:00 PM works perfectly for me. Looking forward to speaking with the engineering team!`
          ]
        );

        if (students.length > 1) {
          const stu2 = students[1];
          await pool.query(
            `INSERT INTO industry_student_messages 
             (industry_id, student_id, opportunity_type, subject, message, message_type, status, sender_role, is_read, created_at)
             VALUES (?, ?, 'JOB', ?, ?, 'APPLICATION_INQUIRY', 'RECEIVED', 'STUDENT', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY))`,
            [
              indId,
              stu2.id,
              `Application Inquiry: Cloud Engineering Role`,
              `Hello Hiring Team, I recently reviewed the posted Cloud Trainee opening and submitted my portfolio. My verified assessments in SQL, Docker, and Python match your required benchmarks. Could you confirm if summer batch students are eligible for this cycle? Thank you!`
            ]
          );
        }
        console.log('Seeded sample student replies successfully');
      }
    }

    console.log('Outreach migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();

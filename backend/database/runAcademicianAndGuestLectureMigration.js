const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/db');

async function migrate() {
  console.log('Starting migration for Academician, Guest Lectures, and Application Messaging...');

  // 1. Add guest lecture fields to academician_profiles
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM academician_profiles LIKE 'is_open_guest_lecture'");
    if (cols.length === 0) {
      await pool.query(`
        ALTER TABLE academician_profiles
        ADD COLUMN is_open_guest_lecture TINYINT(1) DEFAULT 0,
        ADD COLUMN guest_lecture_topics TEXT DEFAULT NULL,
        ADD COLUMN guest_lecture_mode VARCHAR(50) DEFAULT 'VIRTUAL',
        ADD COLUMN guest_lecture_bio TEXT DEFAULT NULL,
        ADD COLUMN guest_lecture_experience VARCHAR(100) DEFAULT NULL
      `);
      console.log('✔ Added guest lecture columns to academician_profiles');
    } else {
      console.log('✔ Guest lecture columns already exist in academician_profiles');
    }
  } catch (err) {
    console.error('Error altering academician_profiles:', err.message);
  }

  // 2. Create institution_directives table
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institution_directives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institution_id INT NOT NULL,
        target_type ENUM('ALL_DEPARTMENTS', 'SPECIFIC_DEPARTMENT', 'ALL_FACULTY', 'ALL_STUDENTS') DEFAULT 'SPECIFIC_DEPARTMENT',
        target_department VARCHAR(150) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        directive_code VARCHAR(50) DEFAULT NULL,
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
        category ENUM('ACADEMIC', 'EXAMINATION', 'SYLLABUS', 'ATTENDANCE', 'RESEARCH', 'ADMINISTRATIVE', 'PLACEMENT') DEFAULT 'ACADEMIC',
        description TEXT NOT NULL,
        action_required BOOLEAN DEFAULT FALSE,
        deadline DATE DEFAULT NULL,
        issued_by VARCHAR(150) DEFAULT 'Office of Academic Dean / Principal',
        status ENUM('ACTIVE', 'ACTIONED', 'ARCHIVED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inst_dept (institution_id, target_department),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB;
    `);
    console.log('✔ institution_directives table ready');
  } catch (err) {
    console.error('Error creating institution_directives:', err.message);
  }

  // 3. Create academician_student_messages table
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academician_student_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        academician_id INT NOT NULL,
        academician_user_id INT NOT NULL,
        student_id INT NOT NULL,
        student_user_id INT NOT NULL,
        sender_role ENUM('ACADEMICIAN', 'STUDENT') NOT NULL,
        subject VARCHAR(255) DEFAULT NULL,
        message TEXT NOT NULL,
        message_type ENUM('GUIDANCE', 'FEEDBACK', 'ROADMAP_ADVICE', 'ACADEMIC_WARNING', 'GENERAL') DEFAULT 'GUIDANCE',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_acad_stu (academician_id, student_id),
        INDEX idx_stu_user (student_user_id),
        INDEX idx_acad_user (academician_user_id)
      ) ENGINE=InnoDB;
    `);
    console.log('✔ academician_student_messages table ready');
  } catch (err) {
    console.error('Error creating academician_student_messages:', err.message);
  }

  // 4. Create faculty_guest_lectures table
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty_guest_lectures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_academician_id INT NOT NULL,
        requester_institution_id INT NOT NULL,
        speaker_academician_id INT NOT NULL,
        speaker_institution_id INT NOT NULL,
        request_type ENUM('INVITATION', 'PROPOSAL') DEFAULT 'INVITATION',
        topic VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        target_audience VARCHAR(150) DEFAULT 'UG Students',
        delivery_mode ENUM('VIRTUAL', 'IN_PERSON', 'HYBRID') DEFAULT 'VIRTUAL',
        proposed_date DATETIME DEFAULT NULL,
        meeting_link VARCHAR(255) DEFAULT NULL,
        venue VARCHAR(255) DEFAULT NULL,
        status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        response_notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_speaker (speaker_academician_id),
        INDEX idx_requester (requester_academician_id)
      ) ENGINE=InnoDB;
    `);
    console.log('✔ faculty_guest_lectures table ready');
  } catch (err) {
    console.error('Error creating faculty_guest_lectures:', err.message);
  }

  // 5. Create application_messages table
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS application_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        sender_user_id INT NOT NULL,
        sender_role ENUM('STUDENT', 'INDUSTRY', 'ACADEMICIAN') NOT NULL,
        sender_name VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('COVER_NOTE', 'STATUS_UPDATE', 'MESSAGE', 'INTERVIEW_INVITE', 'OFFER') DEFAULT 'MESSAGE',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_app_id (application_id),
        INDEX idx_sender (sender_user_id)
      ) ENGINE=InnoDB;
    `);
    console.log('✔ application_messages table ready');

    // Backfill application messages from existing applications (cover_note & feedback)
    const [existingApps] = await pool.query(`
      SELECT a.id, a.applicant_id, a.applicant_role, a.cover_note, a.feedback, a.created_at, a.updated_at,
             u.name as applicant_name
      FROM applications a
      JOIN users u ON a.applicant_id = u.id
    `);

    for (const app of existingApps) {
      if (app.cover_note && app.cover_note.trim().length > 0) {
        const [check] = await pool.query('SELECT id FROM application_messages WHERE application_id = ? AND message_type = "COVER_NOTE" LIMIT 1', [app.id]);
        if (check.length === 0) {
          await pool.query(`
            INSERT INTO application_messages (application_id, sender_user_id, sender_role, sender_name, message, message_type, created_at)
            VALUES (?, ?, ?, ?, ?, 'COVER_NOTE', ?)
          `, [app.id, app.applicant_id, app.applicant_role, app.applicant_name, app.cover_note, app.created_at]);
        }
      }

      if (app.feedback && app.feedback.trim().length > 0) {
        const [check] = await pool.query('SELECT id FROM application_messages WHERE application_id = ? AND message_type = "STATUS_UPDATE" LIMIT 1', [app.id]);
        if (check.length === 0) {
          await pool.query(`
            INSERT INTO application_messages (application_id, sender_user_id, sender_role, sender_name, message, message_type, created_at)
            VALUES (?, 3, 'INDUSTRY', 'Hiring Team', ?, 'STATUS_UPDATE', ?)
          `, [app.id, app.feedback, app.updated_at]);
        }
      }
    }
    console.log('✔ Backfilled existing application cover notes & feedback into application_messages');
  } catch (err) {
    console.error('Error creating application_messages:', err.message);
  }

  // 6. Seed Sample Directives from Institution
  try {
    const [existingDirectives] = await pool.query('SELECT COUNT(*) as count FROM institution_directives');
    if (existingDirectives[0].count === 0) {
      await pool.query(`
        INSERT INTO institution_directives 
        (institution_id, target_type, target_department, title, directive_code, priority, category, description, action_required, deadline, issued_by, status)
        VALUES
        (1, 'SPECIFIC_DEPARTMENT', 'Computer Science & Engineering', 'Mandatory AI & Cloud Capstone Mentorship Allocation', 'DIR-CSE-2026-01', 'HIGH', 'ACADEMIC', 'All faculty advisors must review and approve 8th-semester industry capstone projects by end of month. Ensure students have connected with enterprise mentors.', 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Office of Academic Dean', 'ACTIVE'),
        (1, 'SPECIFIC_DEPARTMENT', 'Computer Science & Engineering', 'Remedial Lab Sessions for Active Backlogs & Attendance Shortage', 'DIR-CSE-2026-02', 'URGENT', 'ATTENDANCE', 'Department faculty must conduct weekly evening tutorial and hands-on lab sessions for students with attendance below 75% or active coding backlogs.', 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Head of Department (CSE)', 'ACTIVE'),
        (1, 'ALL_DEPARTMENTS', NULL, 'NAAC/NBA Accreditation Metric Submission & Verified Skills Audit', 'DIR-GEN-2026-09', 'MEDIUM', 'ADMINISTRATIVE', 'Submit comprehensive course outcome attainments and student skill badge verification reports for the ongoing semester.', 1, DATE_ADD(CURDATE(), INTERVAL 21 DAY), 'Principal / Registrar', 'ACTIVE'),
        (1, 'SPECIFIC_DEPARTMENT', 'Information Technology', 'Inter-Collegiate Hackathon & Coding Bootcamp Coordination', 'DIR-IT-2026-04', 'MEDIUM', 'ACADEMIC', 'Coordinate the upcoming national hackathon preliminary round. Nominate top 15 student teams based on skill gap scores.', 0, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Director of Student Affairs', 'ACTIVE'),
        (1, 'ALL_DEPARTMENTS', NULL, 'Faculty Guest Lecture Exchange Program Guidelines 2026', 'DIR-EXC-2026-12', 'LOW', 'RESEARCH', 'Faculty members are encouraged to opt into the Inter-College Guest Lecture network to foster cross-institutional knowledge transfer and collaborative research grants.', 0, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'Dean of Research & Outreach', 'ACTIVE')
      `);
      console.log('✔ Seeded sample institutional directives');
    }
  } catch (err) {
    console.error('Error seeding directives:', err.message);
  }

  // 7. Seed Sample Inter-College Faculty for Guest Lecture Exchange
  try {
    // Update existing academician #1 (Dr. Aris Thorne)
    await pool.query(`
      UPDATE academician_profiles SET
        is_open_guest_lecture = 1,
        guest_lecture_topics = 'Microservices Architecture with Docker & K8s, Distributed Database Consensus Protocols, Enterprise API Security',
        guest_lecture_mode = 'HYBRID',
        guest_lecture_bio = 'Associate Professor with 12+ years teaching and consulting on large-scale distributed cloud systems, container orchestration, and fault-tolerant software engineering.',
        guest_lecture_experience = '12+ Years'
      WHERE id = 1
    `);

    // Ensure we have guest lecture staff in other colleges (e.g. IIT Madras, DTU, Anna University)
    // Check if we already have professors in other institutions
    const [otherColleges] = await pool.query('SELECT ap.id FROM academician_profiles ap WHERE ap.institution_id != 1');
    if (otherColleges.length === 0) {
      // Let's create two guest professors in IIT Delhi (id 4) and IIT Madras (id 11) or Anna University (id 7)
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);

      // Prof. Vikram Raman (IIT Madras, inst 11)
      const [u1] = await pool.query(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES ('Prof. Vikram Raman', 'prof.vikram.raman@iitm.ac.in', ?, 'ACADEMICIAN', '+91 98401 23456')
      `, [hash]);

      await pool.query(`
        INSERT INTO academician_profiles 
        (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization, research_interests, publications_count, is_open_guest_lecture, guest_lecture_topics, guest_lecture_mode, guest_lecture_bio, city, state)
        VALUES
        (?, 11, 'IITM-FAC-201', 'Computer Science & Engineering', 'Professor & Chair', 'Ph.D. Computer Science (Stanford)', 18, 'Artificial Intelligence & Neural Architectures', 'Generative AI, Large Language Models, Optimization Algorithms', 35, 1, 'Deep Learning Transformers & Attention Mechanisms, LLM Fine-Tuning & RAG Pipelines, Multi-Agent AI Systems', 'HYBRID', 'Senior Professor at IIT Madras. Delivered keynotes at IEEE ICASSP and ACM SIGKDD. Passionate about empowering engineering undergraduates with state-of-the-art ML engineering foundations.', 'Chennai', 'Tamil Nadu')
      `, [u1.insertId]);

      // Dr. Shweta Sengupta (DTU, inst 5)
      const [u2] = await pool.query(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES ('Dr. Shweta Sengupta', 'shweta.sengupta@dtu.ac.in', ?, 'ACADEMICIAN', '+91 98112 34567')
      `, [hash]);

      await pool.query(`
        INSERT INTO academician_profiles 
        (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization, research_interests, publications_count, is_open_guest_lecture, guest_lecture_topics, guest_lecture_mode, guest_lecture_bio, city, state)
        VALUES
        (?, 5, 'DTU-FAC-088', 'Information Technology', 'Associate Professor', 'Ph.D. Cyber Security (IIT Delhi)', 10, 'Cyber Security & Cryptography', 'Zero Trust Architecture, Network Security, Blockchain Protocols', 19, 1, 'Zero-Trust Cloud Security Architecture, Modern Web Application Vulnerabilities (OWASP Top 10), Applied Cryptography in Fintech', 'VIRTUAL', 'Associate Professor at DTU with consulting background in national cybersecurity vulnerability testing and financial cloud security audits.', 'New Delhi', 'Delhi')
      `, [u2.insertId]);

      // Dr. Anand Deshmukh (COEP Pune, inst 17)
      const [u3] = await pool.query(`
        INSERT INTO users (name, email, password_hash, role, phone)
        VALUES ('Dr. Anand Deshmukh', 'anand.deshmukh@coep.ac.in', ?, 'ACADEMICIAN', '+91 98230 45678')
      `, [hash]);

      await pool.query(`
        INSERT INTO academician_profiles 
        (user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization, research_interests, publications_count, is_open_guest_lecture, guest_lecture_topics, guest_lecture_mode, guest_lecture_bio, city, state)
        VALUES
        (?, 17, 'COEP-FAC-114', 'Computer Science & Engineering', 'Professor', 'Ph.D. High Performance Computing (IISc)', 15, 'Cloud Computing & High Performance Systems', 'Distributed Systems, Parallel Computing, Edge Computing', 28, 1, 'High-Performance Distributed Computing, Cloud-Native Architectures with Kubernetes, Real-time Stream Analytics', 'VIRTUAL', 'Renowned speaker at international HPC conferences and active researcher in parallel computing frameworks.', 'Pune', 'Maharashtra')
      `, [u3.insertId]);

      console.log('✔ Created guest lecture faculty profiles across IIT Madras, DTU, and COEP');
    }

    // Seed sample guest lecture invitations / proposals
    const [glCount] = await pool.query('SELECT COUNT(*) as count FROM faculty_guest_lectures');
    if (glCount[0].count === 0) {
      // Find speaker id for Prof Vikram Raman
      const [vikram] = await pool.query("SELECT id, institution_id FROM academician_profiles WHERE employee_id = 'IITM-FAC-201' LIMIT 1");
      const [shweta] = await pool.query("SELECT id, institution_id FROM academician_profiles WHERE employee_id = 'DTU-FAC-088' LIMIT 1");
      const speakerId1 = vikram.length > 0 ? vikram[0].id : 2;
      const speakerInst1 = vikram.length > 0 ? vikram[0].institution_id : 11;
      const speakerId2 = shweta.length > 0 ? shweta[0].id : 3;
      const speakerInst2 = shweta.length > 0 ? shweta[0].institution_id : 5;

      await pool.query(`
        INSERT INTO faculty_guest_lectures
        (requester_academician_id, requester_institution_id, speaker_academician_id, speaker_institution_id, request_type, topic, description, target_audience, delivery_mode, proposed_date, status, meeting_link)
        VALUES
        (1, 1, ?, ?, 'INVITATION', 'Deep Learning Transformers & Attention Mechanisms in Modern GenAI', 'Invitation to deliver a 90-minute technical masterclass for pre-final and final year CSE engineering students at Apex Institute of Technology.', '3rd & 4th Year B.Tech CSE', 'VIRTUAL', DATE_ADD(NOW(), INTERVAL 10 DAY), 'ACCEPTED', 'https://meet.google.com/xyz-abcd-uvw'),
        (?, ?, 1, 1, 'INVITATION', 'Microservices Architecture & Real-world Container Orchestration', 'We would be honored if Dr. Aris Thorne could deliver a guest lecture for our M.Tech and B.Tech IT students.', 'B.Tech IT & M.Tech Software Engineering', 'HYBRID', DATE_ADD(NOW(), INTERVAL 18 DAY), 'PENDING', NULL)
      `, [speakerId1, speakerInst1, speakerId2, speakerInst2]);
      console.log('✔ Seeded sample faculty guest lecture requests');
    }
  } catch (err) {
    console.error('Error seeding guest lectures:', err.message);
  }

  // 8. Seed sample staff-student guidance messages
  try {
    const [msgCount] = await pool.query('SELECT COUNT(*) as count FROM academician_student_messages');
    if (msgCount[0].count === 0) {
      // Academician #1 (Dr. Aris Thorne, user 2) to Student #2 (Priya Sundaram, user 5, student_id 2)
      await pool.query(`
        INSERT INTO academician_student_messages
        (academician_id, academician_user_id, student_id, student_user_id, sender_role, subject, message, message_type, is_read, created_at)
        VALUES
        (1, 2, 2, 5, 'ACADEMICIAN', 'Capstone Architecture Review Feedback', 'Dear Priya, I reviewed your microservices capstone milestone. Excellent progress on Docker containerization. Please ensure you implement the JWT refresh token rotation before the upcoming department evaluation.', 'GUIDANCE', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
        (1, 2, 2, 5, 'STUDENT', 'Re: Capstone Architecture Review Feedback', 'Thank you Professor Thorne! I have added the token blacklist and refresh rotation in the auth service branch. I will demonstrate this during Monday lab hours.', 'FEEDBACK', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (1, 2, 1, 1, 'ACADEMICIAN', 'Attendance Alert & Remedial Session', 'Dear Aarav, your attendance in Distributed Systems lab is currently at 72%, which is below the 75% prerequisite threshold. Please attend the remedial clinic this Thursday at 4 PM.', 'ACADEMIC_WARNING', 0, DATE_SUB(NOW(), INTERVAL 5 HOUR))
      `);
      console.log('✔ Seeded sample staff-student guidance messages');
    }
  } catch (err) {
    console.error('Error seeding staff-student messages:', err.message);
  }

  console.log('✔ Migration and seeding completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

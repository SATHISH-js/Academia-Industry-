-- ==========================================================
-- Migration: Industry Portal Features (Messages & Institution Placements)
-- ==========================================================

USE academia_industry_portal;

-- 1. Direct In-App Outreach Messages from Industry to Students
CREATE TABLE IF NOT EXISTS industry_student_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    student_id INT NOT NULL,
    opportunity_type ENUM('INTERNSHIP', 'JOB', 'GENERAL') DEFAULT 'GENERAL',
    opportunity_id INT DEFAULT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('INTERVIEW_INVITE', 'ROLE_INQUIRY', 'OFFER', 'GENERAL') DEFAULT 'ROLE_INQUIRY',
    status ENUM('SENT', 'READ', 'REPLIED') DEFAULT 'SENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ism_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ism_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_ism_ind (industry_id),
    INDEX idx_ism_stu (student_id)
) ENGINE=InnoDB;

-- 2. Institution Placement Connection Requests & Drives
CREATE TABLE IF NOT EXISTS institution_placement_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    institution_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    target_batch VARCHAR(60) DEFAULT '2025 - 2026',
    target_departments VARCHAR(255) DEFAULT 'Computer Science, IT, Electronics',
    expected_hires INT DEFAULT 10,
    salary_package VARCHAR(100) DEFAULT '8 - 14 LPA',
    proposed_date DATE DEFAULT NULL,
    proposal_details TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    response_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ipr_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ipr_institution FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE CASCADE,
    INDEX idx_ipr_ind (industry_id),
    INDEX idx_ipr_inst (institution_id)
) ENGINE=InnoDB;

-- Seed initial sample data if empty
INSERT INTO industry_student_messages (industry_id, student_id, opportunity_type, opportunity_id, subject, message, message_type, status)
SELECT 1, 1, 'INTERNSHIP', 1, 'Interview Invitation: Full Stack Software Engineer Intern', 
'Hi Aditya, your assessed skill profile in React, Python, and SQL matches our engineering criteria at 94%. We would love to invite you for a virtual technical conversation this Wednesday.', 
'INTERVIEW_INVITE', 'SENT'
WHERE NOT EXISTS (SELECT 1 FROM industry_student_messages WHERE id = 1);

INSERT INTO institution_placement_requests (industry_id, institution_id, title, target_batch, target_departments, expected_hires, salary_package, proposed_date, proposal_details, status)
SELECT 1, 1, 'Campus Placement Drive 2026 - Software Engineers & Cloud Interns', '2025 - 2026', 'Computer Science, Information Technology, Data Science', 15, '10 - 16 LPA', '2026-10-15', 
'TechCorp Global is organizing on-campus technical assessments and fast-track interviews for 2026 graduating batch students across B.Tech CSE and IT.', 'APPROVED'
WHERE NOT EXISTS (SELECT 1 FROM institution_placement_requests WHERE id = 1);

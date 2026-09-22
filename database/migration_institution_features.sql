-- ==========================================================
-- Migration: Institution Outreach Messages & Extended Institutional Data
-- ==========================================================

USE academia_industry_portal;

-- 1. Create table for institution outreach messages to students and academicians
CREATE TABLE IF NOT EXISTS institution_outreach_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    recipient_type ENUM('STUDENT', 'ACADEMICIAN') NOT NULL,
    recipient_user_id INT NOT NULL,
    student_id INT DEFAULT NULL,
    academician_id INT DEFAULT NULL,
    contact_type VARCHAR(60) DEFAULT 'GENERAL',
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('SENT', 'READ', 'REPLIED') DEFAULT 'SENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_iom_inst (institution_id),
    INDEX idx_iom_recipient (recipient_user_id),
    INDEX idx_iom_type (recipient_type),
    CONSTRAINT fk_iom_inst FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_iom_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Ensure all existing student profiles have valid register / enrollment numbers and departments
UPDATE student_profiles SET enrollment_number = '2023-CSE-015', department = 'Computer Science & Engineering' WHERE id = 4 AND (enrollment_number IS NULL OR enrollment_number = '');
UPDATE student_profiles SET enrollment_number = '2023-IT-042', department = 'Information Technology' WHERE id = 5 AND (enrollment_number IS NULL OR enrollment_number = '');
UPDATE student_profiles SET enrollment_number = '2023-AIDS-088', department = 'Data Science / AI' WHERE id = 6 AND (enrollment_number IS NULL OR enrollment_number = '');
UPDATE student_profiles SET enrollment_number = '2023-ECE-102', department = 'Electronics & Communication' WHERE id = 7 AND (enrollment_number IS NULL OR enrollment_number = '');

-- 3. Ensure academician profiles have employee / register numbers
UPDATE academician_profiles SET employee_id = 'FAC-CS-205', institution_id = 1 WHERE id = 2 AND (employee_id IS NULL OR employee_id = '');

-- 4. Seed initial activity logs for institution monitoring if empty
INSERT INTO user_activity_logs (user_id, action_type, title, description)
SELECT u.id, 'ASSESSMENT', 'Completed Advanced DSA Assessment', 'Scored 88% in Algorithmic Problem Solving & Trees'
FROM users u
WHERE u.role = 'STUDENT' AND NOT EXISTS (
  SELECT 1 FROM user_activity_logs WHERE user_id = u.id AND title LIKE '%DSA Assessment%'
)
LIMIT 3;

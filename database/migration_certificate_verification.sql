-- ==========================================================
-- Migration: AI Certificate Verification, Skill Badges & Community Credential Feed
-- Combining Hack 1 Features into Academia-Industry Portal
-- ==========================================================

USE academia_industry_portal;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Community Feed Posts Table
CREATE TABLE IF NOT EXISTS community_feed_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id VARCHAR(100) DEFAULT NULL,
    certificate_id INT DEFAULT NULL,
    certificate_url VARCHAR(255) NOT NULL,
    caption TEXT DEFAULT NULL,
    correct_count INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 20,
    score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    badge_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feed_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_feed_created (created_at DESC),
    INDEX idx_feed_badge (badge_awarded)
) ENGINE=InnoDB;

-- 2. AI Certificate Quiz Sessions (Persistent Storage)
CREATE TABLE IF NOT EXISTS ai_certificate_quiz_sessions (
    quiz_id VARCHAR(100) PRIMARY KEY,
    student_id INT NOT NULL,
    course_title VARCHAR(200) DEFAULT 'Certificate Course',
    certificate_filename VARCHAR(255) NOT NULL,
    certificate_url VARCHAR(255) NOT NULL,
    questions JSON NOT NULL,
    duration_seconds INT DEFAULT 600,
    submitted BOOLEAN DEFAULT FALSE,
    score_percentage DECIMAL(5,2) DEFAULT NULL,
    correct_count INT DEFAULT 0,
    badge_awarded BOOLEAN DEFAULT FALSE,
    result_data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_quiz_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Seed sample initial community feed posts if table is empty
INSERT INTO community_feed_posts (student_id, certificate_url, caption, correct_count, total_questions, score_percentage, badge_awarded)
SELECT 
    sp.id,
    '/uploads/certificates/sample_ml_cert.png',
    'Earned my Verified Skill Badge in Advanced Machine Learning & Deep Neural Networks! Validated through 20 AI-generated aptitude questions.',
    19,
    20,
    95.00,
    TRUE
FROM student_profiles sp
WHERE NOT EXISTS (SELECT 1 FROM community_feed_posts WHERE certificate_url = '/uploads/certificates/sample_ml_cert.png')
LIMIT 1;

INSERT INTO community_feed_posts (student_id, certificate_url, caption, correct_count, total_questions, score_percentage, badge_awarded)
SELECT 
    sp.id,
    '/uploads/certificates/sample_react_cert.png',
    'Completed Full-Stack Modern Web Architecture certification. Verified my proficiency in React 18, State Management, and Next.js SSR.',
    18,
    20,
    90.00,
    TRUE
FROM student_profiles sp
WHERE NOT EXISTS (SELECT 1 FROM community_feed_posts WHERE certificate_url = '/uploads/certificates/sample_react_cert.png')
LIMIT 1;

SET FOREIGN_KEY_CHECKS = 1;

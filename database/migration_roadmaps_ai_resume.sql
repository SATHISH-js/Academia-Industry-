-- ==========================================================
-- Migration: Career Roadmaps, AI Mock Interviews, Activity & Educational Profiles
-- ==========================================================

USE academia_industry_portal;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend student_profiles with Detailed Educational Qualifications
ALTER TABLE student_profiles 
  ADD COLUMN IF NOT EXISTS tenth_board VARCHAR(100) DEFAULT 'CBSE',
  ADD COLUMN IF NOT EXISTS tenth_school VARCHAR(200) DEFAULT 'Delhi Public School',
  ADD COLUMN IF NOT EXISTS tenth_year INT DEFAULT 2020,
  ADD COLUMN IF NOT EXISTS tenth_percentage DECIMAL(5,2) DEFAULT 92.50,
  ADD COLUMN IF NOT EXISTS twelfth_board VARCHAR(100) DEFAULT 'CBSE (Science)',
  ADD COLUMN IF NOT EXISTS twelfth_college VARCHAR(200) DEFAULT 'National Junior College',
  ADD COLUMN IF NOT EXISTS twelfth_year INT DEFAULT 2022,
  ADD COLUMN IF NOT EXISTS twelfth_percentage DECIMAL(5,2) DEFAULT 94.20,
  ADD COLUMN IF NOT EXISTS ug_university VARCHAR(200) DEFAULT 'Apex Technical University',
  ADD COLUMN IF NOT EXISTS ug_college VARCHAR(200) DEFAULT 'Apex Institute of Technology',
  ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL;

-- 2. Roadmap Paths (Career Paths & Company-Specific Tracks)
CREATE TABLE IF NOT EXISTS roadmap_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('CAREER_PATH', 'COMPANY_TRACK') NOT NULL,
    title VARCHAR(180) NOT NULL,
    company_name VARCHAR(150) DEFAULT NULL,
    target_role VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(60) DEFAULT 'Compass',
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
    estimated_weeks INT DEFAULT 12,
    target_skills JSON DEFAULT NULL, -- e.g. [{"skill_id": 1, "min_score": 85}, ...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Roadmap Milestones & Tasks
CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    step_order INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rm_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmap_paths(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    resource_url VARCHAR(255) DEFAULT NULL,
    skill_id INT DEFAULT NULL,
    estimated_hours INT DEFAULT 5,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_milestone FOREIGN KEY (milestone_id) REFERENCES roadmap_milestones(id) ON DELETE CASCADE,
    CONSTRAINT fk_rt_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Student Roadmap Task Progress
CREATE TABLE IF NOT EXISTS student_roadmap_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    task_id INT NOT NULL,
    roadmap_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_srt_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_srt_task FOREIGN KEY (task_id) REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_srt_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmap_paths(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_task (student_id, task_id)
) ENGINE=InnoDB;

-- 5. Mock Interviews (AI Assessment & Voice/Text Analysis)
CREATE TABLE IF NOT EXISTS mock_interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    role_title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) DEFAULT 'General Industry',
    overall_score INT NOT NULL,
    confidence_score INT NOT NULL,
    technical_score INT NOT NULL,
    communication_score INT NOT NULL,
    words_analyzed INT DEFAULT 0,
    filler_words_count INT DEFAULT 0,
    feedback_summary TEXT NOT NULL,
    transcript JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mi_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('ASSESSMENT', 'APPLICATION', 'ROADMAP_TASK', 'MOCK_INTERVIEW', 'RESUME_EXPORT', 'PROFILE_UPDATE') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ual_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ual_user_date (user_id, created_at)
) ENGINE=InnoDB;

-- 7. Login Audit & Security History
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    email VARCHAR(160) NOT NULL,
    ip_address VARCHAR(60) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) DEFAULT NULL,
    status ENUM('SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lh_user (user_id, created_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

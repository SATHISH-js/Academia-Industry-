-- ==========================================================
-- Academia–Industry Collaboration Portal - MySQL Database Schema
-- Compatible with MySQL 8.0+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS academia_industry_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE academia_industry_portal;

-- Disable foreign key checks during initialization
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Core Users Table (Single Authentication Table)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ACADEMICIAN', 'INDUSTRY', 'INSTITUTION') NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(25) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. Institution Profiles
-- ----------------------------------------------------------
DROP TABLE IF EXISTS institution_profiles;
CREATE TABLE institution_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    institution_name VARCHAR(200) NOT NULL,
    institution_code VARCHAR(50) DEFAULT NULL UNIQUE,
    institution_type ENUM('UNIVERSITY', 'COLLEGE', 'AUTONOMOUS', 'POLYTECHNIC', 'INSTITUTE') DEFAULT 'COLLEGE',
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) DEFAULT 'India',
    website VARCHAR(255) DEFAULT NULL,
    accreditation VARCHAR(100) DEFAULT 'NAAC A+',
    established_year INT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inst_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. Student Profiles
-- ----------------------------------------------------------
DROP TABLE IF EXISTS student_profiles;
CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    institution_id INT DEFAULT NULL,
    enrollment_number VARCHAR(80) DEFAULT NULL,
    department VARCHAR(120) DEFAULT 'Computer Science',
    degree VARCHAR(100) DEFAULT 'B.Tech',
    graduation_year INT DEFAULT 2026,
    cgpa DECIMAL(4,2) DEFAULT NULL,
    headline VARCHAR(200) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    github_url VARCHAR(255) DEFAULT NULL,
    linkedin_url VARCHAR(255) DEFAULT NULL,
    resume_url VARCHAR(255) DEFAULT NULL,
    overall_skill_score INT DEFAULT 0,
    technical_skill_score INT DEFAULT 0,
    soft_skill_score INT DEFAULT 0,
    is_placed BOOLEAN DEFAULT FALSE,
    profile_completed_pct INT DEFAULT 40,
    tenth_board VARCHAR(100) DEFAULT 'CBSE',
    tenth_school VARCHAR(200) DEFAULT 'Delhi Public School',
    tenth_year INT DEFAULT 2020,
    tenth_percentage DECIMAL(5,2) DEFAULT 92.50,
    twelfth_board VARCHAR(100) DEFAULT 'CBSE (Science)',
    twelfth_college VARCHAR(200) DEFAULT 'National Junior College',
    twelfth_year INT DEFAULT 2022,
    twelfth_percentage DECIMAL(5,2) DEFAULT 94.20,
    ug_university VARCHAR(200) DEFAULT 'Apex Technical University',
    ug_college VARCHAR(200) DEFAULT 'Apex Institute of Technology',
    address TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_stu_inst FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE SET NULL,
    INDEX idx_stu_department (department),
    INDEX idx_stu_grad_year (graduation_year)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. Academician Profiles
-- ----------------------------------------------------------
DROP TABLE IF EXISTS academician_profiles;
CREATE TABLE academician_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    institution_id INT DEFAULT NULL,
    employee_id VARCHAR(80) DEFAULT NULL,
    department VARCHAR(120) DEFAULT 'Computer Science & Engineering',
    designation VARCHAR(100) DEFAULT 'Associate Professor',
    qualification VARCHAR(100) DEFAULT 'Ph.D in AI & Systems',
    experience_years INT DEFAULT 8,
    specialization VARCHAR(255) DEFAULT 'Machine Learning, Distributed Systems',
    research_interests TEXT DEFAULT NULL,
    publications_count INT DEFAULT 0,
    linkedin_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_acad_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_acad_inst FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. Industry Profiles
-- ----------------------------------------------------------
DROP TABLE IF EXISTS industry_profiles;
CREATE TABLE industry_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(200) NOT NULL,
    industry_domain VARCHAR(120) DEFAULT 'Information Technology',
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+') DEFAULT '51-200',
    website VARCHAR(255) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) DEFAULT 'India',
    address TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ind_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ind_domain (industry_domain)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. Skill Categories & Skills
-- ----------------------------------------------------------
DROP TABLE IF EXISTS skill_categories;
CREATE TABLE skill_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('TECHNICAL', 'SOFT_SKILL') NOT NULL DEFAULT 'TECHNICAL',
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    industry_demand_pct INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_cat FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE,
    INDEX idx_skill_name (name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. Student Skills
-- ----------------------------------------------------------
DROP TABLE IF EXISTS student_skills;
CREATE TABLE student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    score INT DEFAULT 0, -- 0 to 100
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') DEFAULT 'BEGINNER',
    last_assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_skill (student_id, skill_id),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. Assessments & Questions
-- ----------------------------------------------------------
DROP TABLE IF EXISTS assessments;
CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    skill_id INT NOT NULL,
    category ENUM('TECHNICAL', 'SOFT_SKILL') DEFAULT 'TECHNICAL',
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
    duration_minutes INT DEFAULT 20,
    passing_score INT DEFAULT 60,
    description TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asmnt_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS assessment_questions;
CREATE TABLE assessment_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
    explanation TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_q_asmnt FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS assessment_options;
CREATE TABLE assessment_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opt_q FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS assessment_results;
CREATE TABLE assessment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ar_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_asmnt FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. Skill Gaps
-- ----------------------------------------------------------
DROP TABLE IF EXISTS skill_gaps;
CREATE TABLE skill_gaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    current_score INT DEFAULT 0,
    required_score INT DEFAULT 75,
    gap_status ENUM('STRONG', 'NEEDS_IMPROVEMENT', 'CRITICAL_GAP') DEFAULT 'NEEDS_IMPROVEMENT',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_gap (student_id, skill_id),
    CONSTRAINT fk_gap_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_gap_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. Learning Programs & Courses
-- ----------------------------------------------------------
DROP TABLE IF EXISTS learning_programs;
CREATE TABLE learning_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    provider VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'Course',
    duration VARCHAR(60) DEFAULT '6 Weeks',
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
    url VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lp_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. Internships
-- ----------------------------------------------------------
DROP TABLE IF EXISTS internships;
CREATE TABLE internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(120) DEFAULT 'Bengaluru',
    work_mode ENUM('REMOTE', 'HYBRID', 'ONSITE') DEFAULT 'HYBRID',
    duration_months INT DEFAULT 3,
    stipend_amount VARCHAR(80) DEFAULT '25000/month',
    openings INT DEFAULT 3,
    deadline DATE NOT NULL,
    min_skill_score INT DEFAULT 60,
    education_requirement VARCHAR(150) DEFAULT 'B.Tech / B.E. / MCA in CSE or allied',
    status ENUM('ACTIVE', 'CLOSED', 'DRAFT') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_intern_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    INDEX idx_intern_status (status)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS internship_skills;
CREATE TABLE internship_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    internship_id INT NOT NULL,
    skill_id INT NOT NULL,
    min_required_score INT DEFAULT 70,
    is_mandatory BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_is_intern FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    CONSTRAINT fk_is_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_intern_skill (internship_id, skill_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 12. Jobs
-- ----------------------------------------------------------
DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(120) DEFAULT 'Bengaluru',
    work_mode ENUM('REMOTE', 'HYBRID', 'ONSITE') DEFAULT 'ONSITE',
    salary_range VARCHAR(80) DEFAULT '6 - 12 LPA',
    experience_years INT DEFAULT 0,
    education VARCHAR(150) DEFAULT 'B.Tech / B.E. in CS/IT or relevant',
    openings INT DEFAULT 2,
    deadline DATE NOT NULL,
    status ENUM('ACTIVE', 'CLOSED', 'DRAFT') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    INDEX idx_job_status (status)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS job_skills;
CREATE TABLE job_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    min_required_score INT DEFAULT 75,
    is_mandatory BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_js_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE KEY uq_job_skill (job_id, skill_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 13. Unified Applications Table
-- ----------------------------------------------------------
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL, -- references users(id)
    applicant_role ENUM('STUDENT', 'ACADEMICIAN') NOT NULL,
    opportunity_type ENUM('INTERNSHIP', 'JOB', 'RESEARCH', 'COLLABORATION', 'MENTORSHIP', 'WORKSHOP') NOT NULL,
    opportunity_id INT NOT NULL,
    status ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED') DEFAULT 'APPLIED',
    match_score INT DEFAULT 0,
    cover_note TEXT DEFAULT NULL,
    feedback TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_user FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_opportunity (applicant_id, opportunity_type, opportunity_id),
    INDEX idx_app_status (status),
    INDEX idx_app_opp (opportunity_type, opportunity_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 14. Academician & Industry Collaboration Programs
-- ----------------------------------------------------------
DROP TABLE IF EXISTS mentorships;
CREATE TABLE mentorships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    mentor_name VARCHAR(120) NOT NULL,
    mentor_designation VARCHAR(120) DEFAULT 'Principal Engineer',
    description TEXT NOT NULL,
    domain VARCHAR(100) DEFAULT 'Software Architecture & Cloud',
    duration VARCHAR(60) DEFAULT '3 Months',
    max_participants INT DEFAULT 10,
    start_date DATE DEFAULT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mentor_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS workshops;
CREATE TABLE workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    speaker_name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    workshop_date DATETIME NOT NULL,
    duration_hours INT DEFAULT 4,
    mode ENUM('VIRTUAL', 'HYBRID', 'IN_PERSON') DEFAULT 'VIRTUAL',
    max_attendees INT DEFAULT 150,
    status ENUM('UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ws_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS guest_lectures;
CREATE TABLE guest_lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    institution_id INT DEFAULT NULL,
    topic VARCHAR(200) NOT NULL,
    speaker_name VARCHAR(120) NOT NULL,
    scheduled_date DATETIME NOT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('SCHEDULED', 'DELIVERED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gl_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_gl_institution FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS innovation_challenges;
CREATE TABLE innovation_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    problem_statement TEXT NOT NULL,
    rewards VARCHAR(200) DEFAULT 'Cash Prize + Internship Offer',
    deadline DATE NOT NULL,
    team_size_max INT DEFAULT 4,
    status ENUM('OPEN', 'EVALUATION', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ic_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS research_projects;
CREATE TABLE research_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    domain VARCHAR(120) DEFAULT 'AI & IoT Systems',
    description TEXT NOT NULL,
    expected_outcomes TEXT DEFAULT NULL,
    duration_months INT DEFAULT 12,
    grant_amount VARCHAR(80) DEFAULT 'INR 5,00,000',
    deadline DATE DEFAULT NULL,
    status ENUM('PROPOSED', 'ACTIVE', 'COMPLETED') DEFAULT 'PROPOSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rp_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 15. Student Digital Portfolio (Projects, Certifications, Achievements)
-- ----------------------------------------------------------
DROP TABLE IF EXISTS student_projects;
CREATE TABLE student_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT NULL,
    technologies VARCHAR(255) DEFAULT 'React, Node.js, MySQL',
    project_url VARCHAR(255) DEFAULT NULL,
    github_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS student_certifications;
CREATE TABLE student_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    name VARCHAR(180) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    issue_date DATE DEFAULT NULL,
    credential_id VARCHAR(100) DEFAULT NULL,
    certificate_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS student_achievements;
CREATE TABLE student_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT NULL,
    achievement_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sa_student FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 16. Documents Management
-- ----------------------------------------------------------
DROP TABLE IF EXISTS documents;
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    document_type ENUM('RESUME', 'CERTIFICATE', 'INTERNSHIP_REPORT', 'ACADEMIC_RECORD', 'PROJECT_DOC', 'OTHER') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL, -- in bytes
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 17. Notifications System
-- ----------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'APPLICATION_UPDATE', 'OPPORTUNITY', 'ASSESSMENT') DEFAULT 'INFO',
    link VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 18. Institution - Industry Connections
-- ----------------------------------------------------------
DROP TABLE IF EXISTS institution_industry_connections;
CREATE TABLE institution_industry_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    industry_id INT NOT NULL,
    mou_signed_date DATE DEFAULT NULL,
    valid_until DATE DEFAULT NULL,
    partnership_type ENUM('MOU', 'PLACEMENT_PARTNER', 'LAB_COLLABORATION', 'RESEARCH_SPONSOR') DEFAULT 'MOU',
    status ENUM('ACTIVE', 'PENDING', 'EXPIRED') DEFAULT 'ACTIVE',
    notes TEXT DEFAULT NULL,
    proposal_note TEXT DEFAULT NULL,
    initiator ENUM('INSTITUTION', 'INDUSTRY') DEFAULT 'INSTITUTION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conn_inst FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_ind FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY uq_inst_ind (institution_id, industry_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 19. Career & Company Roadmaps
-- ----------------------------------------------------------
DROP TABLE IF EXISTS student_roadmap_tasks;
DROP TABLE IF EXISTS roadmap_tasks;
DROP TABLE IF EXISTS roadmap_milestones;
DROP TABLE IF EXISTS roadmap_paths;

CREATE TABLE roadmap_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('CAREER_PATH', 'COMPANY_TRACK') NOT NULL,
    title VARCHAR(180) NOT NULL,
    company_name VARCHAR(150) DEFAULT NULL,
    target_role VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(60) DEFAULT 'Compass',
    difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'INTERMEDIATE',
    estimated_weeks INT DEFAULT 12,
    target_skills JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE roadmap_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    step_order INT NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rm_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmap_paths(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE roadmap_tasks (
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

CREATE TABLE student_roadmap_tasks (
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

-- ----------------------------------------------------------
-- 20. AI Mock Interviews
-- ----------------------------------------------------------
DROP TABLE IF EXISTS mock_interviews;
CREATE TABLE mock_interviews (
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

-- ----------------------------------------------------------
-- 21. User In-App Activity Logs
-- ----------------------------------------------------------
DROP TABLE IF EXISTS user_activity_logs;
CREATE TABLE user_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action_type ENUM('ASSESSMENT', 'APPLICATION', 'ROADMAP_TASK', 'MOCK_INTERVIEW', 'RESUME_EXPORT', 'PROFILE_UPDATE') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ual_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ual_user_date (user_id, created_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 22. Login Security Audit History
-- ----------------------------------------------------------
DROP TABLE IF EXISTS login_history;
CREATE TABLE login_history (
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

-- ----------------------------------------------------------
-- 23. Industry Student Direct Outreach Messages
-- ----------------------------------------------------------
DROP TABLE IF EXISTS industry_student_messages;
CREATE TABLE industry_student_messages (
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

-- ----------------------------------------------------------
-- 24. Institution Placement Requests & Campus Drives
-- ----------------------------------------------------------
DROP TABLE IF EXISTS institution_placement_requests;
CREATE TABLE institution_placement_requests (
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

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;


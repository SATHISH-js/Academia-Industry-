USE academia_industry_portal;

-- 1. Ensure student_profiles has placement field and company columns
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS placed_company VARCHAR(150) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS placed_package VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS placement_field VARCHAR(100) DEFAULT NULL;

-- 2. Create institution_departments table for dynamic department management
CREATE TABLE IF NOT EXISTS institution_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) DEFAULT NULL,
    head_of_department VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_idept_inst FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY uq_inst_dept_name (institution_id, name)
) ENGINE=InnoDB;

-- 3. Create industry_training_programs table
CREATE TABLE IF NOT EXISTS industry_training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(120) NOT NULL,
    duration_weeks INT DEFAULT 4,
    mode ENUM('ONLINE', 'HYBRID', 'ON_CAMPUS') DEFAULT 'ONLINE',
    target_audience ENUM('STUDENTS', 'FACULTY', 'ALL') DEFAULT 'STUDENTS',
    skills_covered VARCHAR(255) DEFAULT NULL,
    certification_offered BOOLEAN DEFAULT TRUE,
    max_batch_size INT DEFAULT 60,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_itp_industry FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Create institution_training_enrollments table
CREATE TABLE IF NOT EXISTS institution_training_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT NOT NULL,
    program_id INT NOT NULL,
    requested_batch_size INT DEFAULT 30,
    preferred_start_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ite_institution FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ite_program FOREIGN KEY (program_id) REFERENCES industry_training_programs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Seed initial departments for Institution #1 (Apex Institute of Technology)
INSERT INTO institution_departments (institution_id, name, code, head_of_department) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Dr. Rajesh Sen'),
(1, 'Artificial Intelligence & Data Science', 'AI-DS', 'Dr. Meenakshi Sundaram'),
(1, 'Information Technology', 'IT', 'Prof. Arvind Kulkarni'),
(1, 'Electronics & Communication Engineering', 'ECE', 'Dr. Sumita Rao'),
(1, 'Mechanical Engineering', 'MECH', 'Prof. H. R. Sharma')
ON DUPLICATE KEY UPDATE head_of_department=VALUES(head_of_department);

-- 6. Seed sample industry-provided training programs
INSERT INTO industry_training_programs 
(id, industry_id, title, description, domain, duration_weeks, mode, target_audience, skills_covered, certification_offered, max_batch_size, status) VALUES
(1, 1, 'Enterprise Cloud & Kubernetes Engineering Immersion', 
 'Hands-on industry accelerator covering containerization, microservices deployment on Kubernetes, AWS EKS configuration, CI/CD pipelines, and cloud observability.', 
 'Cloud & DevOps', 6, 'HYBRID', 'ALL', 'Docker, Kubernetes, AWS EKS, Terraform, Prometheus, CI/CD', TRUE, 75, 'OPEN'),
(2, 1, 'Full-Stack Modern Web & React Architectures', 
 'Comprehensive corporate training on scalable web application design, React 19, Node.js microservices, state management, and real-time WebSockets integration.', 
 'Software Engineering', 4, 'ONLINE', 'STUDENTS', 'React.js, Node.js, TypeScript, REST APIs, SQL Optimization', TRUE, 60, 'OPEN'),
(3, 2, 'GenAI & Applied Machine Learning with Google Gemini', 
 'Executive training program on generative AI patterns, LLM orchestration, multimodal prompts, RAG architecture, vector embeddings, and enterprise AI safety.', 
 'AI & Data Science', 5, 'ONLINE', 'ALL', 'Python, PyTorch, Gemini API, Vector DBs, LangChain, RAG', TRUE, 50, 'OPEN'),
(4, 2, 'Advanced Cybersecurity & Cloud Threat Defense', 
 'Defensive cybersecurity laboratory training covering cloud vulnerability testing, identity governance, zero-trust network access, and threat modeling.', 
 'Cyber Security', 4, 'HYBRID', 'STUDENTS', 'Network Security, Cloud Security, Penetration Testing, IAM, OWASP Top 10', TRUE, 40, 'OPEN'),
(5, 1, 'Faculty Development Program: Industry 4.0 & AI Systems', 
 'Dedicated faculty training on bridging academic curriculum with modern cloud infrastructure, industry capstone mentoring, and joint research grants.', 
 'Faculty Development', 2, 'ON_CAMPUS', 'FACULTY', 'Curriculum Design, AI Systems, Cloud Labs, Capstone Evaluation', TRUE, 30, 'OPEN')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Enrich student placements with field, company, and package data for realistic visual graphs
UPDATE student_profiles SET 
    is_placed = TRUE, 
    placed_company = 'TechCorp Solutions', 
    placed_package = '16.5 LPA', 
    placement_field = 'AI & Data Science'
WHERE id = 2; -- Priya Sundaram

-- Let's update Rohan or Aarav or insert additional placed students if needed
UPDATE student_profiles SET 
    is_placed = TRUE, 
    placed_company = 'CloudScale Networks', 
    placed_package = '14.0 LPA', 
    placement_field = 'Cloud & DevOps'
WHERE id = 3; -- Rohan Verma

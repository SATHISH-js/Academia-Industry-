-- ==========================================================
-- Academia–Industry Collaboration Portal - Seed Data
-- Demo Password for all seeded users: Password123!
-- Bcrypt Hash: $2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC
-- ==========================================================

USE academia_industry_portal;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Users
-- ----------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Aarav Sharma', 'student@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'STUDENT', '+91 9876543210'),
(2, 'Dr. Aris Thorne', 'academician@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'ACADEMICIAN', '+91 9876543211'),
(3, 'TechCorp Solutions', 'industry@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'INDUSTRY', '+91 9876543212'),
(4, 'Apex Institute of Technology', 'institution@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'INSTITUTION', '+91 9876543213'),
(5, 'Priya Sundaram', 'priya.s@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'STUDENT', '+91 9876543214'),
(6, 'Rohan Verma', 'rohan.v@example.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'STUDENT', '+91 9876543215'),
(7, 'CloudScale Networks', 'hr@cloudscale.com', '$2a$10$4.6bvTU8LKdiVJ127Z8DIuL96wCflm6YZmYkv8UnsESIjh5pdIVCC', 'INDUSTRY', '+91 9876543216')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- 2. Institution Profile
-- ----------------------------------------------------------
INSERT INTO institution_profiles (id, user_id, institution_name, institution_code, institution_type, city, state, website, accreditation, established_year, description) VALUES
(1, 4, 'Apex Institute of Technology', 'AIT-DELHI-001', 'AUTONOMOUS', 'New Delhi', 'Delhi', 'https://apex-tech.edu', 'NAAC A++', 1998, 'Premier technical institution focused on industry-aligned computer science, artificial intelligence, and electronics engineering.')
ON DUPLICATE KEY UPDATE institution_name=VALUES(institution_name);

-- ----------------------------------------------------------
-- 3. Student Profiles
-- ----------------------------------------------------------
INSERT INTO student_profiles (id, user_id, institution_id, enrollment_number, department, degree, graduation_year, cgpa, headline, bio, github_url, linkedin_url, overall_skill_score, technical_skill_score, soft_skill_score, is_placed, profile_completed_pct) VALUES
(1, 1, 1, '2022-CSE-045', 'Computer Science & Engineering', 'B.Tech', 2026, 8.85, 'Aspiring Full Stack Engineer & Cloud Enthusiast', 'Passionate computer science undergrad with strong foundations in Python, SQL, and Modern Web architectures. Actively building open-source projects.', 'https://github.com/aaravsharma', 'https://linkedin.com/in/aaravsharma', 74, 78, 70, FALSE, 85),
(2, 5, 1, '2022-CSE-092', 'Computer Science & Engineering', 'B.Tech', 2026, 9.15, 'Data Science & Machine Learning Practitioner', 'Researcher in natural language processing and relational data systems with hands-on experience in PyTorch and predictive modeling.', 'https://github.com/priyasundaram', 'https://linkedin.com/in/priyasundaram', 88, 92, 84, TRUE, 95),
(3, 6, 1, '2022-IT-018', 'Information Technology', 'B.Tech', 2026, 7.80, 'DevOps & Backend Developer', 'Passionate about container orchestration, CI/CD pipelines, and microservices in Node.js and Go.', 'https://github.com/rohanverma', 'https://linkedin.com/in/rohanverma', 68, 72, 64, FALSE, 70)
ON DUPLICATE KEY UPDATE headline=VALUES(headline);

-- ----------------------------------------------------------
-- 4. Academician Profile
-- ----------------------------------------------------------
INSERT INTO academician_profiles (id, user_id, institution_id, employee_id, department, designation, qualification, experience_years, specialization, research_interests, publications_count, linkedin_url) VALUES
(1, 2, 1, 'FAC-CS-104', 'Computer Science & Engineering', 'Associate Professor', 'Ph.D. in Computer Science', 11, 'Distributed Cloud Systems & AI', 'Scalable microservices, automated skill verification, edge computing, federated learning.', 18, 'https://linkedin.com/in/aristhorne')
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

-- ----------------------------------------------------------
-- 5. Industry Profiles
-- ----------------------------------------------------------
INSERT INTO industry_profiles (id, user_id, company_name, industry_domain, company_size, website, city, state, address, description, is_verified) VALUES
(1, 3, 'TechCorp Solutions', 'Information Technology & Software', '201-500', 'https://techcorp.example.com', 'Bengaluru', 'Karnataka', 'Outer Ring Road, Bellandur, Bengaluru', 'Global digital transformation enterprise delivering cloud-native products and enterprise SaaS applications.', TRUE),
(2, 7, 'CloudScale Networks', 'Cloud Infrastructure & DevOps', '51-200', 'https://cloudscale.example.com', 'Hyderabad', 'Telangana', 'HITEC City, Hyderabad', 'Next-generation cloud networking and Kubernetes orchestration provider.', TRUE)
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name);

-- ----------------------------------------------------------
-- 6. Skill Categories & Skills Taxonomy
-- ----------------------------------------------------------
INSERT INTO skill_categories (id, name, type, description) VALUES
(1, 'Programming Languages', 'TECHNICAL', 'Core programming paradigms, syntax, and memory management'),
(2, 'Core Computer Science', 'TECHNICAL', 'Data structures, algorithms, system design, and database principles'),
(3, 'Web & Full Stack', 'TECHNICAL', 'Frontend frameworks, backend RESTful APIs, and UI architecture'),
(4, 'Cloud & Infrastructure', 'TECHNICAL', 'DevOps, containerization, and public cloud deployments'),
(5, 'Professional & Soft Skills', 'SOFT_SKILL', 'Interpersonal agility, teamwork, leadership, and communication')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO skills (id, category_id, name, description, industry_demand_pct) VALUES
(1, 1, 'Python', 'Versatile language for backend, scripting, and data science', 88),
(2, 1, 'Java', 'Object-oriented language for robust enterprise backend systems', 76),
(3, 2, 'SQL & Relational DBs', 'Database normalization, indexing, joins, and ACID transactions', 82),
(4, 2, 'Data Structures & Algorithms', 'Arrays, linked lists, trees, graphs, sorting, and dynamic programming', 90),
(5, 3, 'React.js', 'Declarative, component-based frontend web development library', 80),
(6, 3, 'Node.js & Express', 'Asynchronous event-driven server runtime and REST APIs', 78),
(7, 4, 'Cloud Computing (AWS/GCP)', 'Virtual machines, serverless, storage, and IAM security', 72),
(8, 4, 'Docker & Containers', 'Containerization and multi-service development environments', 68),
(9, 5, 'Professional Communication', 'Technical writing, client presentations, and stakeholder management', 85),
(10, 5, 'Problem Solving & Critical Thinking', 'Analytical root-cause identification and algorithmic problem solving', 92),
(11, 5, 'Teamwork & Collaboration', 'Git workflows, peer code reviews, and Agile sprints', 84)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- 7. Student Skills
-- ----------------------------------------------------------
INSERT INTO student_skills (student_id, skill_id, score, level) VALUES
(1, 1, 85, 'ADVANCED'),     -- Python
(1, 3, 75, 'INTERMEDIATE'), -- SQL
(1, 5, 65, 'INTERMEDIATE'), -- React
(1, 4, 50, 'BEGINNER'),     -- DSA (GAP!)
(1, 6, 78, 'INTERMEDIATE'), -- Node.js
(1, 9, 70, 'INTERMEDIATE'), -- Communication
(1, 10, 72, 'INTERMEDIATE'),-- Problem Solving
(1, 11, 85, 'ADVANCED'),    -- Teamwork
(2, 1, 95, 'EXPERT'),       -- Priya Python
(2, 4, 88, 'ADVANCED'),     -- Priya DSA
(2, 3, 90, 'ADVANCED')      -- Priya SQL
ON DUPLICATE KEY UPDATE score=VALUES(score);

-- ----------------------------------------------------------
-- 8. Assessments & Questions
-- ----------------------------------------------------------
INSERT INTO assessments (id, title, skill_id, category, difficulty, duration_minutes, passing_score, description) VALUES
(1, 'Python Fundamentals & Data Structures', 1, 'TECHNICAL', 'INTERMEDIATE', 15, 60, 'Evaluate core Python paradigms, comprehensions, decorators, and OOP.'),
(2, 'SQL Querying, Normalization & Joins', 3, 'TECHNICAL', 'INTERMEDIATE', 20, 65, 'Evaluate relational database schema design, complex joins, and aggregations.'),
(3, 'Data Structures & Algorithmic Efficiency', 4, 'TECHNICAL', 'ADVANCED', 25, 70, 'Evaluate Big-O notation, tree traversals, and dynamic programming.'),
(4, 'Modern React & Component State', 5, 'TECHNICAL', 'INTERMEDIATE', 15, 60, 'Evaluate React hooks, component lifecycle, virtual DOM, and performance.'),
(5, 'Professional Workplace Communication', 9, 'SOFT_SKILL', 'INTERMEDIATE', 10, 60, 'Evaluate situational business communication, feedback, and conflict resolution.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Questions for Assessment 1 (Python)
INSERT INTO assessment_questions (id, assessment_id, question_text, difficulty, explanation) VALUES
(1, 1, 'What is the time complexity of searching a key in a Python dictionary on average?', 'BEGINNER', 'Python dictionaries are implemented using hash tables, offering O(1) average time complexity.'),
(2, 1, 'Which of the following creates a shallow copy rather than a reference in Python?', 'INTERMEDIATE', 'list.copy() creates a shallow copy of the list.'),
(3, 1, 'What does the `@property` decorator achieve in a Python class?', 'INTERMEDIATE', 'It defines a getter method that can be accessed like an attribute.')
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

INSERT INTO assessment_options (id, question_id, option_text, is_correct) VALUES
(1, 1, 'O(1)', TRUE),
(2, 1, 'O(n)', FALSE),
(3, 1, 'O(log n)', FALSE),
(4, 1, 'O(n log n)', FALSE),
(5, 2, 'b = a.copy()', TRUE),
(6, 2, 'b = a', FALSE),
(7, 2, 'b = ref(a)', FALSE),
(8, 2, 'b = a.clone()', FALSE),
(9, 3, 'Allows method execution via attribute access syntax', TRUE),
(10, 3, 'Makes a variable strictly private', FALSE),
(11, 3, 'Converts instance methods into static functions', FALSE),
(12, 3, 'Caches the return value of a method indefinitely', FALSE)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);

-- Questions for Assessment 2 (SQL)
INSERT INTO assessment_questions (id, assessment_id, question_text, difficulty, explanation) VALUES
(4, 2, 'Which clause is used to filter records resulting from a GROUP BY aggregation?', 'BEGINNER', 'HAVING filters grouped records, whereas WHERE filters before grouping.'),
(5, 2, 'What ensures that a foreign key cannot reference a non-existent primary key in a related table?', 'INTERMEDIATE', 'Referential integrity constraint prevents orphan records.')
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

INSERT INTO assessment_options (id, question_id, option_text, is_correct) VALUES
(13, 4, 'HAVING', TRUE),
(14, 4, 'WHERE', FALSE),
(15, 4, 'ORDER BY', FALSE),
(16, 4, 'LIMIT', FALSE),
(17, 5, 'Referential Integrity', TRUE),
(18, 5, 'Domain Integrity', FALSE),
(19, 5, 'Entity Integrity', FALSE),
(20, 5, 'User-defined Isolation', FALSE)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);

-- ----------------------------------------------------------
-- 9. Skill Gaps Data
-- ----------------------------------------------------------
INSERT INTO skill_gaps (student_id, skill_id, current_score, required_score, gap_status) VALUES
(1, 4, 50, 80, 'CRITICAL_GAP'),       -- Student 1 DSA gap
(1, 5, 65, 75, 'NEEDS_IMPROVEMENT'),  -- Student 1 React gap
(1, 1, 85, 80, 'STRONG'),             -- Student 1 Python strong
(1, 3, 75, 70, 'STRONG')              -- Student 1 SQL strong
ON DUPLICATE KEY UPDATE gap_status=VALUES(gap_status);

-- ----------------------------------------------------------
-- 10. Curated Learning Programs
-- ----------------------------------------------------------
INSERT INTO learning_programs (id, skill_id, title, provider, category, duration, level, description) VALUES
(1, 4, 'Advanced Data Structures & Problem Solving', 'TechCorp University', 'Interactive Course', '4 Weeks', 'INTERMEDIATE', 'Master graphs, trees, dynamic programming and competitive algorithmic problem solving.'),
(2, 4, 'Algorithmic Optimization & System LeetCode Sprint', 'Campus Hub', 'Workshop', '2 Weeks', 'ADVANCED', 'Rigorous hands-on practice on interview problem patterns and complexity analysis.'),
(3, 5, 'Production React & State Management Patterns', 'FullStack Open', 'Course', '6 Weeks', 'INTERMEDIATE', 'Deep dive into React 18, custom hooks, Redux/Zustand, and component performance optimization.'),
(4, 7, 'AWS Cloud Foundations & DevOps Immersion', 'CloudScale Academy', 'Certification Track', '8 Weeks', 'BEGINNER', 'Learn Amazon EC2, S3, RDS, ECS, and container deployment pipelines.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ----------------------------------------------------------
-- 11. Internships
-- ----------------------------------------------------------
INSERT INTO internships (id, industry_id, title, description, location, work_mode, duration_months, stipend_amount, openings, deadline, min_skill_score, education_requirement, status) VALUES
(1, 1, 'Full Stack Software Engineer Intern', 'Join our core platform engineering team to build customer-facing microservices and reactive user interfaces using Python, React, and MySQL.', 'Bengaluru', 'HYBRID', 6, 'INR 35,000 / month', 4, '2026-11-30', 70, 'B.Tech / B.E. in CSE, IT, or MCA', 'ACTIVE'),
(2, 1, 'Data Analytics & Business Intelligence Intern', 'Analyze platform telemetry, build interactive dashboards, execute complex SQL queries, and deliver data-driven recommendations.', 'Remote', 'REMOTE', 3, 'INR 25,000 / month', 2, '2026-10-15', 65, 'B.Tech / BCA / B.Sc Computer Science', 'ACTIVE'),
(3, 2, 'Cloud Infrastructure & DevOps Intern', 'Work on AWS infrastructure automation, containerize application stacks with Docker, and construct automated CI/CD testing pipelines.', 'Hyderabad', 'ONSITE', 6, 'INR 30,000 / month', 3, '2026-12-15', 72, 'B.Tech in Computer Science / ECE', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Required Skills for Internships
INSERT INTO internship_skills (internship_id, skill_id, min_required_score, is_mandatory) VALUES
(1, 1, 75, TRUE),  -- Python 75
(1, 3, 70, TRUE),  -- SQL 70
(1, 4, 75, TRUE),  -- DSA 75
(1, 5, 70, FALSE), -- React 70
(2, 1, 70, FALSE), -- Python 70
(2, 3, 75, TRUE),  -- SQL 75
(3, 7, 70, TRUE),  -- Cloud 70
(3, 8, 65, TRUE)   -- Docker 65
ON DUPLICATE KEY UPDATE min_required_score=VALUES(min_required_score);

-- ----------------------------------------------------------
-- 12. Full-Time Jobs
-- ----------------------------------------------------------
INSERT INTO jobs (id, industry_id, title, description, location, work_mode, salary_range, experience_years, education, openings, deadline, status) VALUES
(1, 1, 'Associate Software Development Engineer (SDE-1)', 'Design and scale backend REST APIs, collaborate with product managers, and write production-grade Python and SQL services.', 'Bengaluru', 'HYBRID', 'INR 10 - 14 LPA', 0, 'B.Tech / M.Tech in CS/IT', 3, '2026-12-31', 'ACTIVE'),
(2, 2, 'Junior Cloud & Site Reliability Engineer', 'Maintain resilient cloud infrastructure, automate deployment pipelines, and optimize database read-write latency on AWS.', 'Hyderabad', 'ONSITE', 'INR 9 - 12 LPA', 0, 'B.Tech in CS/IT/ECE', 2, '2026-11-15', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO job_skills (job_id, skill_id, min_required_score, is_mandatory) VALUES
(1, 1, 80, TRUE), -- Python 80
(1, 4, 80, TRUE), -- DSA 80
(1, 3, 75, TRUE), -- SQL 75
(2, 7, 75, TRUE), -- Cloud 75
(2, 8, 70, TRUE)  -- Docker 70
ON DUPLICATE KEY UPDATE min_required_score=VALUES(min_required_score);

-- ----------------------------------------------------------
-- 13. Applications
-- ----------------------------------------------------------
INSERT INTO applications (id, applicant_id, applicant_role, opportunity_type, opportunity_id, status, match_score, cover_note) VALUES
(1, 1, 'STUDENT', 'INTERNSHIP', 1, 'SHORTLISTED', 76, 'I have strong Python and SQL background and am actively working on my DSA skills through the recommended training.'),
(2, 1, 'STUDENT', 'INTERNSHIP', 2, 'UNDER_REVIEW', 84, 'Passionate about data analytics and business intelligence.'),
(3, 5, 'STUDENT', 'INTERNSHIP', 1, 'SELECTED', 92, 'Excellence in algorithms and backend engineering.'),
(4, 2, 'ACADEMICIAN', 'RESEARCH', 1, 'UNDER_REVIEW', 90, 'Dr. Aris Thorne research proposal on IoT edge intelligence.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ----------------------------------------------------------
-- 14. Academician Opportunities & Industry Collaborations
-- ----------------------------------------------------------
INSERT INTO research_projects (id, industry_id, title, domain, description, expected_outcomes, duration_months, grant_amount, deadline, status) VALUES
(1, 1, 'Privacy-Preserving Federated Learning for Distributed Systems', 'Artificial Intelligence & Privacy', 'Develop novel algorithms for model parameter aggregation across decentralized hospital data silos without compromising patient confidentiality.', 'Working prototype and 2 IEEE/ACM journal publications', 12, 'INR 7,50,000', '2026-12-01', 'ACTIVE'),
(2, 2, 'Edge-Assisted Kubernetes Scheduling for Low-Latency 5G Networks', 'Cloud & Edge Infrastructure', 'Formulate dynamic pod placement heuristics that minimize network hop count and packet round-trip time in private 5G edge clouds.', 'Open-source scheduler extension and whitepaper', 8, 'INR 5,00,000', '2026-11-20', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO workshops (id, industry_id, title, speaker_name, description, workshop_date, duration_hours, mode, max_attendees, status) VALUES
(1, 1, 'Building Enterprise SaaS on Modern Web Architecture', 'Vikram Sen (Principal Architect)', 'A comprehensive masterclass for students and faculty on reactive frontends, resilient microservices, and observability.', '2026-10-10 14:00:00', 4, 'VIRTUAL', 250, 'UPCOMING'),
(2, 2, 'Hands-on Kubernetes & GitOps in Production', 'Meera Nair (Staff DevOps Lead)', 'Practical deep-dive into Kubernetes manifests, Helm charts, ArgoCD, and zero-downtime rolling deployments.', '2026-10-25 10:00:00', 5, 'HYBRID', 120, 'UPCOMING')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ----------------------------------------------------------
-- 15. Student Digital Portfolio
-- ----------------------------------------------------------
INSERT INTO student_projects (student_id, title, description, technologies, project_url, github_url) VALUES
(1, 'Autonomous Drone Navigation System', 'Implemented edge obstacle avoidance algorithms using OpenCV and Python on embedded Raspberry Pi hardware.', 'Python, OpenCV, NumPy', 'https://drone-nav.demo', 'https://github.com/aaravsharma/drone-nav'),
(1, 'Real-time Collaborative Whiteboard', 'Multiplayer canvas allowing simultaneous drawing with WebSockets and React canvas renderer.', 'React, Node.js, WebSockets', 'https://whiteboard.demo', 'https://github.com/aaravsharma/whiteboard');

INSERT INTO student_certifications (student_id, name, issuing_organization, issue_date, credential_id, certificate_url) VALUES
(1, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2025-11-15', 'AWS-CCP-98124', 'https://aws.amazon.com/verify/98124'),
(1, 'Python for Data Science Professional', 'Coursera & IBM', '2025-08-20', 'IBM-DS-77123', 'https://coursera.org/verify/77123');

INSERT INTO student_achievements (student_id, title, description, achievement_date) VALUES
(1, '1st Place - Smart City National Hackathon 2025', 'Built an automated urban flood alert sensor network with real-time telemetry.', '2025-09-18'),
(1, 'Dean Honor List (Academic Year 2024-25)', 'Awarded for maintaining top 5% GPA in the Computer Science department.', '2025-06-01');

-- ----------------------------------------------------------
-- 16. Notifications
-- ----------------------------------------------------------
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Application Shortlisted!', 'Congratulations! Your application for Full Stack Software Engineer Intern at TechCorp Solutions has been shortlisted.', 'APPLICATION_UPDATE', FALSE),
(1, 'Critical Skill Gap Identified', 'Your DSA score (50%) is below the industry requirement (75%). Check recommended training programs.', 'ASSESSMENT', FALSE),
(2, 'New Industry Research Grant Posted', 'TechCorp Solutions has posted a research collaboration grant on Privacy-Preserving Federated Learning.', 'OPPORTUNITY', FALSE),
(3, 'New Applicant Matches 94%', 'Priya Sundaram applied for Full Stack Software Engineer Intern with a 94% skill compatibility score.', 'OPPORTUNITY', FALSE),
(4, 'Quarterly Placement Report Available', 'Overall campus placement rate increased to 78.5% with 28 corporate partners active.', 'INFO', TRUE);

-- ----------------------------------------------------------
-- 17. Institution-Industry Formal MoUs
-- ----------------------------------------------------------
INSERT INTO institution_industry_connections (institution_id, industry_id, mou_signed_date, valid_until, partnership_type, status, notes) VALUES
(1, 1, '2024-01-15', '2027-01-15', 'PLACEMENT_PARTNER', 'ACTIVE', 'Exclusive campus recruitment drives, student internships, and curriculum advisory.'),
(1, 2, '2024-06-01', '2026-06-01', 'LAB_COLLABORATION', 'ACTIVE', 'Cloud Scale Center of Excellence lab setup and joint faculty training workshops.');

SET FOREIGN_KEY_CHECKS = 1;

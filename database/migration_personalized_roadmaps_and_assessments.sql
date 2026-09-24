-- ==========================================================
-- Migration: Personalized Department Roadmaps, Diverse Domains & 20-Q Task Assessments
-- ==========================================================

USE academia_industry_portal;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend roadmap_paths with department, domain, and creator
ALTER TABLE roadmap_paths 
  ADD COLUMN IF NOT EXISTS department VARCHAR(120) DEFAULT 'ALL',
  ADD COLUMN IF NOT EXISTS domain VARCHAR(120) DEFAULT 'Full Stack Web',
  ADD COLUMN IF NOT EXISTS created_by_student_id INT DEFAULT NULL;

-- 2. Extend student_roadmap_tasks with assessment results
ALTER TABLE student_roadmap_tasks
  ADD COLUMN IF NOT EXISTS score_percentage DECIMAL(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS badge_awarded TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS quiz_session_id VARCHAR(100) DEFAULT NULL;

-- 3. Extend student_profiles with city, state, pincode for address separation
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT NULL;

-- 4. Extend academician_profiles with address columns
ALTER TABLE academician_profiles
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL;

-- 5. Create roadmap task quiz sessions table (for 20-Q assessments)
CREATE TABLE IF NOT EXISTS roadmap_task_quiz_sessions (
  id VARCHAR(100) PRIMARY KEY,
  student_id INT NOT NULL,
  roadmap_id INT NOT NULL,
  task_id INT NOT NULL,
  topic_title VARCHAR(255) NOT NULL,
  questions JSON NOT NULL,
  duration_seconds INT DEFAULT 600,
  submitted TINYINT(1) DEFAULT 0,
  score_percentage DECIMAL(5,2) DEFAULT NULL,
  correct_count INT DEFAULT 0,
  badge_awarded TINYINT(1) DEFAULT 0,
  verification_code VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_task_session (student_id, task_id)
) ENGINE=InnoDB;

-- 6. Seed / Update Personalized Roadmaps for Every College Department & Multiple Types
-- Update existing roadmaps with specific department and domain
UPDATE roadmap_paths SET department = 'Computer Science & Engineering', domain = 'MERN Full Stack' WHERE id = 1;
UPDATE roadmap_paths SET department = 'Artificial Intelligence & Data Science', domain = 'AI & Machine Learning' WHERE id = 2;
UPDATE roadmap_paths SET department = 'Information Technology', domain = 'Cloud & DevOps SRE' WHERE id = 3;
UPDATE roadmap_paths SET department = 'Computer Science & Engineering', domain = 'Top Tech Companies' WHERE id = 4;
UPDATE roadmap_paths SET department = 'Computer Science & Engineering', domain = 'Top Tech Companies' WHERE id = 5;
UPDATE roadmap_paths SET department = 'Information Technology', domain = 'Top Tech Companies' WHERE id = 6;
UPDATE roadmap_paths SET department = 'Computer Science & Engineering', domain = 'Top Tech Companies' WHERE id = 7;

-- Insert New Specialized Department & Domain Tracks
INSERT INTO roadmap_paths (id, category, title, company_name, target_role, department, domain, description, icon, difficulty, estimated_weeks, target_skills) VALUES
-- Type 2 of Full Stack: Java Enterprise Full Stack
(8, 'CAREER_PATH', 'Java Enterprise & Spring Boot Full Stack Track', NULL, 'Java Full Stack Engineer', 'Computer Science & Engineering', 'Java Enterprise Full Stack', 'Enterprise microservices with Spring Boot 3, Hibernate JPA, Kafka event-driven architectures, and React/Angular frontends.', 'Layers', 'ADVANCED', 14, '[{"skill_id": 2, "skill_name": "Java", "min_score": 85}, {"skill_id": 5, "skill_name": "React.js", "min_score": 80}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 80}]'),

-- Type 3 of Full Stack: Python & Cloud Full Stack
(9, 'CAREER_PATH', 'Python FastAPI & Cloud-Native Full Stack Track', NULL, 'Python Full Stack Developer', 'Information Technology', 'Python Cloud Full Stack', 'High-performance asynchronous backends with FastAPI & Django, Celery distributed tasks, Redis caching, and reactive modern frontends.', 'Code', 'INTERMEDIATE', 12, '[{"skill_id": 1, "skill_name": "Python", "min_score": 85}, {"skill_id": 5, "skill_name": "React.js", "min_score": 75}, {"skill_id": 7, "skill_name": "Cloud Computing (AWS/GCP)", "min_score": 75}]'),

-- Cyber Security
(10, 'CAREER_PATH', 'Cyber Security & Ethical Hacking Track', NULL, 'Cyber Security Analyst / Pentester', 'Computer Science & Engineering', 'Cyber Security & Forensics', 'Vulnerability assessment, OWASP Top 10 defense, network intrusion analysis with Wireshark, penetration testing, and security compliance.', 'ShieldCheck', 'ADVANCED', 12, '[{"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 85}, {"skill_id": 1, "skill_name": "Python", "min_score": 80}]'),

-- ECE: Embedded Systems & IoT
(11, 'CAREER_PATH', 'Embedded Systems & IoT Engineering Track', NULL, 'Embedded Systems Engineer', 'Electronics & Communication Engineering', 'Embedded Systems & IoT', 'Low-level bare-metal Embedded C, ARM Cortex-M architecture, FreeRTOS multithreading, hardware protocols (I2C, SPI, UART), and edge sensor telemetry.', 'Cpu', 'ADVANCED', 14, '[{"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 85}]'),

-- ECE: VLSI & Chip Design
(12, 'CAREER_PATH', 'VLSI Design & Digital ASIC Engineering Track', NULL, 'VLSI Design Engineer', 'Electronics & Communication Engineering', 'VLSI & Chip Design', 'Verilog RTL coding, FPGA hardware verification, logic synthesis, Static Timing Analysis (STA), and modern semiconductor fabrication workflows.', 'Activity', 'ADVANCED', 16, '[{"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 90}]'),

-- EEE / Mech: EV Powertrain & Battery Systems
(13, 'CAREER_PATH', 'Electric Vehicle (EV) Powertrain & BMS Track', NULL, 'EV Systems / BMS Engineer', 'Electrical & Electronics Engineering', 'Electric Vehicles & Powertrain', 'Electric vehicle propulsion, lithium-ion battery management systems (BMS), motor control inverters, MATLAB/Simulink modeling, and automotive CAN protocols.', 'Zap', 'ADVANCED', 14, '[{"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 80}]'),

-- MECH: Robotics & Mechatronics Automation
(14, 'CAREER_PATH', 'Robotics & Mechatronics Automation Track', NULL, 'Robotics Engineer', 'Mechanical Engineering', 'Robotics & Automation', 'Robot Operating System (ROS 2), forward and inverse kinematics, OpenCV machine vision, industrial PLCs, and servo motor trajectory planning.', 'Wrench', 'ADVANCED', 14, '[{"skill_id": 1, "skill_name": "Python", "min_score": 80}, {"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 85}]'),

-- CIVIL: Smart Infrastructure & BIM
(15, 'CAREER_PATH', 'Smart Infrastructure & BIM Engineering Track', NULL, 'BIM / Structural Engineer', 'Civil Engineering', 'Smart Infrastructure & BIM', 'Building Information Modeling (BIM) in Autodesk Revit, STAAD.Pro structural analysis, GIS spatial mapping, and green building environmental ratings.', 'Home', 'INTERMEDIATE', 10, '[{"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 80}]')
ON DUPLICATE KEY UPDATE title=VALUES(title), department=VALUES(department), domain=VALUES(domain);

-- 7. Seed Milestones & Tasks for New Specialized Department Roadmaps
-- Milestones for Java Enterprise Full Stack (Roadmap 8)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(9, 8, 1, 'Core Java 21 & Concurrency', 'Deep dive into memory models, Virtual Threads (Project Loom), Streams, and collections.'),
(10, 8, 2, 'Spring Boot 3 & REST Microservices', 'Dependency Injection, Spring Data JPA, Hibernate ORM, and resilient REST controllers.'),
(11, 8, 3, 'Kafka Event Streaming & Security', 'Apache Kafka producer/consumer pipelines, Spring Security with OAuth2/JWT.'),
(12, 8, 4, 'Full-Stack Integration & Cloud Deploy', 'Connecting Spring Boot APIs to responsive React dashboards and Docker containerization.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(14, 9, 'Virtual Threads & High-Concurrency Benchmarking', 'Implement high-throughput asynchronous request handlers using Java 21 Virtual Threads.', 2, 8, 'HARD'),
(15, 9, 'Collections Framework & Custom Comparator Optimization', 'Optimize memory footprints and write custom comparators for enterprise transactional lists.', 2, 6, 'MEDIUM'),
(16, 10, 'Spring Data JPA Relationships & N+1 Problem Fixing', 'Architect complex @OneToMany and @ManyToMany mappings and resolve query explosion with JOIN FETCH.', 2, 8, 'HARD'),
(17, 10, 'Transactional Boundaries & Acid Consistency', 'Master @Transactional propagation levels, isolation locks, and rollbacks.', 2, 6, 'MEDIUM'),
(18, 11, 'Kafka Event Producer & Consumer Architecture', 'Build resilient message queues with partition keys and consumer group balancing.', 2, 10, 'HARD'),
(19, 12, 'Dockerize Spring Boot Microservices with PostgreSQL', 'Write multi-stage Docker builds and docker-compose configurations for end-to-end integration.', 8, 8, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Milestones for Python & Cloud Full Stack (Roadmap 9)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(13, 9, 1, 'FastAPI Async APIs & Pydantic Data Models', 'Asynchronous request lifecycles, dependency injection, and strict type schemas.'),
(14, 9, 2, 'Database ORM & Asynchronous Connection Pooling', 'SQLAlchemy 2.0 with asyncpg, Alembic schema migrations, and indexing.'),
(15, 9, 3, 'Distributed Task Processing with Celery & Redis', 'Offloading CPU and network-heavy workloads to background workers.'),
(16, 9, 4, 'Cloud Serverless & Reactive React Frontend', 'Connecting frontend state to FastAPI WebSockets and deploying to cloud containers.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(20, 13, 'Architect Async FastAPI Endpoints with Pydantic V2', 'Build high-speed JSON APIs with automatic OpenAPI generation and validation.', 1, 6, 'MEDIUM'),
(21, 14, 'Async SQLAlchemy Sessions & Connection Pool Tuning', 'Manage database connections safely under 500+ concurrent API requests.', 1, 8, 'HARD'),
(22, 15, 'Configure Celery Workers with Redis Broker', 'Implement background report generation and email dispatching with retry backoff.', 1, 7, 'MEDIUM'),
(23, 16, 'Full-Stack JWT Auth with FastAPI & React Vite', 'Secure endpoints with HTTP-only cookies and Bearer tokens in React.', 5, 8, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Milestones for Embedded Systems & IoT (Roadmap 11)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(17, 11, 1, 'Bare-Metal Embedded C & ARM Cortex Architecture', 'Memory-mapped registers, clock configuration, and pointer arithmetic on hardware.'),
(18, 11, 2, 'Communication Protocols (I2C, SPI, UART)', 'Writing robust low-level drivers for sensors, OLED displays, and EEPROMs.'),
(19, 11, 3, 'FreeRTOS Task Scheduling & Semaphores', 'Preemptive multitasking, priority inversion avoidance, and queue management.'),
(20, 11, 4, 'IoT Cloud Telemetry with MQTT & ESP32', 'Sending encrypted sensor telemetry to cloud IoT dashboards over WiFi.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(24, 17, 'Configure ARM GPIO & Timer Interrupts via Registers', 'Write direct register manipulation code without third-party HAL bloat.', 10, 8, 'HARD'),
(25, 18, 'Implement Bit-Banged and Hardware SPI Driver', 'Transmit sensor packets reliably with correct clock polarity (CPOL) and phase (CPHA).', 10, 10, 'HARD'),
(26, 19, 'Create Multi-Task FreeRTOS Application with Mutexes', 'Prevent resource collisions across sensor read and display refresh threads.', 10, 8, 'MEDIUM'),
(27, 20, 'Publish JSON Sensor Stream over MQTT with TLS', 'Connect ESP32 microcontrollers to AWS IoT Core or HiveMQ with client certificates.', 10, 6, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Milestones for EV Powertrain & BMS (Roadmap 13)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(21, 13, 1, 'EV Architecture & Battery Chemistries', 'Lithium-ion cells, thermal runaway prevention, and pack sizing calculations.'),
(22, 13, 2, 'Battery Management System (BMS) Algorithm Design', 'State of Charge (SoC) estimation using Kalman filters and cell balancing.'),
(23, 13, 3, 'Electric Motor Drives & Inverter Control', 'Permanent Magnet Synchronous Motor (PMSM) Field-Oriented Control (FOC).'),
(24, 13, 4, 'Automotive CAN Bus Protocol & ECU Telemetry', 'Decoding real-time CAN messages for speed, temperature, and battery health.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(28, 21, 'Calculate Pack Sizing & C-Rate Thermal Limits', 'Determine battery configuration (e.g. 72V 40Ah) for specified vehicular acceleration.', 10, 8, 'MEDIUM'),
(29, 22, 'Implement SoC Extended Kalman Filter in MATLAB', 'Model electrochemical open-circuit voltage curves with dynamic temperature correction.', 10, 12, 'HARD'),
(30, 23, 'Simulate Field-Oriented Motor Inverter in Simulink', 'Design closed-loop PI current control loops for regenerative braking efficiency.', 10, 10, 'HARD'),
(31, 24, 'Log and Decode CAN Bus Telemetry via DBC Files', 'Parse differential voltage signals and detect powertrain communication faults.', 10, 8, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Milestones for Smart Infrastructure & BIM (Roadmap 15)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(25, 15, 1, 'Architectural BIM Modeling in Autodesk Revit', 'Parametric 3D building modeling, family creation, and floor plan generation.'),
(26, 15, 2, 'Structural Analysis & Load Calculations (STAAD.Pro)', 'Dead, live, wind, and seismic load combination checks for RCC multi-story frames.'),
(27, 15, 3, 'Clash Detection & 4D Construction Simulation', 'Inter-discipline coordination using Navisworks and scheduling alignment.'),
(28, 15, 4, 'GIS Integration & Sustainable Smart City Planning', 'Spatial topography mapping, stormwater drainage, and green rating metrics.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(32, 25, 'Model Multi-Storey Commercial Building in Revit', 'Create coordinated floor plans, elevations, and structural column grid layouts.', 10, 10, 'MEDIUM'),
(33, 26, 'Perform Seismic Dynamic Analysis in STAAD.Pro', 'Simulate Indian Standard IS 1893 earthquake forces and verify shear wall moments.', 10, 12, 'HARD'),
(34, 27, 'Execute Clash Detection between MEP and Structural Framing', 'Identify and resolve mechanical ducting clashes before physical construction.', 10, 8, 'MEDIUM'),
(35, 28, 'Map Urban Stormwater Drainage using QGIS', 'Analyze surface elevation models and delineate catchment runoff basins.', 10, 8, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET FOREIGN_KEY_CHECKS = 1;

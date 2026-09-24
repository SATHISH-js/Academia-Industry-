-- ==========================================================
-- Migration: Add Wipro Elite & Turbo Next-Gen SDE Track
-- ==========================================================

USE academia_industry_portal;

INSERT INTO roadmap_paths (id, category, title, company_name, target_role, department, domain, description, icon, difficulty, estimated_weeks, target_skills) VALUES
(16, 'COMPANY_TRACK', 'Wipro Elite & Turbo Next-Gen SDE Track', 'Wipro', 'Project Engineer (Elite/Turbo)', 'Computer Science & Engineering', 'Enterprise & Full Stack', 'Specialized Wipro campus placement track covering core Java, Spring Boot, Angular/React, Cloud microservices, and Wipro automated coding benchmarks.', 'Building2', 'INTERMEDIATE', 12, '[{"skill_id": 2, "skill_name": "Java", "min_score": 80}, {"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 75}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 75}]')
ON DUPLICATE KEY UPDATE title=VALUES(title), company_name=VALUES(company_name);

INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(37, 16, 1, 'Phase 1: Wipro Coding & Algorithmic Foundations', 'Master array transformations, string manipulations, time complexity, and core programming idioms.'),
(38, 16, 2, 'Phase 2: Object-Oriented Java & Enterprise Data Layer', 'Collections framework, OOP principles, JDBC, Hibernate ORM, and normalized relational SQL schemas.'),
(39, 16, 3, 'Phase 3: Spring Boot Microservices & Cloud APIs', 'Build secure RESTful services with Spring Boot, validation filters, Postman testing, and Swagger/OpenAPI.'),
(40, 16, 4, 'Phase 4: Wipro Turbo Capstone & Technical Mock Defense', 'Deploy full-stack enterprise capstone with Docker and simulate Wipro technical and behavioral interviews.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(61, 37, 'Arrays, Strings & Time Complexity for Wipro Elite', 'Solve 15 essential problems on arrays, frequency counting, and string pattern matching.', 4, 8, 'EASY'),
(62, 37, 'Core Java Syntax, Memory Model & Control Structures', 'Understand JVM memory stack/heap, pass-by-value, and exception handling hierarchies.', 2, 7, 'EASY'),
(63, 37, 'SQL Querying, Aggregations & Joins for Wipro Database Round', 'Write multi-table joins, GROUP BY aggregations, and subqueries on sample enterprise schemas.', 3, 6, 'MEDIUM'),
(64, 38, 'Java Collections Framework (List, Set, Map) In-Depth', 'Implement custom sorting with Comparators, avoid concurrent modification, and optimize lookups.', 2, 8, 'MEDIUM'),
(65, 38, 'Object-Oriented Design (SOLID) & Design Patterns', 'Refactor code using Factory, Singleton, and Strategy design patterns.', 2, 8, 'MEDIUM'),
(66, 38, 'Hibernate ORM & Spring Data JPA Repositories', 'Map domain entities, execute JPQL queries, and configure connection pooling.', 2, 9, 'MEDIUM'),
(67, 39, 'Spring Boot 3 REST API Development & Validation', 'Build production-ready controllers with @Valid request bodies and global @ControllerAdvice.', 2, 10, 'MEDIUM'),
(68, 39, 'API Security with JWT & Role-Based Permissions', 'Secure endpoints with Spring Security filter chains and stateless token authentication.', 2, 9, 'HARD'),
(69, 39, 'Frontend Integration with React/Angular', 'Consume Spring Boot endpoints with Axios, handle CORS, and manage application state.', 5, 8, 'MEDIUM'),
(70, 40, 'Containerize Full-Stack Application with Docker', 'Write Dockerfiles for Spring Boot and React frontend, orchestrate with Docker Compose.', 8, 8, 'MEDIUM'),
(71, 40, 'CI/CD Pipeline Automation & Cloud Deployment', 'Automate builds with GitHub Actions and deploy to AWS Elastic Beanstalk or Cloud Run.', 7, 10, 'HARD'),
(72, 40, 'Wipro Technical Interview Simulation & STAR Behavioral Preparation', 'Prepare answers for technical architecture questions, project defense, and Wipro values.', 10, 6, 'MEDIUM')
ON DUPLICATE KEY UPDATE title=VALUES(title);

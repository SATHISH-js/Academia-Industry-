-- ==========================================================
-- Seed Data: Career Roadmaps, Company Roadmaps, Milestones & Tasks
-- ==========================================================

USE academia_industry_portal;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert Career Paths & Company Tracks
INSERT INTO roadmap_paths (id, category, title, company_name, target_role, description, icon, difficulty, estimated_weeks, target_skills) VALUES
(1, 'CAREER_PATH', 'Full Stack Web Developer Path', NULL, 'Full Stack Engineer', 'Comprehensive roadmap from foundational modern web protocols to production-grade microservices and reactive frontend architectures.', 'Layers', 'INTERMEDIATE', 12, '[{"skill_id": 5, "skill_name": "React.js", "min_score": 80}, {"skill_id": 6, "skill_name": "Node.js & Express", "min_score": 80}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 75}, {"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 75}]'),
(2, 'CAREER_PATH', 'Data Science & Machine Learning Path', NULL, 'Data Scientist / ML Engineer', 'Statistical modeling, exploratory data analysis, neural networks, PyTorch, and deploying machine learning pipelines.', 'Brain', 'ADVANCED', 14, '[{"skill_id": 1, "skill_name": "Python", "min_score": 90}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 85}, {"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 85}]'),
(3, 'CAREER_PATH', 'Cloud Architecture & DevOps Path', NULL, 'Cloud DevOps Engineer', 'Containerization with Docker, Kubernetes orchestration, CI/CD automation, and infrastructure-as-code on AWS and GCP.', 'Cloud', 'ADVANCED', 10, '[{"skill_id": 7, "skill_name": "Cloud Computing (AWS/GCP)", "min_score": 85}, {"skill_id": 8, "skill_name": "Docker & Containers", "min_score": 80}, {"skill_id": 1, "skill_name": "Python", "min_score": 75}]'),
(4, 'COMPANY_TRACK', 'Google SWE Track (L3 / Early Career)', 'Google', 'Software Engineer (SWE)', 'Targeted roadmap calibrated to Google technical hiring benchmarks: algorithmic complexity, graph theory, scalable systems, and concurrency.', 'Sparkles', 'ADVANCED', 12, '[{"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 90}, {"skill_id": 1, "skill_name": "Python", "min_score": 85}, {"skill_id": 10, "skill_name": "Problem Solving & Critical Thinking", "min_score": 90}]'),
(5, 'COMPANY_TRACK', 'Amazon SDE-1 Preparation Track', 'Amazon', 'Software Development Engineer I', 'Calibrated to Amazon Leadership Principles, object-oriented design, dynamic programming, and high-throughput backend APIs.', 'Briefcase', 'ADVANCED', 10, '[{"skill_id": 2, "skill_name": "Java", "min_score": 85}, {"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 85}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 80}, {"skill_id": 7, "skill_name": "Cloud Computing (AWS/GCP)", "min_score": 75}]'),
(6, 'COMPANY_TRACK', 'Microsoft Software Engineer Track', 'Microsoft', 'Software Engineer', 'Core data structures, Azure cloud integration, clean enterprise code architectures, and collaborative Git practices.', 'Building2', 'INTERMEDIATE', 10, '[{"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 80}, {"skill_id": 5, "skill_name": "React.js", "min_score": 75}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 80}]'),
(7, 'COMPANY_TRACK', 'TechCorp Core Platform Engineer', 'TechCorp Solutions', 'Platform Engineer', 'Direct company preparation for TechCorp Solutions internship and full-time hiring assessments.', 'Target', 'INTERMEDIATE', 8, '[{"skill_id": 1, "skill_name": "Python", "min_score": 80}, {"skill_id": 3, "skill_name": "SQL & Relational DBs", "min_score": 75}, {"skill_id": 5, "skill_name": "React.js", "min_score": 75}, {"skill_id": 4, "skill_name": "Data Structures & Algorithms", "min_score": 70}]')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 2. Milestones for Full Stack Web Developer (Roadmap 1)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(1, 1, 1, 'Phase 1: Modern Frontend Architecture', 'Master React 18 component lifecycle, state management, and responsive layouts.'),
(2, 1, 2, 'Phase 2: Scalable Backend RESTful Services', 'Node.js, Express middleware architecture, database pooling, and JWT authorization.'),
(3, 1, 3, 'Phase 3: Database Optimization & Caching', 'Relational database normalization, indexing strategies, and query optimization.'),
(4, 1, 4, 'Phase 4: Full-Stack Project & Deployment', 'Deploy a production-grade multi-tenant web application with CI/CD automation.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Tasks for Milestone 1
INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(1, 1, 'Master React Hooks & Custom Hooks', 'Build custom data-fetching and debounce hooks using useEffect, useMemo, and useCallback.', 5, 6, 'MEDIUM'),
(2, 1, 'State Management & Context API', 'Implement global authentication and theme state management using React Context.', 5, 5, 'MEDIUM'),
(3, 1, 'Component Performance & Memoization', 'Profile rendering bottlenecks using React DevTools and optimize with React.memo.', 5, 4, 'HARD');

-- Tasks for Milestone 2
INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(4, 2, 'Architect Express Middleware Pipeline', 'Implement centralized error handling, request validation, and CORS security headers.', 6, 6, 'MEDIUM'),
(5, 2, 'JWT Stateless Authentication & RBAC', 'Build role-based access control protecting specific routes based on user role enums.', 6, 8, 'HARD');

-- Tasks for Milestone 3
INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(6, 3, 'Relational Schema Design & Normalization', 'Design 3NF relational tables with foreign key cascades and composite indexes.', 3, 7, 'MEDIUM'),
(7, 3, 'Complex Joins & Aggregation Queries', 'Write analytical SQL queries utilizing window functions, GROUP BY, and subqueries.', 3, 5, 'MEDIUM');

-- Tasks for Milestone 4
INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(8, 4, 'Containerize Application with Docker', 'Write multi-stage Dockerfiles for frontend Vite and backend Node.js services.', 8, 6, 'MEDIUM'),
(9, 4, 'Deploy to Cloud & Configure Domain', 'Deploy containerized services to cloud instances with SSL and automated restarts.', 7, 8, 'HARD');

-- Milestones for Google SWE Track (Roadmap 4)
INSERT INTO roadmap_milestones (id, roadmap_id, step_order, title, description) VALUES
(5, 4, 1, 'Algorithmic Complexity & Core Structures', 'Master Big-O analysis, dynamic arrays, hash tables, and two-pointer techniques.'),
(6, 4, 2, 'Trees, Graphs & Advanced Search', 'Binary search trees, Trie, DFS/BFS graph traversals, and shortest-path algorithms.'),
(7, 4, 3, 'Dynamic Programming & Memoization', '1D and 2D dynamic programming, knapsack variants, and recursive state formulation.'),
(8, 4, 4, 'System Design & Scalability Basics', 'Load balancing, horizontal scaling, database sharding, and latency vs throughput tradeoffs.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO roadmap_tasks (id, milestone_id, title, description, skill_id, estimated_hours, difficulty) VALUES
(10, 5, 'Solve 25 LeetCode Mediums on Hash Tables', 'Master constant-time lookup strategies and collision resolution algorithms.', 4, 12, 'MEDIUM'),
(11, 6, 'Implement Dijkstra & Topological Sort', 'Solve dependency resolution and network routing graph interview problems.', 4, 10, 'HARD'),
(12, 7, 'Master 15 Classical Dynamic Programming Problems', 'LCS, LIS, coin change, and matrix chain multiplication.', 4, 14, 'HARD'),
(13, 8, 'Design a URL Shortener & Rate Limiter', 'Construct end-to-end distributed system design diagrams with capacity estimates.', 10, 8, 'HARD');

-- Seed sample completed tasks for Student 1 (Aarav Sharma)
INSERT INTO student_roadmap_tasks (student_id, task_id, roadmap_id, is_completed, completed_at) VALUES
(1, 1, 1, TRUE, NOW()),
(1, 2, 1, TRUE, NOW()),
(1, 4, 1, TRUE, NOW()),
(1, 6, 1, TRUE, NOW())
ON DUPLICATE KEY UPDATE is_completed=VALUES(is_completed);

-- 3. Seed Sample AI Mock Interview for Student 1
INSERT INTO mock_interviews (id, student_id, role_title, company_name, overall_score, confidence_score, technical_score, communication_score, words_analyzed, filler_words_count, feedback_summary, transcript) VALUES
(1, 1, 'Full Stack Software Engineer', 'TechCorp Solutions', 84, 82, 88, 80, 420, 4,
'Candidate demonstrated strong technical depth in Python and REST API architectures. Clear explanation of database normalization and indexing. Confidence remained high throughout technical responses with minimal hesitation. Recommendation: Practice concise STAR method summaries for behavioral questions.',
'[{"question": "Can you explain how database indexing improves read performance and what tradeoffs it introduces?", "user_response": "Database indexing creates a B-Tree structure on the indexed columns so queries can find rows in logarithmic time instead of doing a full table scan. The tradeoff is that insert and update operations take longer because the index must also be recalculated, and additional disk storage is required.", "analysis": {"technical_depth": 92, "clarity": 88, "confidence": 85, "keywords": ["B-Tree", "logarithmic time", "full table scan", "tradeoff", "storage"]}}]')
ON DUPLICATE KEY UPDATE overall_score=VALUES(overall_score);

-- 4. Seed User Activity Logs for Student 1
INSERT INTO user_activity_logs (user_id, action_type, title, description, created_at) VALUES
(1, 'ASSESSMENT', 'Completed Python Fundamentals Assessment', 'Scored 85% with Advanced proficiency badge awarded.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'ASSESSMENT', 'Completed SQL Querying Assessment', 'Scored 75% with Intermediate proficiency badge awarded.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'APPLICATION', 'Applied to TechCorp Solutions', 'Submitted application for Full Stack Software Engineer Intern with 90% compatibility score.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'ROADMAP_TASK', 'Completed Milestone Task: State Management & Context API', 'Marked task as complete in Full Stack Web Developer Path.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'MOCK_INTERVIEW', 'AI Mock Interview: TechCorp Solutions', 'Achieved 84% overall readiness score (Tech: 88%, Confidence: 82%, Comm: 80%).', NOW());

-- 5. Seed Login History
INSERT INTO login_history (user_id, email, ip_address, user_agent, status, created_at) VALUES
(1, 'student@example.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'student@example.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0', 'SUCCESS', NOW());

SET FOREIGN_KEY_CHECKS = 1;

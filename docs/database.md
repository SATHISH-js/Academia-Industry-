# Database Architecture & Entity Relationships

## 1. Design Principles
- **Single Auth Entity**: The `users` table holds authentication credentials (email, hashed password, role).
- **Role Profile Extension**: 1-to-1 extension tables (`student_profiles`, `academician_profiles`, `industry_profiles`, `institution_profiles`) store domain-specific profile fields.
- **Relational Integrity**: Foreign key constraints ensure cascading deletion when a user is deleted and reference integrity across relations.
- **Performance Indexes**: Strategic indexes on foreign keys, status columns, unique constraints, and lookup attributes.

## 2. Entity Summary
1. `users` - Core authentication table with role enum.
2. `institution_profiles` - College / University details, accreditation.
3. `student_profiles` - Enrollment, department, CGPA, overall/tech/soft scores, placement status.
4. `academician_profiles` - Faculty designation, department, research domains.
5. `industry_profiles` - Company name, domain, size, location, verification status.
6. `skill_categories` & `skills` - Master taxonomy of technical and soft skills.
7. `student_skills` - Assessed proficiency scores (0-100) and levels.
8. `assessments`, `assessment_questions`, `assessment_options`, `assessment_results` - Complete testing engine.
9. `skill_gaps` - Computed gaps between student score and industry requirement.
10. `learning_programs` - Courses and resources recommended for skill gaps.
11. `internships`, `internship_skills` - Industry internship postings and requirements.
12. `jobs`, `job_skills` - Full-time job postings and requirements.
13. `applications` - Polymorphic opportunity applications with status lifecycle.
14. `mentorships`, `workshops`, `guest_lectures`, `innovation_challenges`, `research_projects` - Industry-academia initiatives.
15. `student_projects`, `student_certifications`, `student_achievements` - Portfolio records.
16. `documents` - File uploads metadata (resumes, certificates, reports).
17. `notifications` - User event notifications.
18. `institution_industry_connections` - Formal MoUs and collaborative partnerships.

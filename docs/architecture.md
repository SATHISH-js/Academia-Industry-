# System Architecture

## 1. High-Level Architecture
The Academia–Industry Collaboration Portal follows a 3-tier, decoupled architecture:

```text
[React + Vite Frontend (SPA)]
          │  HTTP / REST (JSON) + JWT
          ▼
[Node.js + Express.js API Gateway]
    ├── Authentication (JWT + Bcrypt)
    ├── Role-Based Access Control (RBAC Middleware)
    ├── Business Services (Matching Engine, Recommendations)
    └── Validation (Express-Validator)
          │  MySQL2 Pool
          ▼
[MySQL 8.0 Relational Database]
```

## 2. Core Subsystems
1. **Authentication & Authorization**:
   - Single source of truth in `users` table.
   - Stateless JWT tokens passed via HTTP `Authorization: Bearer <token>` header.
   - Centralized RBAC middleware checking user roles (`STUDENT`, `ACADEMICIAN`, `INDUSTRY`, `INSTITUTION`).

2. **Skill Assessment & Gap Analysis Engine**:
   - Structured tests with multiple-choice questions.
   - Automated scoring calculating technical & soft skill proficiencies (0-100%).
   - Dynamic comparison against industry expectations calculating skill gaps.

3. **Skill Compatibility Matching Engine**:
   - Compares candidate skill vectors against opportunity requirements.
   - Computes match percentage:
     `MatchScore = (Σ min(100, student_score / required_score * 100) * weight) / Σ weight`
   - Classifies skills into Matched vs. Gap items.

4. **Recruitment & Opportunity Lifecycle**:
   - Internships, Jobs, Mentorships, Research Projects.
   - Unified `applications` table tracking progression: `APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` / `REJECTED`.
   - Automated notification triggers upon status updates.

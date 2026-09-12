# REST API Specifications

## Base URL
`http://localhost:5000/api`

## Response Format
Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error:
```json
{
  "success": false,
  "error": "Error description",
  "errors": [ ... ]
}
```

---

## Key Endpoints

### 1. Authentication
- `POST /api/auth/register` - Register a new user with role and initial profile.
- `POST /api/auth/login` - Authenticate with email and password, receives JWT.
- `GET /api/auth/me` - Get current authenticated user details and profile.
- `POST /api/auth/logout` - Invalidate client-side session.

### 2. Students
- `GET /api/students/profile` - Fetch student profile and educational details.
- `PUT /api/students/profile` - Update student profile.
- `GET /api/students/skills` - Fetch student assessed skills and levels.
- `GET /api/students/skill-gap` - Fetch analyzed skill gaps vs industry demand.
- `GET /api/students/dashboard-summary` - Summary stats (assessments, applications, placements).

### 3. Skills & Assessments
- `GET /api/skills` - List skills catalog and categories.
- `GET /api/assessments` - List available assessments.
- `GET /api/assessments/:id` - Get assessment details and quiz questions.
- `POST /api/assessments/:id/submit` - Submit answers, calculate score, update skill profile & gaps.
- `GET /api/recommendations/learning` - Get recommended courses/training based on gaps.

### 4. Opportunities (Internships & Jobs)
- `GET /api/internships` - Search & filter internships.
- `POST /api/internships` - [INDUSTRY] Create internship posting.
- `GET /api/internships/:id` - Get internship details with required skills.
- `GET /api/jobs` - Search & filter jobs.
- `POST /api/jobs` - [INDUSTRY] Create job posting.
- `GET /api/jobs/:id` - Get job details with required skills.

### 5. Applications & Matching
- `POST /api/applications` - Submit application for an opportunity.
- `GET /api/applications` - Get applications (Student views their own; Industry views applicants for their postings).
- `PUT /api/applications/:id/status` - [INDUSTRY] Update application status (SHORTLISTED, INTERVIEW, SELECTED, REJECTED).
- `GET /api/recommendations/internships` - [STUDENT] Get internships ranked by candidate compatibility %.
- `GET /api/recommendations/jobs` - [STUDENT] Get jobs ranked by candidate compatibility %.
- `GET /api/industry/candidates/:type/:id` - [INDUSTRY] View candidate leaderboard ranked by skill match %.

### 6. Academician & Collaboration
- `GET /api/academician/profile` - Academician profile details.
- `GET /api/academician/opportunities` - Faculty internships, FDPs, research projects.
- `GET /api/collaborations` - List industry workshops, guest lectures, innovation challenges.
- `POST /api/collaborations` - [INDUSTRY] Post collaboration opportunity.

### 7. Institution Analytics
- `GET /api/institution/analytics` - Comprehensive metrics on skill readiness, placement rate, department benchmarks.
- `GET /api/institution/students` - Roster of enrolled students and skill scores.
- `GET /api/institution/academicians` - Roster of faculty members.
- `GET /api/institution/partners` - Active industry MoUs and collaborations.

### 8. Digital Portfolio & Notifications
- `GET /api/portfolio/:studentId?` - View student portfolio (public/private).
- `POST /api/portfolio/projects` - Add project to portfolio.
- `POST /api/portfolio/certifications` - Add certification.
- `GET /api/notifications` - Get user notifications.
- `PUT /api/notifications/:id/read` - Mark notification as read.

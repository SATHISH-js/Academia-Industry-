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

### 1. Authentication and authorization
- `POST /api/auth/register` - Public signup for `TRAINEE` or `TRAINER`; both roles activate immediately and receive a JWT.
- `POST /api/auth/login` - Authenticate an `ACTIVE` trainee, trainer, or admin and receive a JWT.
- `POST /api/auth/logout` - Authenticated; increments token version and revokes all of that user's current tokens.
- `GET /api/auth/me` - Authenticated; returns current role and account status from MySQL.
- `PUT /api/auth/profile` - Authenticated; update name, phone, or avatar URL.
- `PUT /api/auth/change-password` - Authenticated; verify current password, change hash, and revoke existing tokens.
- `GET /api/auth/login-history` - Authenticated; fetch recent login events.

### 2. Admin account controls (ADMIN only)
- `GET /api/admin/users` - List accounts and statuses.
- `PATCH /api/admin/users/:id/role` - Set TRAINEE or TRAINER while retaining account status. Cannot assign ADMIN.
- `PATCH /api/admin/users/:id/disable` - Disable an account and revoke sessions; cannot disable the last active admin.

### 3. Trainee professional profile (TRAINEE only)
- `GET /api/trainee/profile` - Read the authenticated trainee's personal details, qualification, skills, experience, interests, and certificates.
- `PUT /api/trainee/profile` - Update name, phone, bio, profile photo, degree, institution, specialization, or graduation year.
- `POST|DELETE /api/trainee/profile/skills[/:id]` - Add or remove one of the trainee's skills.
- `POST|DELETE /api/trainee/profile/interests[/:id]` - Add or remove one of the trainee's interests.
- `POST|PUT|DELETE /api/trainee/profile/experiences[/:id]` - Create, edit, or delete work experience.
- `POST|PUT|DELETE /api/trainee/profile/certificates[/:id]` - Create, edit, or delete certificates. Verification status is read-only; certificate URL is optional.

### 4. Trainee course learning (TRAINEE only)
- `GET /api/trainee/courses` - List published courses.
- `GET /api/trainee/courses/:courseId` - Read course details, resources, own enrollment, and progress.
- `POST /api/trainee/courses/:courseId/enroll` - Enroll idempotently in a published course.
- `GET /api/trainee/courses/my` - List the trainee's own enrollments and progress.
- `GET /api/trainee/courses/:courseId/progress` - Read progress for the trainee's own enrollment.
- `POST /api/trainee/courses/:courseId/resources/:resourceId/open` - Record last accessed resource and start learning.
- `POST /api/trainee/courses/:courseId/resources/:resourceId/complete` - Complete a resource and recompute percentage/course state.

### Trainer profile and course management
- `GET|PUT /api/trainer/profile` - Read or update the authenticated trainer's profile.
- `POST|DELETE /api/trainer/profile/items[/:id]` - Add or remove a skill, competency, subject, or certification.
- `POST|PUT|DELETE /api/trainer/profile/experiences[/:id]` - Manage the trainer's own work history.
- `GET|POST /api/trainer/courses` - List owned courses or create a `DRAFT` course.
- `GET|PUT /api/trainer/courses/:courseId` - Read or edit an owned course's title, subject, description, and thumbnail.
- `PATCH /api/trainer/courses/:courseId/publish|unpublish|archive` - Change an owned course's publication state.
- `GET|POST /api/admin/trainer-courses` and `GET|PUT|PATCH /api/admin/trainer-courses/:courseId/...` - Admin-only course management; admin creation requires `trainer_user_id`.

Trainer course edits are scoped to `trainer_user_id`; admin course APIs require the ADMIN role. Trainees have no course mutation API. Published trainer-owned courses appear in the existing trainee catalog; drafts and archived courses do not.

All protected endpoints require `Authorization: Bearer <token>`. The API reloads the current account status and role from MySQL for each request. Frontend checks are not an authorization boundary.

The remaining endpoint sections below describe legacy modules outside the current profile implementation. Their previous role checks may deny users whose legacy roles were migrated.

### 4. Students (legacy)
- `GET /api/students/profile` - Fetch student profile and educational details.
- `PUT /api/students/profile` - Update student profile.
- `GET /api/students/skills` - Fetch student assessed skills and levels.
- `GET /api/students/skill-gap` - Fetch analyzed skill gaps vs industry demand.
- `GET /api/students/dashboard-summary` - Summary stats (assessments, applications, placements).

### 4. Skills & Assessments (legacy)
- `GET /api/skills` - List skills catalog and categories.
- `GET /api/assessments` - List available assessments.
- `GET /api/assessments/:id` - Get assessment details and quiz questions.
- `POST /api/assessments/:id/submit` - Submit answers, calculate score, update skill profile & gaps.
- `GET /api/recommendations/learning` - Get recommended courses/training based on gaps.

### 5. Opportunities (legacy)
- `GET /api/internships` - Search & filter internships.
- `POST /api/internships` - [INDUSTRY] Create internship posting.
- `GET /api/internships/:id` - Get internship details with required skills.
- `GET /api/jobs` - Search & filter jobs.
- `POST /api/jobs` - [INDUSTRY] Create job posting.
- `GET /api/jobs/:id` - Get job details with required skills.

### 6. Applications & Matching (legacy)
- `POST /api/applications` - Submit application for an opportunity.
- `GET /api/applications` - Get applications (Student views their own; Industry views applicants for their postings).
- `PUT /api/applications/:id/status` - [INDUSTRY] Update application status (SHORTLISTED, INTERVIEW, SELECTED, REJECTED).
- `GET /api/recommendations/internships` - [STUDENT] Get internships ranked by candidate compatibility %.
- `GET /api/recommendations/jobs` - [STUDENT] Get jobs ranked by candidate compatibility %.
- `GET /api/industry/candidates/:type/:id` - [INDUSTRY] View candidate leaderboard ranked by skill match %.

### 7. Academician & Collaboration (legacy)
- `GET /api/academician/profile` - Academician profile details.
- `GET /api/academician/opportunities` - Faculty internships, FDPs, research projects.
- `GET /api/collaborations` - List industry workshops, guest lectures, innovation challenges.
- `POST /api/collaborations` - [INDUSTRY] Post collaboration opportunity.

### 8. Institution Analytics (legacy)
- `GET /api/institution/analytics` - Comprehensive metrics on skill readiness, placement rate, department benchmarks.
- `GET /api/institution/students` - Roster of enrolled students and skill scores.
- `GET /api/institution/academicians` - Roster of faculty members.
- `GET /api/institution/partners` - Active industry MoUs and collaborations.

### 9. Digital Portfolio & Notifications (legacy)
- `GET /api/portfolio/:studentId?` - View student portfolio (public/private).
- `POST /api/portfolio/projects` - Add project to portfolio.
- `POST /api/portfolio/certifications` - Add certification.
- `GET /api/notifications` - Get user notifications.
- `PUT /api/notifications/:id/read` - Mark notification as read.

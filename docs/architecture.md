# Authentication architecture

```text
React/Vite
  └─ AuthContext validates current user through /api/auth/me
       └─ Axios sends bearer JWT
            ↓
Node.js/Express API
  └─ auth routes → authenticateUser → requireRole → auth/admin controllers
       └─ MySQL users table and shared mysql2 pool
```

The trainee professional profile follows the same modular monolith and adds a role-protected `/api/trainee` module: route validation → controller → `traineeProfileService` → existing student profile/skills/certification tables plus two trainee-owned detail tables.

Course learning extends the existing `learning_programs` catalog and adds a trainee-only API module: route validation → `traineeCourseController` → `traineeCourseService` → catalog, resources, enrollment, progress, and resource-completion tables. Course/resource reads can be public to signed-in trainees, while enrollment and progress mutations always scope through the authenticated user ID.

The existing JavaScript stack, `bcryptjs`, `jsonwebtoken`, Express validators, and MySQL pool are reused. The signing secret is required from backend environment configuration and never sent to the frontend. JWTs expire after one hour by default and carry a token-version claim. Logout, password change, account disable, and role changes increment the database token version to revoke prior tokens.

Authenticated requests reload role, account status, and token version from MySQL. The database is authoritative; client-side route guards and navigation are usability controls only. Admin endpoints use both authentication and ADMIN role middleware.

The startup auth migration is additive. It extends the role enum, adds account status and session/audit columns, and maps old role rows without deleting profile or user data. The legacy schema script contains destructive DDL and should only be used on an empty database.

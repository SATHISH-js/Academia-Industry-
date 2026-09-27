# Database and authentication migration

The project continues to use its existing MySQL database and `users` table. Backend startup applies an additive auth migration that:

- Extends `users.role` to include TRAINEE, TRAINER, and ADMIN while retaining old enum values for compatibility.
- Adds `account_status` (`PENDING`, `ACTIVE`, `DISABLED`), `token_version`, and approval audit columns.
- Maps active STUDENT accounts to TRAINEE; maps ACADEMICIAN, INDUSTRY, and INSTITUTION accounts to TRAINER; maps old inactive users to DISABLED. While trainer approval is temporarily disabled, any pending trainer is activated on startup.
- Adds trainee profile qualification fields and certificate verification status, plus work experience and interest tables. Existing student profiles, skills, and certificates are reused.
- Extends the existing `learning_programs` catalog with publication metadata and adds course resources, trainee enrollments, per-enrollment progress, and resource completion tables. Existing published programs get a starter placeholder resource when needed.

No user or profile rows are deleted. Existing password hashes remain unchanged. Old JWTs are invalidated when session middleware checks the token-version claim.

Do not run `schema.sql` against a database containing data; it includes destructive `DROP TABLE` statements from the legacy portal. On a blank database, normal backend startup initializes the legacy schema and then applies the auth migration.

## Create an administrator

After configuring database settings and `JWT_SECRET` in `backend/.env`, run this command in an interactive terminal:

```bash
npm --prefix backend run create-admin
```

It creates an ACTIVE admin with a bcrypt password hash. Admin cannot be assigned through public registration or the admin approval API.

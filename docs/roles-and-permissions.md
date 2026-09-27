# Roles and permissions

The active training platform roles are:

- `TRAINEE`: browse published programs, enroll, view program modules, and record module completion.
- `TRAINER`: create programs and modules after administrator approval; view enrollment counts.
- `ADMIN`: review trainer applications and activate or deactivate trainee/trainer/admin accounts.

Registration is open for trainees and trainer applications. Admin accounts cannot be self-registered; provision the first admin with `npm --prefix backend run create-admin` after configuring the database. Trainer accounts begin in `PENDING` state and cannot publish until an admin approves them.

The MySQL `users.role` enum still contains the former `STUDENT`, `ACADEMICIAN`, `INDUSTRY`, and `INSTITUTION` values to preserve existing rows. Those roles are not available in the new registration flow or dashboard routes. Existing account records are not automatically converted because the old roles do not map safely to the new roles without an explicit data review.

Sensitive endpoints apply JWT authentication and `requireRole` middleware in the route module. Trainer publishing also checks the trainer approval state in the controller. Admin endpoints live under `/api/admin`; training endpoints live under `/api/training`.

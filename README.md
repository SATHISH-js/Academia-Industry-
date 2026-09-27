# Training and Competency Platform

An existing JavaScript application evolved into a modular training platform with three roles: trainees, trainers, and administrators.

## Stack

- React 18 and Vite frontend
- Node.js and Express 4 API
- MySQL through `mysql2`
- JWT authentication and role-based route protection

## Local development

Install dependencies with `npm run install:all`. Configure database connection values in `backend/.env` using `backend/.env.example` as a reference, then start the backend and frontend in separate terminals with `npm run dev:backend` and `npm run dev:frontend`.

The backend creates or updates the platform tables on startup. Create the first administrator with `npm --prefix backend run create-admin`. Trainees can register from the app; trainer applications require admin approval before publishing.

## Current training workflows

- Trainees browse programs, enroll, view modules, and mark module completion. Completion is derived from completed modules.
- Approved trainers publish programs and add learning modules and resource links.
- Admins approve trainers and activate or deactivate platform accounts.

The legacy student, academician, industry, and institution tables and feature code remain in the repository for data preservation and future migration work. The new active dashboard routes use TRAINEE, TRAINER, and ADMIN. Legacy account roles are not automatically converted.

## Database safety

The legacy `database/schema.sql` contains destructive `DROP TABLE` statements for the original portal. Do not run it on a database containing data. The runtime training migration is additive and retains existing tables and rows. See [database setup](database/README.md) and [role permissions](docs/roles-and-permissions.md).

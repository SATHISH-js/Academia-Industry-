# SIH JavaScript project

This repository remains a React/Vite frontend and Node.js/Express API backed by MySQL. Implemented workflows include authentication, trainee professional profiles, and trainee course learning for the `TRAINEE`, `TRAINER`, and `ADMIN` roles.

## Local setup

Install dependencies with `npm run install:all`, then run both local servers together:

```bash
npm run dev
```

This creates `backend/.env` with a local-only random JWT secret if the file is missing. Confirm the MySQL settings in that file; local MySQL defaults target `localhost:3306/academia_industry_portal`. Open `http://localhost:5173`. The login-attempt limiter is disabled only when `NODE_ENV=development`; production keeps it enabled. Password hashing, JWT authentication, backend role checks, and account-status checks remain enabled.

Create an administrator account from an interactive terminal:

```bash
npm --prefix backend run create-admin
```

Trainees and trainers can register and sign in immediately. Admin approval and reactivation controls are temporarily unavailable. Admin accounts cannot self-register.

The trainee course workflow uses the existing `learning_programs` catalog. On backend startup, published programs receive a starter resource placeholder if they do not already have resources. Trainees can browse, enroll, and track resource completion; course publishing and trainer authoring are not part of this workflow.

## Auth API

See [the API contract](docs/api.md) and [roles and permissions](docs/roles-and-permissions.md). Backend authorization is enforced using the current database role and account status for each authenticated request.

## Existing data

Startup applies additive auth columns and maps existing `STUDENT` accounts to `TRAINEE`; existing `ACADEMICIAN`, `INDUSTRY`, and `INSTITUTION` accounts become `TRAINER`. Pending trainer accounts are activated while approval is temporarily disabled. User rows, password hashes, and legacy profile data are retained. The standalone `database/schema.sql` contains destructive legacy `DROP TABLE` statements and must not be run against a populated database.

# Roles and permissions

The active roles are `TRAINEE`, `TRAINER`, and `ADMIN`. The backend reads the user's current role and account status from MySQL on each authenticated request; frontend route checks only control navigation and are not authorization.

Account status is one of:

- `PENDING`: sign in and protected API access are blocked. Admin approval/reactivation controls are temporarily unavailable; trainer signup activates directly.
- `ACTIVE`: may sign in, subject to route-level role checks.
- `DISABLED`: sign in and protected API access are blocked.

Public registration accepts only `TRAINEE` and `TRAINER`. Both roles become active on registration. Admin accounts are created using `npm --prefix backend run create-admin`; no public endpoint can assign the ADMIN role.

## Protected APIs

| Endpoint | Access |
|---|---|
| `POST /api/auth/register` | Public; TRAINEE or TRAINER only |
| `POST /api/auth/login` | Public; only ACTIVE accounts receive a JWT |
| `POST /api/auth/logout` | Any authenticated active account; revokes all its existing tokens |
| `GET /api/auth/me` | Any authenticated active account |
| `GET /api/admin/users` | ADMIN only |
| `PATCH /api/admin/users/:id/role` | ADMIN only; TRAINEE/TRAINER only, retains current account status |
| `PATCH /api/admin/users/:id/disable` | ADMIN only; revokes sessions, protects the last active admin |

Routes use `authenticateUser` and `requireRole`. Account status and token version are checked in the database. The ADMIN role can only be assigned by the provisioning command.

## Legacy role mapping

The additive startup migration retains user rows and existing profile tables. It maps `STUDENT` to active `TRAINEE` when the old `is_active` flag is true, and maps `ACADEMICIAN`, `INDUSTRY`, and `INSTITUTION` to `TRAINER`. Previously inactive accounts become `DISABLED`; pending trainer accounts are activated while approval is temporarily disabled. No legacy account is elevated to ADMIN. Existing JWTs are invalidated because they lack the new token-version claim and must sign in again.

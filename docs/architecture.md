# Platform architecture

The application remains a JavaScript modular monolith:

```text
React + Vite
     ↓ HTTP / JSON + JWT
Node.js + Express API
     ↓
Routes → authentication / role checks → controllers → domain services
     ↓
MySQL repositories (being introduced as modules are adapted)
```

The current backend reuses a shared `mysql2` pool. Older controllers still contain SQL directly; the new training controller also uses that pool directly as a transitional pattern. Extract repositories as the training modules grow rather than changing the entire application at once.

## Active role modules

- **TRAINEE:** catalog, enrollment, modules, and completion tracking.
- **TRAINER:** trainer approval, program authoring, modules, and learner enrollment counts.
- **ADMIN:** trainer approval and account status management.

Authentication remains in `authController` with JWTs, bcrypt password hashes, `authenticateUser`, and `requireRole`. New accounts use separate trainee and trainer profiles. Admin accounts are created through the backend CLI, not public registration.

## Training data

The additive training migration creates `trainee_profiles`, `trainer_profiles`, `training_programs`, `training_modules`, `training_module_completions`, and `training_enrollments`. Learning progress is computed from completed modules. The legacy schema and feature modules remain available for data preservation but are outside the active dashboard routes.

## Deployment and migration

The backend applies the additive training migration at startup. The legacy `database/schema.sql` is destructive and should only be used on an empty database. Existing accounts keep their legacy roles; a separate data-mapping decision is needed before migrating them into the new roles.

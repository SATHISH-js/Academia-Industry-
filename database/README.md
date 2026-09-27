# Database Documentation & Setup

## Overview
The **Academia–Industry Collaboration Portal** database is designed for MySQL 8.0+.
It utilizes a single unified `users` table with strict 1-to-1 profile tables for the 4 platform roles:
1. `student_profiles`
2. `academician_profiles`
3. `industry_profiles`
4. `institution_profiles`

It also establishes relational tables for skills cataloging, assessments and automated scoring, opportunities (internships, jobs), applications with status workflow, mentorships, research collaborations, student digital portfolios, and notifications.

---

## How to Initialize Database
From the project root:

```bash
# Log in to MySQL and run schema
mysql -u root -p < database/schema.sql

# Seed initial demo data
mysql -u root -p < database/seed.sql
```

Alternatively, you can open `database/schema.sql` and `database/seed.sql` inside **MySQL Workbench** and execute them in order.

---

## Training platform setup

On server startup, the backend applies additive training tables and extends the user role enum while retaining legacy values and records. Do not run the destructive `schema.sql` against a database containing data: it contains `DROP TABLE` statements for the original portal tables.

Create the first administrator from the repository root after setting the backend database environment variables:

```bash
npm --prefix backend run create-admin
```

The command prompts for the admin name, email, and password; it does not permit public admin registration. Trainee and trainer accounts register through the web app. New trainers need admin approval before publishing.

The existing demo seed data and legacy role records are retained for reference. They are not converted automatically to TRAINEE, TRAINER, or ADMIN.

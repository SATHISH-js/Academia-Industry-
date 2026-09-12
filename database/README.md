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

## Demo Credentials
Password for all demo accounts: `Password123!`

- **Student**: `student@example.com`
- **Academician**: `academician@example.com`
- **Industry**: `industry@example.com`
- **Institution**: `institution@example.com`

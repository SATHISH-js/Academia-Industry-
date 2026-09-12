# Academia–Industry Collaboration Portal

An intelligent, full-stack enterprise collaboration portal designed to bridge the gap between academic learning and industry demands by connecting **Students**, **Academicians**, **Industries**, and **Institutions**.

---

## Key Highlights
- **Role-Based Access Control (RBAC)**: Distinct permissions and portal experiences for 4 primary roles: Student, Academician, Industry, and Institution.
- **Skill Assessment Engine**: Comprehensive technical and soft skill tests with automatic grading and proficiency scoring.
- **Skill Gap & Compatibility Matching**: Dynamic comparison between student skill proficiencies and industry opportunity demands.
- **Internship & Job Modules**: End-to-end recruitment lifecycle from posting to applicant review, shortlisting, and placement tracking.
- **Academician Opportunities**: Faculty internships, industrial training, FDPs, consultancies, and research project collaborations.
- **Institution Analytics**: Interactive Recharts dashboards analyzing department skill readiness, placement rates, and corporate partnerships.
- **Digital Student Portfolio**: Showcase student verified skills, projects, certifications, achievements, and documents.

---

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Axios, Recharts, Lucide React icons, Modern Responsive CSS.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, express-validator, multer, mysql2.
- **Database**: MySQL 8.0 with relational foreign keys, indexes, and cascades.

---

## Quick Start Guide

### 1. Database Setup
1. Ensure MySQL Server is running (e.g. MySQL 8.0 on port 3306).
2. Execute the schema and seed scripts:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## Demo Accounts (Development & Testing)
All demo accounts use the standard password: `Password123!`

| Role | Email | Password |
|---|---|---|
| **Student** | `student@example.com` | `Password123!` |
| **Academician** | `academician@example.com` | `Password123!` |
| **Industry** | `industry@example.com` | `Password123!` |
| **Institution** | `institution@example.com` | `Password123!` |

---

## Git Team Development Model
```text
main
 └── develop
      ├── feature/auth
      ├── feature/student
      ├── feature/academician
      ├── feature/industry
      └── feature/institution
```

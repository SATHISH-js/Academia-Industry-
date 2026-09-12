# Role-Based Access Control (RBAC) Matrix

## Overview
The platform defines four strictly separated roles:
- `STUDENT`: Aspiring candidates seeking skill assessments, gap analysis, mentorship, internships, and job opportunities.
- `ACADEMICIAN`: Faculty members seeking faculty internships, industrial training, FDPs, consultancies, and research collaborations.
- `INDUSTRY`: Companies seeking talent matching, posting internships, jobs, hosting mentorships, workshops, and reviewing candidate pools.
- `INSTITUTION`: Colleges/Universities tracking aggregate student performance, department skill gaps, placement metrics, and corporate partnerships.

---

## Detailed Permissions

| Resource / Action | STUDENT | ACADEMICIAN | INDUSTRY | INSTITUTION |
|---|:---:|:---:|:---:|:---:|
| **Auth & Profile** |
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| Manage Own Profile | ✅ | ✅ | ✅ | ✅ |
| **Skills & Assessments** |
| Take Assessment Tests | ✅ | ❌ | ❌ | ❌ |
| View Own Skill Profile & Gaps | ✅ | ❌ | ❌ | ❌ |
| Access Recommended Learning | ✅ | ❌ | ❌ | ❌ |
| **Opportunities** |
| Browse Internships / Jobs | ✅ | ❌ | ❌ | ❌ |
| Apply for Internships / Jobs | ✅ | ❌ | ❌ | ❌ |
| Post Internships / Jobs | ❌ | ❌ | ✅ | ❌ |
| View Applicants & Compatibility | ❌ | ❌ | ✅ | ❌ |
| Shortlist / Reject Candidates | ❌ | ❌ | ✅ | ❌ |
| **Academician Opportunities** |
| Browse Faculty Internships / FDPs | ❌ | ✅ | ❌ | ❌ |
| Apply for Research Collaborations | ❌ | ✅ | ❌ | ❌ |
| Sponsor Research / Post Programs | ❌ | ❌ | ✅ | ❌ |
| **Institutional Analytics** |
| View Campus Skill Readiness | ❌ | ❌ | ❌ | ✅ |
| View Placement Statistics | ❌ | ❌ | ❌ | ✅ |
| View Department Skill Metrics | ❌ | ❌ | ❌ | ✅ |
| Track Corporate MoUs | ❌ | ❌ | ❌ | ✅ |
| **Digital Portfolio** |
| Manage Projects & Certifications | ✅ | ❌ | ❌ | ❌ |
| Public Shareable Portfolio Link | ✅ (Public) | ❌ | ❌ | ❌ |

---

## Backend RBAC Enforcement
RBAC is enforced on every sensitive endpoint via Express middleware:

```javascript
// Example middleware composition:
router.post('/internships', authenticateUser, requireRole('INDUSTRY'), createInternship);
router.get('/institution/analytics', authenticateUser, requireRole('INSTITUTION'), getAnalytics);
```
Unauthenticated requests return `401 Unauthorized`.
Unauthorized role requests return `403 Forbidden`.

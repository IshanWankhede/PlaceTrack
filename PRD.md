# Product Requirements Document (PRD)
## Placement Management & Analytics System

---

## 1. Purpose

Build a web-based platform for a college placement cell to manage the full lifecycle of campus recruitment: student records, company/job postings, eligibility-based applications, interview tracking, placement records, and analytics reporting — replacing manual spreadsheet-based tracking.

---

## 2. Problem Statement

Placement cells currently track students, companies, and interview outcomes across scattered spreadsheets and emails. This causes:
- No single source of truth for eligibility criteria vs. student profiles
- Manual, error-prone tracking of application/interview status
- Delayed or inconsistent placement statistics
- No easy way to answer "which students are eligible for Job X?" or "what's our department-wise placement rate?"

---

## 3. Goals

| Goal | Success Metric |
|---|---|
| Centralize student & company data | 100% of student/company records digitized |
| Automate eligibility checks | Zero manual CGPA/skill cross-checking |
| Streamline application → interview → placement flow | Status visible in real time to staff and students |
| Provide placement analytics | Dashboard answers key stats without manual Excel work |
| Ensure data integrity | No orphaned records; placement auto-created on selection |

### Non-Goals (v1)
- Resume parsing / AI-based résumé screening
- Email/SMS notification system (future phase)
- Multi-institution / multi-tenant support
- Mobile native apps (web-responsive only)

---

## 4. Target Users / Personas

| Persona | Role | Key Needs |
|---|---|---|
| **Placement Officer (Admin)** | Manages companies, jobs, oversees drives | Add/edit companies & jobs, view analytics, update application/interview status |
| **Placement Coordinator (Staff)** | Day-to-day data entry | Add students, update interview results, mark placements |
| **Student** | Applicant | View eligible jobs, apply, track application/interview status |
| **Department Head (optional viewer)** | Oversight | View department-wise placement stats |

---

## 5. User Stories

### Student
- As a student, I want to see only the jobs I'm eligible for, so I don't waste time applying to jobs I don't qualify for.
- As a student, I want to view my application and interview status in one place.
- As a student, I want to see my final placement details once selected.

### Placement Staff / Admin
- As a staff member, I want to add/edit student records including skills and CGPA.
- As an admin, I want to post a job with eligibility criteria (min CGPA, department, required skills).
- As an admin, I want to see a list of eligible students for a given job before the drive.
- As a staff member, I want to update an application's status as it moves through interview rounds.
- As an admin, when a student is marked SELECTED, I want the placement record created automatically — no manual duplicate entry.
- As an admin, I want a dashboard showing placement rate, average package, and top recruiting companies.

---

## 6. Functional Scope (v1)

1. **Authentication** — staff/admin login (JWT-based)
2. **Student Management** — CRUD, skill tagging with proficiency
3. **Company Management** — CRUD
4. **Job Management** — CRUD, define eligibility (min CGPA, required skills, department scope)
5. **Eligibility Engine** — checks CGPA, department, skills; surfaces eligible students per job and eligible jobs per student
6. **Application Workflow** — students apply to eligible jobs; status lifecycle: `APPLIED → SHORTLISTED → INTERVIEW → SELECTED/REJECTED` (or `WITHDRAWN`)
7. **Interview Tracking** — multiple rounds per application (type, schedule, result, remarks)
8. **Placement Records** — auto-created on selection via DB trigger; viewable/exportable
9. **Analytics Dashboard** — placement rate, department-wise placement, company selection counts, package distribution, top package, above-average CGPA list

---

## 7. Out of Scope (v1)
- Payment/offer-letter document generation
- Resume upload & storage
- Real-time chat between students and recruiters
- SSO / third-party auth integration

---

## 8. Key Workflows

### 8.1 Job Posting & Eligibility
```
Admin creates Job → sets min_cgpa, department scope, required skills
        ↓
System computes eligible students (CGPA ✓, Dept ✓, Skills ✓)
        ↓
Eligible students see job in "Available Jobs" with an "Apply Now" CTA
```

### 8.2 Application Lifecycle
```
Student applies → APPLIED
        ↓ (staff review)
   SHORTLISTED → INTERVIEW (1+ rounds) → SELECTED or REJECTED
        ↓ (student can also)
   WITHDRAWN (at any point before SELECTED)
```

### 8.3 Placement Automation
```
application.status set to SELECTED
        ↓ (DB trigger)
placements record auto-inserted (student, job, company, package, date)
```

---

## 9. Success Metrics (Post-Launch)

- Placement cell fully stops using spreadsheets for active drives within 1 semester
- 100% of "SELECTED" applications have a corresponding placement record (data integrity check)
- Analytics dashboard used at least weekly by admin during placement season
- Average time to determine job eligibility list reduced from manual (hours) to instant (API call)

---

## 10. Release Plan (Maps to Architecture Phases)

| Release | Scope |
|---|---|
| v0.1 (Internal) | Student/Department CRUD, Auth |
| v0.2 | Company/Job CRUD, Eligibility Engine |
| v0.3 | Applications + Interviews |
| v0.4 | Placements + Trigger Automation |
| v1.0 | Analytics Dashboard, polish, testing |

---

## 11. Open Questions

- Can a student hold multiple simultaneous offers before choosing one (affects `placements.student_id` uniqueness)?
- Should department-restricted jobs be supported (i.e., a job open only to specific departments)?
- Is there a need for role-based access (Admin vs. Staff vs. read-only viewer) in v1, or is a single staff role sufficient?
- Should rejected/withdrawn applications be re-appliable, or locked permanently?

# Full Stack Job Portal — Implementation Plan

A production-grade job portal with role-based access (Job Seeker, Recruiter, Admin), JWT authentication, resume uploads, and email notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, Axios, React Hook Form |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens) + bcrypt |
| File Uploads | Multer + Cloudinary (resume PDFs) |
| Email | Nodemailer + Gmail SMTP (or SendGrid) |
| Styling | Vanilla CSS with CSS Variables (dark mode, glassmorphism) |

---

## User Review Required

> [!IMPORTANT]
> **Email Configuration**: Email notifications require an SMTP provider. The plan uses **Nodemailer + Gmail** (requires an App Password). If you have a **SendGrid** or **Mailtrap** account instead, let me know and I'll configure accordingly.

> [!IMPORTANT]
> **File Storage**: Resumes will be uploaded to **Cloudinary** (free tier). You'll need a Cloudinary account. If you prefer local disk storage instead, mention it and I'll skip Cloudinary.

> [!WARNING]
> **MongoDB**: The plan uses **MongoDB Atlas** (cloud, free tier). A local MongoDB instance also works. Please confirm which you prefer (I'll default to Atlas with a connection string you provide later).

---

## Open Questions

> [!NOTE]
> 1. Do you want **real email sending** (Nodemailer/SendGrid) or just console-logged mock emails for now?
> 2. Cloudinary for resume uploads, or local disk (`/uploads` folder)?
> 3. MongoDB Atlas or Local (`mongodb://localhost:27017/jobportal`)?
> 4. Should I generate a `.env.example` file with all required secrets so you can fill them in?

---

## Proposed Changes

### Project Structure

```
job portal/
├── backend/
│   ├── config/          # DB connection, Cloudinary, Nodemailer
│   ├── controllers/     # auth, jobs, applications, users, admin
│   ├── middleware/      # auth (JWT verify), role guard, multer upload
│   ├── models/          # User, Job, Application
│   ├── routes/          # /api/auth, /api/jobs, /api/applications, /api/admin
│   ├── utils/           # email templates, token helpers
│   ├── .env             # secrets (gitignored)
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance + API calls
    │   ├── components/   # Navbar, JobCard, Modal, ResumeUpload, etc.
    │   ├── context/      # AuthContext (global user state)
    │   ├── hooks/        # useAuth, useJobs
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── Jobs.jsx (browse/search)
    │   │   ├── JobDetail.jsx
    │   │   ├── Dashboard/
    │   │   │   ├── RecruiterDashboard.jsx  (post/manage jobs)
    │   │   │   ├── SeekerDashboard.jsx     (my applications)
    │   │   │   └── AdminDashboard.jsx       (users, jobs, stats)
    │   │   └── Profile.jsx
    │   ├── styles/        # global.css, variables.css, components css
    │   └── main.jsx
    └── vite.config.js
```

---

### Backend

#### [NEW] `backend/models/User.js`
Fields: `name`, `email`, `password (hashed)`, `role (seeker|recruiter|admin)`, `avatar`, `resumeUrl`, `resumePublicId`, `appliedJobs[]`, `createdAt`

#### [NEW] `backend/models/Job.js`
Fields: `title`, `company`, `location`, `type (full-time|part-time|remote|contract)`, `salary`, `description`, `requirements[]`, `postedBy (ref: User)`, `applicants[]`, `deadline`, `isActive`, `createdAt`

#### [NEW] `backend/models/Application.js`
Fields: `job (ref: Job)`, `applicant (ref: User)`, `resumeUrl`, `coverLetter`, `status (pending|reviewed|shortlisted|rejected)`, `appliedAt`

#### [NEW] `backend/routes/auth.js`
- `POST /api/auth/register` — register with role selection
- `POST /api/auth/login` — returns JWT access token
- `GET /api/auth/me` — get current user (protected)
- `POST /api/auth/logout`

#### [NEW] `backend/routes/jobs.js`
- `GET /api/jobs` — paginated, filterable job listing
- `GET /api/jobs/:id` — job detail
- `POST /api/jobs` — create job (recruiter only)
- `PUT /api/jobs/:id` — update job (recruiter who posted)
- `DELETE /api/jobs/:id` — delete job

#### [NEW] `backend/routes/applications.js`
- `POST /api/applications/:jobId` — apply to job (seeker, with resume upload)
- `GET /api/applications/my` — seeker's applications
- `GET /api/applications/job/:jobId` — applicants for a job (recruiter)
- `PATCH /api/applications/:id/status` — update status (recruiter)

#### [NEW] `backend/routes/admin.js`
- `GET /api/admin/stats` — total users, jobs, applications
- `GET /api/admin/users` — all users with pagination
- `DELETE /api/admin/users/:id` — remove user
- `GET /api/admin/jobs` — all jobs

#### [NEW] `backend/middleware/auth.js`
JWT verification middleware + `requireRole(...roles)` guard

#### [NEW] `backend/utils/sendEmail.js`
Nodemailer helper for:
- Welcome email on register
- Application confirmation to seeker
- New applicant notification to recruiter
- Status update notification

---

### Frontend

#### [NEW] `frontend/src/context/AuthContext.jsx`
Global auth state with `user`, `login()`, `logout()`, `register()`. Persists JWT to localStorage.

#### [NEW] `frontend/src/pages/Home.jsx`
Hero section, stats counter (jobs, companies, seekers), featured jobs carousel, CTA.

#### [NEW] `frontend/src/pages/Jobs.jsx`
Searchable, filterable job listing with pagination. Filters: keyword, location, job type, salary range.

#### [NEW] `frontend/src/pages/JobDetail.jsx`
Full job detail + Apply Now modal (cover letter + resume upload).

#### [NEW] `frontend/src/pages/Dashboard/RecruiterDashboard.jsx`
- Post new job form
- List of posted jobs with applicant counts
- View applicants per job, update their status

#### [NEW] `frontend/src/pages/Dashboard/SeekerDashboard.jsx`
- My applications with status badges
- Profile completion card
- Upload/update resume

#### [NEW] `frontend/src/pages/Dashboard/AdminDashboard.jsx`
- Stats cards (users, jobs, applications)
- User management table (view, delete)
- Job management table

#### [NEW] `frontend/src/styles/`
CSS Variables system: dark theme, glassmorphism cards, gradient accents, animated backgrounds.

---

## Features Summary

| Feature | Included |
|---|---|
| JWT Auth (register/login/logout) | ✅ |
| Role-based access (seeker/recruiter/admin) | ✅ |
| Job posting & management | ✅ |
| Job search & filtering | ✅ |
| Apply for jobs | ✅ |
| Resume upload (Cloudinary) | ✅ |
| Application status tracking | ✅ |
| Admin dashboard | ✅ |
| Email notifications | ✅ |
| Responsive design (mobile-first) | ✅ |
| Dark mode UI (glassmorphism) | ✅ |

---

## Verification Plan

### Automated
- Backend: `node server.js` — verify all routes respond correctly using REST client
- Frontend: `npm run dev` — verify all pages render without errors

### Manual Verification (browser testing)
1. Register as **Seeker** → verify welcome email → browse jobs → apply → check application status
2. Register as **Recruiter** → post a job → view applicants → update status → verify email sent to applicant
3. Login as **Admin** → verify dashboard stats → manage users/jobs
4. Test **JWT protection** — attempt to access protected routes without token
5. Test **resume upload** — upload PDF and verify Cloudinary URL stored

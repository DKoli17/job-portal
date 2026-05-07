# 💼 JobPortal — Full Stack Job Board

A production-grade full-stack job portal built with **React**, **Node.js/Express**, and **MongoDB**. Features JWT authentication, role-based access, resume uploads to Cloudinary, and real email notifications.

![Home Page](https://res.cloudinary.com/dujvyvz1q/image/upload/v1778142594/Screenshot_2026-05-07_135643_tvmmic.png)

---
## Deployed via Vercel

[Link](https://job-portal-eozx.vercel.app/)

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based login/register with bcrypt hashing |
| 👥 Roles | Job Seeker · Recruiter · Admin |
| 📋 Job Listings | Post, search, filter (type, category, experience, salary) |
| 📝 Apply for Jobs | Cover letter + resume upload |
| 📁 Resume Upload | Cloudinary (PDF/DOC, max 5MB) |
| 📊 Dashboards | Seeker (track apps) · Recruiter (manage jobs + applicants) · Admin (full control) |
| 📧 Email Notifications | Welcome, application confirmation, status updates (Nodemailer + Gmail) |
| 🎨 UI | Dark glassmorphism, animated gradients, fully responsive |

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · React Router v6 · Axios · React Hook Form · Lucide Icons

**Backend:** Node.js · Express · Mongoose · JWT · bcryptjs · Multer · Nodemailer

**Database:** MongoDB

**Storage:** Cloudinary (resumes)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)
- [Cloudinary](https://cloudinary.com/) account (free tier)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/job-portal.git
cd job-portal
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your credentials in `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=JobPortal <your_email@gmail.com>
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@jobportal.com` / `admin123`
- Recruiter: `recruiter@techcorp.com` / `password123`
- Seeker: `seeker@example.com` / `password123`
- 6 sample job listings

### 4. Setup Frontend

```bash
cd frontend
npm install
```

### 5. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```


---

## 📁 Project Structure

```
job-portal/
├── backend/
│   ├── config/           # DB, Cloudinary setup
│   ├── controllers/      # Auth, Jobs, Applications, Admin
│   ├── middleware/        # JWT auth + role guard
│   ├── models/            # User, Job, Application (Mongoose)
│   ├── routes/            # API routes
│   ├── utils/             # Email templates, token helper
│   ├── seed.js            # Database seeder
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── api/            # Axios client + all API calls
        ├── components/     # Navbar, JobCard, ProtectedRoute
        ├── context/        # AuthContext (global auth state)
        └── pages/
            ├── Home, Login, Register, Jobs, JobDetail, Profile
            └── Dashboard/  # Seeker · Recruiter · Admin
```

---

## 🔌 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Get current user |
| PUT | `/api/auth/profile` | Protected | Update profile |
| POST | `/api/auth/upload-resume` | Protected | Upload resume |
| GET | `/api/jobs` | Public | Browse & search jobs |
| GET | `/api/jobs/:id` | Public | Job detail |
| POST | `/api/jobs` | Recruiter | Post a job |
| PUT | `/api/jobs/:id` | Recruiter | Update job |
| DELETE | `/api/jobs/:id` | Recruiter | Delete job |
| POST | `/api/applications/:jobId` | Seeker | Apply for job |
| GET | `/api/applications/my` | Seeker | My applications |
| GET | `/api/applications/job/:jobId` | Recruiter | Applicants for job |
| PATCH | `/api/applications/:id/status` | Recruiter | Update status |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

---

## 📧 Email Notifications

- ✅ Welcome email on registration
- ✅ Application confirmation to seeker
- ✅ New applicant alert to recruiter
- ✅ Status update when recruiter reviews application

> To enable: add your Gmail App Password to `backend/.env`

---

## 📄 License

MIT — feel free to use and modify for your own projects.

---

**Built with ❤️ using React + Node.js + MongoDB**

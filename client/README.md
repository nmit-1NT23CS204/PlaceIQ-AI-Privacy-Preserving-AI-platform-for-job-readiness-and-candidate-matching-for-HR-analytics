# JobMatch AI 🤖

**Privacy-Preserving AI Platform for Job Readiness Prediction & Candidate Matching**

> Final Year Major Project — Nitte Meenakshi Institute of Technology (VTU)

---

## 🚀 Quick Start (VS Code)

### 1. Prerequisites
- Node.js v18+ installed → [nodejs.org](https://nodejs.org)
- VS Code with recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense)

### 2. Install & Run

```bash
# Navigate to the project folder
cd jobmatch-ai

# Install all dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎭 Login Roles

The platform has **3 roles** — select on the login page:

| Role | Dashboard | Access |
|------|-----------|--------|
| **Student** | Dashboard, AI Analysis, Skill Gap, Job Matching, Recommended, Profile | Full student features |
| **Recruiter** | Dashboard, Post Job, Candidates Table | Hiring management |
| **Admin** | Analytics, User Growth, System Status | Platform monitoring |

> Email and password fields are UI-only in this phase (any value works).

---

## 📁 Project Structure

```
jobmatch-ai/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login with role switcher
│   │   ├── Dashboard.jsx          # Student home dashboard
│   │   ├── UploadResume.jsx       # Resume upload with animation
│   │   ├── AIAnalysis.jsx         # AI analysis results
│   │   ├── SkillGap.jsx           # Skill gap breakdown
│   │   ├── MatchedJobs.jsx        # Job match listing
│   │   ├── Recommended.jsx        # Course/project recommendations
│   │   ├── Profile.jsx            # User profile with tabs
│   │   ├── RecruiterDashboard.jsx # Recruiter overview
│   │   ├── RecruiterCandidates.jsx# Candidate management table
│   │   └── AdminDashboard.jsx     # Admin analytics & monitoring
│   ├── components/
│   │   ├── DashboardLayout.jsx    # Sidebar + header layout
│   │   └── UIComponents.jsx       # Shared reusable components
│   ├── context/
│   │   └── AuthContext.jsx        # Authentication state
│   ├── App.jsx                    # Routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind + custom styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🎨 Design System

- **Theme**: Dark Corporate (matching design mockup)
- **Primary Color**: Gold `#f5a623`
- **Accent Colors**: Blue `#4f8ef7`, Green `#22c55e`, Purple `#7c5cbf`
- **Fonts**: Rajdhani (display/headers), Nunito (body), JetBrains Mono (data)
- **Framework**: React 18 + Vite + Tailwind CSS v3
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router DOM v6 |
| State | React Context API |

---

## 📦 Build for Production

```bash
npm run build
# Output in /dist folder
```

---

## 👥 Team

| Name | USN |
|------|-----|
| Saharish Khan | 1NT23CS204 |
| Samprati Sinha | 1NT23CS209 |
| Aditya Kumar Bharti | 1NT23CS012 |
| Altamash Anwar | 1NT23CS022 |

**Guide**: Ms. Shruthi Shetty J, Dept. of CSE, NMIT

---

## 📝 Academic Reference

VTU Major Project Work–Phase 1 | Academic Year 2025–26

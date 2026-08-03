# PlaceIQ – Complete Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Service Breakdown](#4-service-breakdown)
5. [Authentication Flow](#5-authentication-flow)
6. [Resume Upload & Analysis Flow](#6-resume-upload--analysis-flow)
7. [AI Service Deep Dive](#7-ai-service-deep-dive)
8. [Readiness Score Algorithm](#8-readiness-score-algorithm)
9. [Skill Gap Analysis Algorithm](#9-skill-gap-analysis-algorithm)
10. [Job Matching Algorithm](#10-job-matching-algorithm)
11. [Candidate Matching (Recruiter View)](#11-candidate-matching-recruiter-view)
12. [Interview Feedback Analysis](#12-interview-feedback-analysis)
13. [Reinforcement Learning Feedback Loop](#13-reinforcement-learning-feedback-loop)
14. [Firestore Data Model](#14-firestore-data-model)
15. [API Reference](#15-api-reference)
16. [Frontend Pages & Routing](#16-frontend-pages--routing)
17. [Docker & Deployment](#17-docker--deployment)
18. [User Roles & Permissions](#18-user-roles--permissions)

---

## 1. Project Overview

**PlaceIQ** is an AI-powered campus placement intelligence platform. It connects three types of users — **Students**, **Recruiters**, and **Admins (TPO)** — through an intelligent pipeline that:

- Parses and analyses student resumes using NLP
- Calculates an **AI Readiness Score** for each student
- Identifies **skill gaps** compared to target roles
- **Matches students to live remote jobs** using semantic similarity + skill overlap
- Allows **recruiters to submit a JD** and get an AI-ranked shortlist of candidates
- Records **interview feedback** and labels competencies automatically
- Simulates a **reinforcement learning loop** to improve matching accuracy over time

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                   │
│   Login | Dashboard | Upload Resume | Skill Gap | Matched Jobs  │
│   Recruiter Dashboard | Admin Dashboard | Profile               │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP (via /api/*)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY (:80)                    │
│   /api/*  → Backend :5000                                       │
│   /ai/*   → AI Service :8000                                    │
│   /*      → Frontend :80                                        │
└───────┬───────────────────────────────┬─────────────────────────┘
        │                               │
        ▼                               ▼
┌───────────────────┐        ┌──────────────────────────┐
│  Node.js Backend  │        │  Python FastAPI AI Svc   │
│  Express :5000    │◄──────►│  Uvicorn :8000           │
│  Firebase Admin   │        │  SentenceBERT Model      │
│  Multer Upload    │        │  all-MiniLM-L6-v2        │
└───────┬───────────┘        └──────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│           Firebase / Firestore        │
│  users | resume_profiles              │
│  placement_drives | applications      │
└───────────────────────────────────────┘
        +
┌───────────────────┐
│   MongoDB         │
│  (Mongoose ODM)   │
│  PlacementDrive   │
│  Application      │
└───────────────────┘
        +
┌───────────────────┐
│   Remotive API    │
│  (Live remote     │
│   job listings)   │
└───────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express.js, Multer (file upload) |
| **AI Service** | Python 3, FastAPI, Uvicorn |
| **AI Model** | `sentence-transformers/all-MiniLM-L6-v2` (Sentence-BERT) |
| **NLP Libraries** | `sentence-transformers`, `numpy`, `scikit-learn` |
| **Resume Parsing** | `pypdf` (PDF), `python-docx` (DOCX) |
| **Auth** | Firebase Authentication (Email/Password, Google OAuth, GitHub OAuth) |
| **Primary DB** | Google Firestore (resume profiles, users) |
| **Secondary DB** | MongoDB + Mongoose (placement drives, applications) |
| **Live Jobs API** | Remotive.com Public API |
| **Containerisation** | Docker, Docker Compose |
| **Reverse Proxy** | Nginx (stable-alpine) |

---

## 4. Service Breakdown

### 4.1 Frontend (`/client`)
- Built with **React + Vite**
- Uses **Firebase Client SDK** for authentication
- Communicates with backend via Axios (`/api/*`)
- Role-based routing: students, recruiters, admins see different dashboards

### 4.2 Backend (`/server`)
- **Express.js** REST API
- **Firebase Admin SDK** to verify JWT tokens on every protected route
- **Multer** for handling multipart file uploads (resume files saved to `/uploads`)
- Proxies AI requests via `aiService.js` utility (Axios calls to FastAPI)
- Writes processed resume data to **Firestore**

### 4.3 AI Service (`/ai-service`)
- **FastAPI** Python microservice
- Loads **Sentence-BERT** model (`all-MiniLM-L6-v2`) at startup
- Exposes REST endpoints for: resume processing, readiness scoring, gap analysis, job matching, candidate matching, feedback analysis, and outcome recording
- Runs on port **8000**

---

## 5. Authentication Flow

```
User opens app
      │
      ▼
Firebase Auth (client-side)
  - Email/Password login
  - Google OAuth popup
  - GitHub OAuth popup
      │
      ▼
Firebase issues ID Token (JWT)
      │
      ▼
Client stores token, attaches to every API call:
  Authorization: Bearer <Firebase_ID_Token>
      │
      ▼
Backend middleware/auth.js:
  1. Extracts token from Authorization header
  2. Calls admin.auth().verifyIdToken(token)  ← Firebase Admin SDK
  3. Looks up user document in Firestore `users` collection
  4. Attaches { id, name, email, role } to req.user
  5. Calls next() → route handler
      │
      ▼
Role-based authorization via authorize('student' | 'recruiter' | 'admin')
```

**User Registration** creates a document in Firestore `users` collection with fields: `name`, `email`, `role`, `createdAt`.

---

## 6. Resume Upload & Analysis Flow

This is the core pipeline of PlaceIQ. Here is the complete end-to-end flow when a student uploads a resume:

```
Student selects career goal (e.g. "Full Stack Developer")
      │
      ▼
Student drops / selects PDF or DOCX file
      │
      ▼
[Frontend] POST /api/resume/upload
  - multipart/form-data: { file, targetRole }
  - Authorization: Bearer <token>
      │
      ▼
[Backend] routes/resume.js
  - protect middleware verifies Firebase token
  - authorize('student') checks role
  - Multer saves file to /uploads/<userId>-<timestamp>.pdf
      │
      ▼
[Backend] controllers/resume.js → uploadResume()
      │
      ├──► Step 1: aiService.processResume(filePath)
      │         → POST /process-resume to AI service
      │         ← Returns: { skills[], embedding[384], word_count, text_preview }
      │
      ├──► Step 2: Fetch existing Firestore profile (resume_profiles/<userId>)
      │         to get stored CGPA / readiness history
      │
      ├──► Step 3: aiService.calculateReadiness({ skills, word_count, cgpa, coding_score })
      │         → POST /calculate-readiness to AI service
      │         ← Returns: { readiness_score, breakdown: { skill_score, resume_depth, performance_score } }
      │
      ├──► Step 4: (if targetRole provided) aiService.analyzeGaps(targetRole, skills)
      │         → POST /analyze-gaps to AI service
      │         ← Returns: { match_percentage, matching_skills[], missing_skills[], suggestion }
      │
      ├──► Step 5: Write updated profile to Firestore
      │         Collection: resume_profiles / Document: <userId>
      │         Fields: skills, embedding, readinessScore, readinessHistory,
      │                 skillGaps, academicRecord, lastUpdated
      │
      ├──► Step 6: Delete uploaded file from disk (fs.unlinkSync)
      │
      └──► Step 7: Return JSON response to frontend
               { success, skills, readinessScore, textPreview, gapData }
      │
      ▼
[Frontend] Displays results:
  - Readiness Score (%)
  - Number of skills found
  - Gap analysis bar + missing skills
  - AI Recommendation text
  - Raw extracted text preview
```

---

## 7. AI Service Deep Dive

### The AI Model: `all-MiniLM-L6-v2` (Sentence-BERT)

**Model type:** Sentence Transformer (a fine-tuned BERT variant)
**Source:** HuggingFace — `sentence-transformers/all-MiniLM-L6-v2`
**Output:** A **384-dimensional dense vector** (embedding) representing the semantic meaning of any input text

**Why this model?**
- Lightweight and fast — suitable for a microservice that processes requests on-demand
- Trained on a massive corpus of sentence pairs; excellent at capturing **semantic similarity**
- `util.cos_sim()` from `sentence-transformers` can efficiently compare two embeddings
- Free, open-source, no API key needed

**How it is loaded:**
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

The model is loaded **once at startup** (not per request) and shared across all endpoints.

### Step 1 — Resume Text Extraction

**File:** `ai-service/main.py` → `get_text_from_file()`

| Format | Library | Method |
|---|---|---|
| PDF | `pypdf` | `PdfReader` → iterate pages → `extract_text()` |
| DOCX | `python-docx` | `Document` → iterate paragraphs → `.text` |

**Post-processing fix:** PDFs sometimes extract text with single spaces between each character (e.g., `P y t h o n`). The service fixes this using:
```python
text = re.sub(r'(?<=\b[A-Za-z0-9]) (?=[A-Za-z0-9]\b)', '', text)
```

### Step 2 — Skill Extraction

**Function:** `extract_skills_from_text(text)`

Uses a **predefined skills database** (`SKILLS_DB`) containing ~60 technologies across categories:
- Programming Languages: Python, Java, JavaScript, TypeScript, C++, Go, Rust, Swift
- Frontend: React, Angular, Vue, HTML5, CSS3
- Backend: Node.js, Express, FastAPI, Django, Flask
- Databases: SQL, PostgreSQL, MongoDB, Redis, Elasticsearch
- Cloud & DevOps: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, Terraform
- AI/ML: Machine Learning, Deep Learning, NLP, PyTorch, TensorFlow, Scikit-learn
- Tools: Git, GitHub, Agile, Scrum, REST API, GraphQL

**Detection method:** Regex with word-boundary guards to avoid false positives:
```python
pattern = rf'(?<![a-zA-Z0-9]){re.escape(skill)}(?![a-zA-Z0-9])'
re.search(pattern, text, re.IGNORECASE)
```

This ensures `"JavaScript"` matches `"JS"` correctly but not as a substring of another word.

### Step 3 — Embedding Generation

```python
embedding = model.encode(text).tolist()
```

The **entire resume text** is encoded into a single **384-float vector**. This vector captures the overall semantic fingerprint of the candidate's experience and background. It is stored in Firestore and used for all future matching operations without reprocessing.

---

## 8. Readiness Score Algorithm

**Endpoint:** `POST /calculate-readiness`
**Function:** `calculate_readiness_score(req: ReadinessRequest)`

The readiness score is a **composite weighted score out of 100** based on three dimensions:

### Component 1: Skill Diversity (Max 50 points)
```
skill_score = min(number_of_extracted_skills × 5, 50)
```
- 0 skills → 0 points
- 5 skills → 25 points
- 10+ skills → 50 points (capped)

**Rationale:** A candidate with diverse, recognisable technical skills is more placement-ready.

### Component 2: Resume Depth (Max 30 points)
```
if word_count > 500  → +30 points   (Detailed, comprehensive resume)
if word_count > 300  → +20 points   (Good depth)
if word_count > 100  → +10 points   (Basic resume)
else                 → +0 points
```

**Rationale:** A well-written resume with substantial content indicates the candidate has relevant experience to describe.

### Component 3: Academic Performance (Max 20 points)
```
perf_score = min(cgpa, 10) + (coding_score / 10)
score += min(perf_score, 20)
```
- CGPA (on 10.0 scale) contributes up to 10 points
- Coding test score (out of 100) contributes up to 10 points
- Combined capped at 20 points

**Current defaults (backend):** `cgpa = 8.0`, `coding_score = 75`

### Final Formula
```
readiness_score = skill_score + resume_depth_score + min(perf_score, 20)
```

**Breakdown is also returned** in the API response so the frontend can display individual component scores.

---

## 9. Skill Gap Analysis Algorithm

**Endpoint:** `POST /analyze-gaps`
**Function:** `analyze_skill_gaps(req: GapAnalysisRequest)`

### Job Roles Database
The AI service maintains a `JOB_ROLES_DB` dictionary mapping each role to its required skills:

| Role | Required Skills |
|---|---|
| Full Stack Developer | React, Node.js, Express, MongoDB, JavaScript, HTML, CSS, REST API |
| Frontend Developer | React, JavaScript, HTML, CSS, TypeScript, Angular, Vue |
| Backend Developer | Python, Node.js, Express, SQL, PostgreSQL, REST API, Docker, Redis |
| Data Scientist | Python, Machine Learning, Data Science, Pandas, NumPy, Scikit-learn, SQL, NLP |
| AI/ML Engineer | Python, PyTorch, TensorFlow, Deep Learning, Machine Learning, NLP, Computer Vision |
| DevOps Engineer | Docker, Kubernetes, AWS, Azure, GCP, Jenkins, Terraform, Git |

### Algorithm
```python
required_skills = JOB_ROLES_DB[target_role]
user_skills_set = set(s.lower() for s in user_skills)

matching = [s for s in required_skills if s.lower() in user_skills_set]
missing  = [s for s in required_skills if s.lower() not in user_skills_set]

match_percentage = (len(matching) / len(required_skills)) * 100
```

**Output:**
- `match_percentage`: How well the candidate fits the role (0–100%)
- `matching_skills`: Skills the candidate already has
- `missing_skills`: Skills the candidate needs to learn
- `suggestion`: "To improve your match for X, consider learning: Y, Z, W"

The gap is stored in Firestore as: `{ domain, gapPercentage, suggestion }`.

---

## 10. Job Matching Algorithm

**Endpoint:** `POST /match-jobs`
**Trigger:** Student visits "Matched Jobs" page
**Live Data Source:** Remotive.com Public API (`/api/remote-jobs?category=software-dev&limit=20`)

### Full Flow
```
[Frontend] visits /matched-jobs
      ▼
[Backend] GET /api/jobs/match
  1. Load student profile from Firestore (skills, embedding[384], readinessScore)
  2. Fetch 20 live jobs from Remotive API
  3. Format each job: { id, title, description (HTML stripped, 1000 chars), required_skills (tags) }
  4. POST /match-jobs to AI service
      ▼
[AI Service] match_jobs()
  For each job:
    a. Skill Match Score
    b. Semantic Match Score
    c. Hybrid Final Score
  Sort by final score descending
      ▼
[Backend] Merge AI scores with original job metadata
  Returns: { title, company, location, type, match%, skills, url, explanation }
```

### Hybrid Scoring Formula

```
final_score = (skill_score × 0.5) + (semantic_score × 0.3) + (readiness_normalized × 0.2)
```

**a) Skill Match Score (50% weight)**
```python
job_skills_set = set(s.lower() for s in job.required_skills)
matching_skills = [s for s in job.required_skills if s.lower() in candidate_skills_set]
skill_score = len(matching_skills) / len(job_skills_set)   # 0.0 to 1.0
```

**b) Semantic Match Score (30% weight) — Sentence-BERT**
```python
job_text = f"{job.title} {job.description}"
job_emb = model.encode(job_text)                           # 384-dim vector
semantic_score = util.cos_sim(candidate_emb, job_emb)[0][0]  # cosine similarity
semantic_score = max(0, min(1, semantic_score))            # clamped to [0, 1]
```

Cosine similarity measures the **angle between two vectors** in 384-dimensional space. If the candidate's resume and the job description talk about similar concepts (even with different words), cosine similarity will be high.

**c) Readiness Normalization (20% weight)**
```python
readiness_normalized = candidate_readiness_score / 100.0   # 0.0 to 1.0
```

**Final score is multiplied by 100** before returning (i.e., expressed as a percentage).

### Explanation Generation
The AI service auto-generates a human-readable explanation:
- Lists top matching skills
- Comments on semantic alignment ("High/Moderate semantic alignment with job description")
- Gives an overall verdict ("Excellent fit" / "Strong candidate")

---

## 11. Candidate Matching (Recruiter View)

**Endpoint:** `POST /match-candidates`
**Trigger:** Recruiter submits a Job Description

### Flow
```
[Frontend] Recruiter Dashboard
  - Inputs: Job Title, JD text, Required Skills
      ▼
[Backend] POST /api/recruiters/match
  1. Fetch ALL student profiles from Firestore `resume_profiles`
  2. For each profile, fetch user name/email from Firestore `users`
  3. Build candidatesData[]: { id, name, skills[], embedding[384], readiness_score }
  4. POST /match-candidates to AI service
      ▼
[AI Service] match_candidates()
  - Encodes the JD text ONCE into a job embedding
  - For each candidate:
      a. Skill match score (same formula as job matching)
      b. Semantic match: cos_sim(job_emb, candidate_emb)
      c. Hybrid score: 50% skills + 30% semantic + 20% readiness
  - Returns ranked list of candidates
      ▼
[Backend] Returns ranked candidates to Recruiter UI
```

The same **50/30/20 hybrid formula** is used, but from the recruiter's perspective:
- The **JD** is encoded as the reference embedding
- Each **candidate's stored embedding** is compared against it

---

## 12. Interview Feedback Analysis

**Endpoint:** `POST /analyze-feedback`
**Trigger:** Feedback text submitted via `/api/resume/interview-feedback`

### Competency Detection (Keyword Classification)
The AI service uses a **keyword-based classification** approach:

| Competency | Trigger Keywords |
|---|---|
| Communication | verbal, speaking, clear, articulate, presentation, explained, fluency |
| Problem Solving | logic, analytical, algorithms, structured, puzzle, optimization, approach |
| Technical Depth | coding, architecture, database, system, framework, debugging, implementation |
| Leadership | team, lead, management, initiative, ownership, collaboration, mentor |

Each keyword that appears in the feedback text increments the competency's count. Competencies with count > 0 are reported.

### Sentiment Detection
```python
is_positive = any(word in text for word in ["good","great","excellent","strong","impressive","positive"])
sentiment = "Positive" if is_positive else "Neutral/Critical"
```

### Score Impact on Readiness
After feedback is analysed, the student's readiness score is updated:
```
Positive feedback  → readinessScore += 5
Neutral/Critical   → readinessScore -= 5
(Clamped 0–100)
```

The feedback entry (with competencies, sentiment, score impact) is appended to `interviewFeedback[]` array in Firestore and added to `readinessHistory[]`.

---

## 13. Reinforcement Learning Feedback Loop

**Endpoint:** `POST /record-outcome`
**Purpose:** Simulate a feedback loop to improve matching quality over time

When a placement outcome is known (offered / rejected):
```
Backend calls POST /record-outcome with:
  { job_id, candidate_id, outcome: "offered"|"rejected", match_score }
      ▼
AI Service logs the signal:
  accuracy_delta = 1.0 if (outcome == "offered" AND match_score > 70) else 0.0
  learning_signal = "Positive" if accuracy_delta > 0 else "Neutral"

Returns: { status, feedback_processed, learning_signal, message }
```

> **Note:** The current implementation simulates the RL loop (logs outcomes, computes signals). In a production system, this data would be batch-collected and used to retrain or fine-tune the scoring weights.

---

## 14. Firestore Data Model

### Collection: `users`
```
users/<uid> {
  name: string
  email: string
  role: "student" | "recruiter" | "admin"
  createdAt: ISO string
}
```

### Collection: `resume_profiles`
```
resume_profiles/<uid> {
  user: string (uid)
  skills: string[]
  embedding: float[384]       ← Sentence-BERT vector of full resume
  readinessScore: float       ← 0–100
  readinessHistory: [{ score: float, date: ISO string }]
  skillGaps: [{
    domain: string            ← target role
    gapPercentage: float
    suggestion: string
  }]
  academicRecord: {
    cgpa: float
    backlogs?: number
  }
  interviewFeedback: [{
    text: string
    competencies: string[]
    sentiment: string
    summary: string
    scoreImpact: number
    date: ISO string
  }]
  lastUpdated: ISO string
}
```

### Collection: `placement_drives` (Firestore)
```
placement_drives/<driveId> {
  title: string
  jdText: string
  status: "open" | "closed"
  eligibilityCriteria: {
    minCgpa: float
    maxBacklogs: number
  }
}
```

### MongoDB Collections (Mongoose)
- **PlacementDrive** — used by TPO controller
- **Application** — stores student applications to drives
- **User** — legacy model (primary auth is Firebase)
- **ResumeProfile** — legacy model (primary is Firestore)

---

## 15. API Reference

### Resume Routes (`/api/resume`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Student | Upload resume, trigger full AI analysis |
| GET | `/profile` | Any | Get current user's resume profile |
| POST | `/analyze-gaps` | Any | Run gap analysis for a target role |
| POST | `/interview-feedback` | Any | Submit feedback text, update readiness |

### Student Routes (`/api/students`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/recommended-drives` | Student | AI-ranked placement drives |

### Job Routes (`/api/jobs`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/match` | Student | Get AI-matched live remote jobs |

### Recruiter Routes (`/api/recruiters`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/match` | Recruiter | Submit JD, get ranked candidate list |
| GET | `/candidate/:id` | Recruiter | View detailed candidate profile |

### TPO Routes (`/api/tpo`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/drives` | Admin | Create a placement drive |
| GET | `/drives` | Admin | List all drives created by TPO |
| GET | `/drives/:id/shortlist` | Admin | AI-ranked candidates for a drive |
| GET | `/analytics` | Admin | Platform-wide stats |

### AI Service Endpoints (`http://localhost:8000`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/extract-text` | Extract raw text from PDF/DOCX |
| POST | `/process-resume` | Extract skills + generate embedding |
| POST | `/calculate-readiness` | Compute readiness score (0–100) |
| POST | `/analyze-gaps` | Skill gap vs target role |
| POST | `/match-jobs` | Rank jobs for a candidate |
| POST | `/match-candidates` | Rank candidates for a JD |
| POST | `/analyze-feedback` | Classify competencies in feedback |
| POST | `/record-outcome` | Record placement outcome for RL |

---

## 16. Frontend Pages & Routing

| Route | Component | Role | Description |
|---|---|---|---|
| `/` | Redirect | All | Redirects based on role |
| `/login` | LoginPage | Guest | Email/pass + Google + GitHub login/register |
| `/dashboard` | Dashboard | Student | Overview: readiness, skills, history |
| `/upload-resume` | UploadResume | Student | File upload + live AI results display |
| `/ai-analysis` | AIAnalysis | Student | Detailed AI analysis view |
| `/skill-gap` | SkillGap | Student | Skill gap visualisation per role |
| `/matched-jobs` | MatchedJobs | Student | Live ranked remote job listings |
| `/recommended` | Recommended | Student | Recommended placement drives |
| `/profile` | Profile | Student | Academic record + feedback history |
| `/recruiter/dashboard` | RecruiterDashboard | Recruiter | JD submission + candidate results |
| `/recruiter/candidates` | RecruiterCandidates | Recruiter | Browse all candidates |
| `/admin/dashboard` | AdminDashboard | Admin/TPO | Drive management + analytics |

**Auth Guard:** All routes except `/login` require a valid Firebase session. Role-based redirects happen at the `AppRoutes` level.

---

## 17. Docker & Deployment

### Services (docker-compose.yml)
```yaml
mongodb     → mongo:latest          port 27017
ai-service  → ./ai-service          port 8000
backend     → ./server              port 5000
frontend    → ./client              port 80
proxy       → nginx:stable-alpine   port 80 (public)
```

### Nginx Routing
```
:80/api/*  → backend:5000      (Node.js API)
:80/ai/*   → ai-service:8000   (Python AI, for testing)
:80/*      → frontend:80       (React SPA)
```

### Environment Variables (Backend)
```
PORT=5000
MONGO_URI=mongodb://mongodb:27017/placeiq
AI_SERVICE_URL=http://ai-service:8000
NODE_ENV=production
```

### Local Development
```bash
# Start AI service
cd ai-service && uvicorn main:app --reload --port 8000

# Start backend
cd server && node server.js

# Start frontend
cd client && npm run dev
```

---

## 18. User Roles & Permissions

| Feature | Student | Recruiter | Admin (TPO) |
|---|---|---|---|
| Upload Resume | ✅ | ❌ | ❌ |
| View Readiness Score | ✅ | ❌ | ❌ |
| View Skill Gaps | ✅ | ❌ | ❌ |
| View Matched Jobs | ✅ | ❌ | ❌ |
| Submit Interview Feedback | ✅ | ❌ | ❌ |
| Submit JD for Matching | ❌ | ✅ | ❌ |
| View Candidate Profiles | ❌ | ✅ | ❌ |
| Create Placement Drives | ❌ | ❌ | ✅ |
| View AI Shortlist for Drive | ❌ | ❌ | ✅ |
| View Platform Analytics | ❌ | ❌ | ✅ |

---

*Documentation generated: May 2026. Reflects the current state of the PlaceIQ codebase.*

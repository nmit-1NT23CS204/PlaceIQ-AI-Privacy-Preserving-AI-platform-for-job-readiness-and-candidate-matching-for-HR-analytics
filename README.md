<<<<<<< HEAD
# PlaceIQ-AI-Privacy-Preserving-AI-platform-for-job-readiness-and-candidate-matching-for-HR-analytics
PlaceIQ AI is a AI-powered placement intelligence platform built for students , job candidates and HR for job readiness and selection. It moves far beyond conventional placement portals by incorporating three tightly integrated AI layers: multimodal skill understanding, predictive readiness analytics, and autonomous agent-based decision making. 
=======
# PlaceIQ AI 🚀
### AI-Powered Campus Placement Intelligence Platform

PlaceIQ AI is a state-of-the-art career readiness and job matching platform designed to empower students and streamline the campus placement process. Using advanced NLP and Machine Learning, PlaceIQ provides deep insights into candidate profiles, identifies skill gaps, and matches students with the most relevant job opportunities in real-time.

---

## 👨‍🎓 Student User Guide

Welcome to PlaceIQ! Here is everything you can do as a student user:

### 1. Secure Authentication & Profile
- **Easy Sign-In:** Access the platform securely using **Clerk Authentication**.
- **Personalized Profile:** Maintain your academic records and experience in one centralized location.

### 2. Smart Resume Analysis 📄
- **Upload & Parse:** Upload your resume in **PDF or DOCX** format.
- **Instant Extraction:** Our AI automatically extracts your key skills, experience, and education to build your digital profile instantly.
- **Placement Readiness Score:** Get a dynamic score (0-100) that indicates how ready you are for the current job market based on your unique profile.

### 3. AI-Driven Insights 🧠
- **Skill Gap Analysis:** Identify exactly which skills you are missing for your target roles. Our AI compares your profile against industry standards and provides actionable recommendations.
- **Competency Mapping:** View how your skills align with core competencies like Problem Solving, Communication, and Technical Depth.

### 4. Real-Time Job Matching 💼
- **Live Job Feed:** Stay updated with the latest remote and on-campus opportunities fetched directly from global job boards (e.g., Remotive).
- **AI Match Ranking:** Jobs are automatically ranked based on their compatibility with your skills and experience.
- **Direct Apply:** Click through to view job details and apply directly with your AI-enhanced profile.

---

## 🛠 Tech Stack

- **Frontend:** React.js, TailwindCSS, Vite
- **Backend:** Node.js, Express.js
- **AI Service:** Python, FastAPI, Hugging Face Transformers
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email, Google, GitHub)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20 or v22 recommended)
- **Python** (3.9+)
- **Firebase Project**: Create a project and download the Service Account Key.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/PlaceIQ.git
   cd PlaceIQ
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Setup AI Service:**
   ```bash
   cd ai-service
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Setup Firebase Credentials:**
   Place your Firebase Service Account JSON file inside the `server/` directory and rename it to `service-account.json`.

### Running the Project
From the root directory, run:
```bash
npm start
```
This will concurrently launch the:
- **Frontend** (http://localhost:5173)
- **Backend Server** (http://localhost:5000)
- **AI Service** (http://localhost:8000)

To stop all services and clear the ports:
```bash
npm stop
```

---

## 📋 Implemented Features (Current Status)

| Feature | Status | Description |
| :--- | :--- | :--- |
| **User Auth** | ✅ | Firebase Auth integration for Student/Recruiter/Admin |
| **Resume Parsing** | ✅ | NLP-based skill extraction from PDF/DOCX |
| **Readiness Scoring**| ✅ | Dynamic AI-calculated placement readiness |
| **Skill Gap Analysis**| ✅ | Vector-based comparison vs. job roles |
| **Live Job Matching**| ✅ | Real-time Remotive API integration with AI ranking |
| **Firestore Persistence**| ✅ | All profile and analysis data saved to Firebase |
| **E2E Testing** | ✅ | Full validation script for core workflows |

---

© 2026 PlaceIQ AI. Built for the future of campus placements.
>>>>>>> d9f8763 (first commit)

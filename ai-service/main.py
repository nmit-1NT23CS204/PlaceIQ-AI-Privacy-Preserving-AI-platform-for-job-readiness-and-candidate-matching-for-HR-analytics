from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import io
import pypdf
import docx
import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import numpy as np
from sentence_transformers import util

app = FastAPI(title="PlaceIQ AI Service", description="AI Service for Job Readiness & Candidate Matching")

# Load Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Predefined skills list for extraction
SKILLS_DB = [
    "Python", "Python3", "Java", "JavaScript", "JS", "TypeScript", "TS", "C++", "C#", "Go", "Golang", "Rust", "Swift",
    "HTML", "HTML5", "CSS", "CSS3", "React", "React.js", "ReactJS", "Angular", "Vue", "Vue.js", "VueJS", "Node.js", "NodeJS", "Node", "Express", "Express.js", "FastAPI", "Django", "Flask",
    "SQL", "PostgreSQL", "Postgres", "MySQL", "MongoDB", "Mongo", "Redis", "Elasticsearch",
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s", "Jenkins", "Terraform",
    "Machine Learning", "ML", "Deep Learning", "DL", "NLP", "Computer Vision", "CV", "PyTorch", "TensorFlow", "Scikit-learn", "sklearn",
    "Data Science", "Pandas", "NumPy", "Matplotlib", "Seaborn",
    "Git", "GitHub", "GitLab", "Agile", "Scrum", "REST API", "REST", "GraphQL", "DevOps"
]

# Job Roles Database
JOB_ROLES_DB = {
    "Full Stack Developer": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS", "REST API"],
    "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Angular", "Vue"],
    "Backend Developer": ["Python", "Node.js", "Express", "SQL", "PostgreSQL", "REST API", "Docker", "Redis"],
    "Data Scientist": ["Python", "Machine Learning", "Data Science", "Pandas", "NumPy", "Scikit-learn", "SQL", "NLP"],
    "AI/ML Engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "Machine Learning", "NLP", "Computer Vision"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "Jenkins", "Terraform", "Git"]
}

class ReadinessRequest(BaseModel):
    skills: List[str]
    resume_word_count: int
    cgpa: Optional[float] = None
    coding_score: Optional[int] = None

class GapAnalysisRequest(BaseModel):
    user_skills: List[str]
    target_role: str

class JobJD(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]

class CandidateProfile(BaseModel):
    id: str
    name: str
    skills: List[str]
    embedding: List[float]
    readiness_score: float

class MatchResult(BaseModel):
    id: str
    title_or_name: str
    score: float
    skill_match: float
    semantic_match: float
    readiness_score: Optional[float] = None
    explanation: str

class JobMatchRequest(BaseModel):
    candidate_skills: List[str]
    candidate_embedding: List[float]
    candidate_readiness_score: float
    jobs: List[JobJD]

class CandidateMatchRequest(BaseModel):
    job_jd: JobJD
    candidates: List[CandidateProfile]

def extract_skills_from_text(text: str) -> List[str]:
    found_skills = []
    for skill in SKILLS_DB:
        # Use lookbehind and lookahead to ensure we don't match partial words
        # but also allow matching skills that end in special characters like C++ or C#
        pattern = rf'(?<![a-zA-Z0-9]){re.escape(skill)}(?![a-zA-Z0-9])'
        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)
    return found_skills

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to PlaceIQ AI Service"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

async def get_text_from_file(file: UploadFile) -> str:
    filename = (file.filename or "").lower()
    content = await file.read()
    text = ""
    
    if filename.endswith(".pdf"):
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from file")
    
    # Fix common PDF extraction issue where text is spaced out like "P y t h o n"
    # This compresses single spaces between single alphanumeric characters.
    text = re.sub(r'(?<=\b[A-Za-z0-9]) (?=[A-Za-z0-9]\b)', '', text)
    
    return text.strip()

@app.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    text = await get_text_from_file(file)
    return {
        "filename": file.filename,
        "text": text,
        "word_count": len(text.split())
    }

@app.post("/process-resume")
async def process_resume(file: UploadFile = File(...)):
    text = await get_text_from_file(file)
    skills = extract_skills_from_text(text)
    embedding = model.encode(text).tolist()
    
    return {
        "filename": file.filename,
        "skills": skills,
        "embedding_dimension": len(embedding),
        "embedding": embedding,
        "text_preview": text[:200] + "..." if len(text) > 200 else text,
        "word_count": len(text.split())
    }

@app.post("/calculate-readiness")
def calculate_readiness_score(req: ReadinessRequest):
    score = 0
    
    # 1. Skill Diversity (Max 50 points)
    skill_score = min(len(req.skills) * 5, 50)
    score += skill_score
    
    # 2. Resume Depth (Max 30 points)
    if req.resume_word_count > 500:
        score += 30
    elif req.resume_word_count > 300:
        score += 20
    elif req.resume_word_count > 100:
        score += 10
    
    # 3. Performance (Max 20 points)
    perf_score = 0
    if req.cgpa:
        perf_score += min(req.cgpa, 10)
    if req.coding_score:
        perf_score += (req.coding_score / 10)
    
    score += min(perf_score, 20)
    
    return {
        "readiness_score": round(score, 2),
        "breakdown": {
            "skill_score": skill_score,
            "resume_depth": score - skill_score - min(perf_score, 20),
            "performance_score": min(perf_score, 20)
        }
    }

@app.post("/analyze-gaps")
def analyze_skill_gaps(req: GapAnalysisRequest):
    if req.target_role not in JOB_ROLES_DB:
        raise HTTPException(status_code=404, detail="Target role not found in database")
    
    required_skills = JOB_ROLES_DB[req.target_role]
    user_skills_set = set(s.lower() for s in req.user_skills)
    
    matching = []
    missing = []
    
    for skill in required_skills:
        if skill.lower() in user_skills_set:
            matching.append(skill)
        else:
            missing.append(skill)
    
    match_percentage = (len(matching) / len(required_skills)) * 100
    
    return {
        "target_role": req.target_role,
        "match_percentage": round(match_percentage, 2),
        "matching_skills": matching,
        "missing_skills": missing,
        "suggestion": f"To improve your match for {req.target_role}, consider learning: {', '.join(missing[:3])}" if missing else "You are a perfect match for this role!"
    }

@app.post("/match-jobs", response_model=List[MatchResult])
def match_jobs(req: JobMatchRequest):
    results = []
    candidate_skills_set = set(s.lower() for s in req.candidate_skills)
    candidate_emb = np.array(req.candidate_embedding, dtype=np.float32)
    
    if len(candidate_emb) != 384:
        # Fallback if the database has the old truncated embedding
        candidate_text = " ".join(req.candidate_skills)
        candidate_emb = model.encode(candidate_text)

    
    for job in req.jobs:
        # 1. Skill Match Score (0-1)
        job_skills_set = set(s.lower() for s in job.required_skills)
        if not job_skills_set:
            skill_score = 1.0
            matching_skills = []
        else:
            matching_skills = [s for s in job.required_skills if s.lower() in candidate_skills_set]
            skill_score = len(matching_skills) / len(job_skills_set)
        
        # 2. Semantic Match Score (0-1)
        job_text = f"{job.title} {job.description}"
        job_emb = model.encode(job_text)
        semantic_score = float(util.cos_sim(candidate_emb, job_emb)[0][0])
        semantic_score = max(0, min(1, semantic_score)) # Clamp 0-1
        
        # 3. Hybrid Score (50% Skills, 30% Semantic, 20% Readiness)
        # Scale readiness to 0-1
        readiness_normalized = req.candidate_readiness_score / 100.0
        final_score = (skill_score * 0.5) + (semantic_score * 0.3) + (readiness_normalized * 0.2)
        
        # 4. Generate Explanation
        explanation = f"Match based on skills in {', '.join(matching_skills[:3]) if matching_skills else 'general background'}. "
        if semantic_score > 0.7:
            explanation += "High semantic alignment with job description. "
        elif semantic_score > 0.5:
            explanation += "Moderate semantic alignment. "
            
        if final_score > 0.8:
            explanation += "Overall excellent fit."
        elif final_score > 0.6:
            explanation += "Strong candidate for this role."
        
        results.append(MatchResult(
            id=job.id,
            title_or_name=job.title,
            score=round(final_score * 100, 2),
            skill_match=round(skill_score * 100, 2),
            semantic_match=round(semantic_score * 100, 2),
            readiness_score=req.candidate_readiness_score,
            explanation=explanation
        ))
    
    # Sort by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results

@app.post("/match-candidates", response_model=List[MatchResult])
def match_candidates(req: CandidateMatchRequest):
    results = []
    job_skills_set = set(s.lower() for s in req.job_jd.required_skills)
    
    # Embed job JD once
    job_text = f"{req.job_jd.title} {req.job_jd.description}"
    job_emb = model.encode(job_text)
    
    for cand in req.candidates:
        # 1. Skill Match Score
        if not job_skills_set:
            skill_score = 1.0
            matching_skills = []
        else:
            cand_skills_set = set(s.lower() for s in cand.skills)
            matching_skills = [s for s in req.job_jd.required_skills if s.lower() in cand_skills_set]
            skill_score = len(matching_skills) / len(job_skills_set)
            
        # 2. Semantic Match Score
        cand_emb = np.array(cand.embedding, dtype=np.float32)
        if len(cand_emb) != 384:
            cand_text = " ".join(cand.skills)
            cand_emb = model.encode(cand_text)
            
        semantic_score = float(util.cos_sim(job_emb, cand_emb)[0][0])
        semantic_score = max(0, min(1, semantic_score))
        
        # 3. Hybrid Score (50% Skills, 30% Semantic, 20% Readiness)
        readiness_normalized = cand.readiness_score / 100.0
        final_score = (skill_score * 0.5) + (semantic_score * 0.3) + (readiness_normalized * 0.2)
        
        # 4. Generate Explanation
        explanation = f"Candidate has {len(matching_skills)} out of {len(job_skills_set)} required skills. "
        if matching_skills:
            explanation += f"Strong in {', '.join(matching_skills[:2])}. "
        
        if semantic_score > 0.7:
            explanation += "Resume content shows deep relevance to JD. "
        
        if cand.readiness_score > 80:
            explanation += "Exceptional career readiness."
        
        results.append(MatchResult(
            id=cand.id,
            title_or_name=cand.name,
            score=round(final_score * 100, 2),
            skill_match=round(skill_score * 100, 2),
            semantic_match=round(semantic_score * 100, 2),
            readiness_score=cand.readiness_score,
            explanation=explanation
        ))
        
    # Sort by score descending
    results.sort(key=lambda x: x.score, reverse=True)
    return results

# Competency Database for classification
COMPETENCIES = {
    "Communication": ["verbal", "speaking", "clear", "articulate", "presentation", "explained", "fluency"],
    "Problem Solving": ["logic", "analytical", "algorithms", "structured", "puzzle", "optimization", "approach"],
    "Technical Depth": ["coding", "architecture", "database", "system", "framework", "debugging", "implementation"],
    "Leadership": ["team", "lead", "management", "initiative", "ownership", "collaboration", "mentor"]
}

class FeedbackRequest(BaseModel):
    text: str

@app.post("/analyze-feedback")
def analyze_feedback(req: FeedbackRequest):
    text = req.text.lower()
    scores = {}
    detected_competencies = []

    for comp, keywords in COMPETENCIES.items():
        count = 0
        for word in keywords:
            if word in text:
                count += 1
        
        if count > 0:
            scores[comp] = count
            detected_competencies.append(comp)

    # Simple sentiment or tone check
    is_positive = any(word in text for word in ["good", "great", "excellent", "strong", "impressive", "positive"])
    
    return {
        "competencies": detected_competencies,
        "scores": scores,
        "sentiment": "Positive" if is_positive else "Neutral/Critical",
        "summary": f"Detected focus on: {', '.join(detected_competencies) if detected_competencies else 'General observations'}"
    }

class OutcomeRequest(BaseModel):
    job_id: str
    candidate_id: str
    outcome: str  # "offered" or "rejected"
    match_score: float

@app.post("/record-outcome")
def record_outcome(req: OutcomeRequest):
    # In a real RL system, this would update the model's policy weights
    # For the prototype, we log the outcome to simulate a feedback loop
    print(f"Feedback Loop Received: Job {req.job_id}, Candidate {req.candidate_id}, Outcome: {req.outcome}, AI predicted: {req.match_score}")
    
    # Simulate a "learning" step
    accuracy_delta = 1.0 if (req.outcome == "offered" and req.match_score > 70) else 0.0
    
    return {
        "status": "Outcome recorded",
        "feedback_processed": True,
        "learning_signal": "Positive" if accuracy_delta > 0 else "Neutral",
        "message": "Model will be refined in the next batch training cycle based on this result."
    }

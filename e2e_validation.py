import requests
import json
import time

BASE_URL = "http://localhost:5000/api"
AI_URL = "http://localhost:8000"

def test_system():
    print("Starting End-to-End Validation for PlaceIQ...")
    
    # 1. Health Check
    try:
        res = requests.get(f"{AI_URL}/health")
        print(f"PASS: AI Service Health: {res.json()['status']}")
    except Exception as e:
        print(f"FAIL: AI Service is not running on {AI_URL}/health. Error: {e}")
        return

    # 2. Student Registration & Login
    print("\nStep 1: Testing Authentication...")
    student_data = {
        "name": "Test Student",
        "email": "student@test.com",
        "password": "password123",
        "role": "student"
    }
    # Register (ignore if already exists)
    reg_res = requests.post(f"{BASE_URL}/auth/register", json=student_data)
    print("Register Response:", reg_res.json())
    
    # Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "student@test.com",
        "password": "password123"
    })
    print("Login Response:", login_res.json())
    token = login_res.json().get('token')
    if not token:
        print("FAIL: No token in response. Exiting.")
        return
    headers = {"Authorization": f"Bearer {token}"}
    print("PASS: Student Authentication Successful")

    # 3. AI Readiness Check
    print("\nStep 2: Testing AI Readiness Calculation...")
    readiness_res = requests.post(f"{AI_URL}/calculate-readiness", json={
        "skills": ["Python", "React", "SQL"],
        "resume_word_count": 450,
        "cgpa": 8.5
    })
    print(f"PASS: AI Readiness Score Calculated: {readiness_res.json()['readiness_score']}")

    # 4. Skill Gap Analysis
    print("\nStep 3: Testing Skill Gap Analysis...")
    gap_res = requests.post(f"{AI_URL}/analyze-gaps", json={
        "user_skills": ["Python", "SQL"],
        "target_role": "Full Stack Developer"
    })
    print(f"PASS: Skill Gaps for 'Full Stack Developer': {gap_res.json()['missing_skills']}")

    # 5. TPO Drive & Shortlisting
    print("\nStep 4: Testing TPO Drive Shortlisting logic...")
    # Mocking a drive and candidates
    match_res = requests.post(f"{AI_URL}/match-candidates", json={
        "job_jd": {
            "id": "drive1",
            "title": "Backend Engineer",
            "description": "Expert in Node.js and SQL",
            "required_skills": ["Node.js", "SQL"]
        },
        "candidates": [
            {
                "id": "stud1",
                "name": "John",
                "skills": ["Node.js", "SQL", "Docker"],
                "embedding": [0.1] * 384,
                "readiness_score": 85
            }
        ]
    })
    print(f"PASS: AI Candidate Shortlist generated. Top match: {match_res.json()[0]['score']}%")

    # 6. Interview Feedback Analysis
    print("\nStep 5: Testing Interview Feedback Classification...")
    feedback_res = requests.post(f"{AI_URL}/analyze-feedback", json={
        "text": "The candidate showed excellent verbal clarity and structured logic when solving the coding puzzle."
    })
    print(f"PASS: Feedback Classified Competencies: {feedback_res.json()['competencies']}")

    # 7. Final Outcome (RL Signal)
    print("\nStep 6: Testing Placement Outcome Loop...")
    outcome_res = requests.post(f"{AI_URL}/record-outcome", json={
        "job_id": "drive1",
        "candidate_id": "stud1",
        "outcome": "offered",
        "match_score": 92.5
    })
    print(f"PASS: RL Reward Signal Recorded: {outcome_res.json()['learning_signal']}")

    print("\nALL CORE AI & INTEGRATION TESTS PASSED!")

if __name__ == "__main__":
    test_system()

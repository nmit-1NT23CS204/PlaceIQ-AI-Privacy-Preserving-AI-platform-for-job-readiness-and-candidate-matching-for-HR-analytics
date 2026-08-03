const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class AIService {
  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Process a resume file to extract skills and embeddings
   * @param {string} filePath Path to the uploaded resume file
   * @returns {Promise<Object>} Skills and embedding data
   */
  async processResume(filePath) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${this.baseUrl}/process-resume`, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error (processResume):', error.message);
      throw new Error('Failed to process resume via AI service');
    }
  }

  /**
   * Calculate readiness score based on skills and academic data
   * @param {Object} data Skills, word count, CGPA, etc.
   * @returns {Promise<Object>} Readiness score and breakdown
   */
  async calculateReadiness(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/calculate-readiness`, data);
      return response.data;
    } catch (error) {
      console.error('AI Service Error (calculateReadiness):', error.message);
      throw new Error('Failed to calculate readiness score');
    }
  }

  /**
   * Analyze skill gaps for a target role
   * @param {string} targetRole
   * @param {Array<string>} userSkills
   * @returns {Promise<Object>} Gap analysis results
   */
  async analyzeGaps(targetRole, userSkills) {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze-gaps`, {
        target_role: targetRole,
        user_skills: userSkills,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (analyzeGaps):', error.message);
      throw new Error('Failed to analyze skill gaps');
    }
  }

  /**
   * Match candidates against multiple jobs
   * @param {Object} data candidate skills, embedding, and list of jobs
   * @returns {Promise<Array>} Ranked jobs
   */
  async matchJobs(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/match-jobs`, data);
      return response.data;
    } catch (error) {
      console.error('AI Service Error (matchJobs):', error.message);
      throw new Error('Failed to match jobs');
    }
  }

  /**
   * Match candidates against a job description
   * @param {Object} jobJd
   * @param {Array<Object>} candidates
   * @returns {Promise<Array>} Ranked candidates
   */
  async matchCandidates(jobJd, candidates) {
    try {
      const response = await axios.post(`${this.baseUrl}/match-candidates`, {
        job_jd: jobJd,
        candidates: candidates,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (matchCandidates):', error.message);
      throw new Error('Failed to match candidates');
    }
  }

  /**
   * Analyze interview feedback for competencies
   * @param {string} text Feedback text
   * @returns {Promise<Object>} Detected competencies and sentiment
   */
  async analyzeFeedback(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze-feedback`, { text });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (analyzeFeedback):', error.message);
      throw new Error('Failed to analyze feedback');
    }
  }

  /**
   * Record placement outcome for RL feedback loop
   * @param {Object} data job_id, candidate_id, outcome, match_score
   * @returns {Promise<Object>} Status of recording
   */
  async recordOutcome(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/record-outcome`, data);
      return response.data;
    } catch (error) {
      console.error('AI Service Error (recordOutcome):', error.message);
      // We don't throw here to avoid breaking the application flow if AI feedback fails
      return { success: false };
    }
  }
}

module.exports = new AIService();

const axios = require('axios');
const admin = require('firebase-admin');
const aiService = require('../utils/aiService');

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

/**
 * @desc    Get live matched jobs for the student
 * @route   GET /api/jobs/match
 * @access  Private (Student)
 */
exports.getMatchedJobs = async (req, res) => {
  try {
    // 1. Get user profile from Firestore
    const profileDoc = await admin.firestore().collection('resume_profiles').doc(req.user.id).get();
    
    if (!profileDoc.exists) {
      return res.status(400).json({ success: false, message: 'Please upload a resume first to get matched with jobs.' });
    }

    const profile = profileDoc.data();
    if (!profile.skills || !profile.embedding || profile.embedding.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload a resume first to get matched with jobs.' });
    }

    // 2. Fetch live remote jobs from Remotive API
    const remotiveRes = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=20');
    const rawJobs = remotiveRes.data.jobs || [];

    if (rawJobs.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3. Format jobs for AI Service
    const aiJobsInput = rawJobs.map(job => ({
      id: String(job.id),
      title: job.title,
      description: stripHtml(job.description).substring(0, 1000),
      required_skills: job.tags || []
    }));

    // 4. Call AI Service for matching
    const aiMatchRes = await aiService.matchJobs({
      candidate_skills: profile.skills,
      candidate_embedding: profile.embedding,
      candidate_readiness_score: profile.readinessScore || 0,
      jobs: aiJobsInput
    });

    // 5. Merge AI match results with original job data
    const matchedJobs = aiMatchRes.map(aiMatch => {
      const originalJob = rawJobs.find(j => String(j.id) === aiMatch.id);
      return {
        id: aiMatch.id,
        title: originalJob.title,
        company: originalJob.company_name,
        location: originalJob.candidate_required_location || 'Remote',
        type: originalJob.job_type === 'full_time' ? 'Full Time' : (originalJob.job_type || 'Contract'),
        match: aiMatch.score,
        skills: (originalJob.tags && originalJob.tags.length > 0) ? originalJob.tags.slice(0, 5) : ['Software Development'],
        url: originalJob.url,
        saved: false,
        explanation: aiMatch.explanation,
        logo: originalJob.company_logo
      };
    });

    // 6. Return the ranked list
    res.status(200).json({ success: true, data: matchedJobs });
  } catch (error) {
    console.error('Job Match Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

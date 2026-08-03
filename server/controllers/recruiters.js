const admin = require('firebase-admin');
const aiService = require('../utils/aiService');

/**
 * @desc    Submit JD and get matched candidates
 * @route   POST /api/recruiters/match
 * @access  Private (Recruiter)
 */
exports.matchJD = async (req, res) => {
  try {
    const { title, description, requiredSkills } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Please provide a job description' });
    }

    // 1. Fetch all student profiles from Firestore
    const profilesSnapshot = await admin.firestore().collection('resume_profiles').get();
    
    if (profilesSnapshot.empty) {
      return res.status(200).json({ success: true, data: [], message: 'No student profiles found in the database' });
    }

    const profiles = profilesSnapshot.docs.map(doc => doc.data());

    // 2. Prepare candidate data for AI Service
    // We also need user names/emails. In Firestore, we'll fetch them from the 'users' collection.
    const candidatesData = await Promise.all(profiles.map(async (p) => {
      const userDoc = await admin.firestore().collection('users').doc(p.user).get();
      const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown User', email: '' };
      
      return {
        id: p.user,
        name: userData.name,
        skills: p.skills || [],
        embedding: p.embedding || [],
        readiness_score: p.readinessScore || 0
      };
    }));

    const jobJd = {
      id: "temp-jd-" + Date.now(),
      title: title || "Job Posting",
      description: description,
      required_skills: requiredSkills || []
    };

    // 3. Call AI Service for ranking
    const matchResults = await aiService.matchCandidates(jobJd, candidatesData);

    res.status(200).json({
      success: true,
      count: matchResults.length,
      data: matchResults
    });
  } catch (error) {
    console.error('Recruiter Match Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get detailed student profile for recruiter
 * @route   GET /api/recruiters/candidate/:id
 * @access  Private (Recruiter)
 */
exports.getCandidateDetail = async (req, res) => {
  try {
    const profileDoc = await admin.firestore().collection('resume_profiles').doc(req.params.id).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    const profile = profileDoc.data();
    const userDoc = await admin.firestore().collection('users').doc(req.params.id).get();
    const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown User', email: '' };

    res.status(200).json({ 
      success: true, 
      data: {
        ...profile,
        user: {
          id: req.params.id,
          name: userData.name,
          email: userData.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

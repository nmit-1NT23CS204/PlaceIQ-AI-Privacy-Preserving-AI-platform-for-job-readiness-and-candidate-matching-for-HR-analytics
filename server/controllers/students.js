const admin = require('firebase-admin');
const aiService = require('../utils/aiService');

/**
 * @desc    Get recommended placement drives for a student
 * @route   GET /api/students/recommended-drives
 * @access  Private (Student)
 */
exports.getRecommendedDrives = async (req, res) => {
  try {
    // 1. Get student profile from Firestore
    const profileDoc = await admin.firestore().collection('resume_profiles').doc(req.user.id).get();
    
    if (!profileDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload your resume first to get recommendations' 
      });
    }

    const profile = profileDoc.data();
    if (!profile.embedding || profile.embedding.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload your resume first to get recommendations' 
      });
    }

    // 2. Get all open drives from Firestore
    const drivesSnapshot = await admin.firestore().collection('placement_drives').where('status', '==', 'open').get();
    const drives = drivesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (drives.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 3. Filter by basic eligibility
    const eligibleDrives = drives.filter(drive => {
      const { minCgpa, maxBacklogs } = drive.eligibilityCriteria || {};
      const { cgpa, backlogs } = profile.academicRecord || { cgpa: 0, backlogs: 0 };
      
      return (!minCgpa || cgpa >= minCgpa) && (maxBacklogs === undefined || backlogs <= maxBacklogs);
    });

    if (eligibleDrives.length === 0) {
        return res.status(200).json({ success: true, data: [], message: 'No drives matching your eligibility' });
    }

    // 4. Prepare data for AI Service
    const jobsData = eligibleDrives.map(drive => ({
      id: drive.id,
      title: drive.title,
      description: drive.jdText,
      required_skills: [] 
    }));

    // 5. Call AI Service for ranking
    const matchResults = await aiService.matchJobs({
      candidate_skills: profile.skills,
      candidate_embedding: profile.embedding,
      candidate_readiness_score: profile.readinessScore || 0,
      jobs: jobsData
    });

    // 6. Map results back to drive objects
    const rankedDrives = matchResults.map(match => {
      const drive = eligibleDrives.find(d => d.id === match.id);
      return {
        ...drive,
        matchScore: match.score,
        matchExplanation: match.explanation
      };
    });

    res.status(200).json({
      success: true,
      count: rankedDrives.length,
      data: rankedDrives
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

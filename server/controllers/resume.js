const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const aiService = require('../utils/aiService');

/**
 * @desc    Upload and process resume
 * @route   POST /api/resume/upload
 * @access  Private (Student)
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const { targetRole } = req.body;
    
    // 1. Process resume with AI Service
    const aiData = await aiService.processResume(filePath);
    
    // 2. Fetch existing profile from Firestore
    const db = admin.firestore();
    const profileRef = db.collection('resume_profiles').doc(req.user.id);
    const profileDoc = await profileRef.get();
    let profile = profileDoc.exists ? profileDoc.data() : null;
    
    const readinessData = await aiService.calculateReadiness({
      skills: aiData.skills,
      resume_word_count: aiData.word_count,
      cgpa: profile ? (profile.academicRecord?.cgpa || 8.0) : 8.0,
      coding_score: 75 
    });

    // 2.5 Perform Gap Analysis if targetRole is provided
    let gapData = null;
    let newSkillGap = null;
    if (targetRole) {
      gapData = await aiService.analyzeGaps(targetRole, aiData.skills);
      newSkillGap = {
        domain: targetRole,
        gapPercentage: 100 - gapData.match_percentage,
        suggestion: gapData.suggestion
      };
    }

    // 3. Update or create profile data
    const updatedProfile = {
      user: req.user.id,
      skills: aiData.skills,
      embedding: aiData.embedding, 
      readinessScore: readinessData.readiness_score,
      readinessHistory: profile ? [...(profile.readinessHistory || []), { score: readinessData.readiness_score, date: new Date().toISOString() }] : [{ score: readinessData.readiness_score, date: new Date().toISOString() }],
      skillGaps: newSkillGap ? [newSkillGap] : (profile ? (profile.skillGaps || []) : []),
      academicRecord: profile ? (profile.academicRecord || { cgpa: 8.0 }) : { cgpa: 8.0 },
      lastUpdated: new Date().toISOString()
    };

    await profileRef.set(updatedProfile, { merge: true });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      data: {
        skills: aiData.skills,
        readinessScore: readinessData.readiness_score,
        textPreview: aiData.text_preview,
        gapData: gapData
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get student profile
 * @route   GET /api/resume/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const profileDoc = await admin.firestore().collection('resume_profiles').doc(req.user.id).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profileDoc.data() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Analyze skill gaps for a target role
 * @route   POST /api/resume/analyze-gaps
 * @access  Private
 */
exports.getSkillGaps = async (req, res) => {
  try {
    const { targetRole } = req.body;
    const profileDoc = await admin.firestore().collection('resume_profiles').doc(req.user.id).get();

    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = profileDoc.data();
    const gapData = await aiService.analyzeGaps(targetRole, profile.skills);

    const newSkillGap = {
        domain: targetRole,
        gapPercentage: 100 - gapData.match_percentage,
        suggestion: gapData.suggestion
    };

    await admin.firestore().collection('resume_profiles').doc(req.user.id).update({
      skillGaps: [newSkillGap]
    });

    res.status(200).json({ success: true, data: gapData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add interview feedback and update readiness score
 * @route   POST /api/resume/interview-feedback
 * @access  Private
 */
exports.addInterviewFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide feedback text' });
    }

    const profileRef = admin.firestore().collection('resume_profiles').doc(req.user.id);
    const profileDoc = await profileRef.get();
    if (!profileDoc.exists) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = profileDoc.data();
    const aiData = await aiService.analyzeFeedback(text);
    
    let scoreImpact = 0;
    if (aiData.sentiment === 'Positive') {
      scoreImpact = 5;
    } else if (aiData.sentiment === 'Neutral/Critical') {
      scoreImpact = -5;
    }

    let newScore = (profile.readinessScore || 0) + scoreImpact;
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0;

    const feedbackEntry = {
      text: text,
      competencies: aiData.competencies,
      sentiment: aiData.sentiment,
      summary: aiData.summary,
      scoreImpact: scoreImpact,
      date: new Date().toISOString()
    };

    await profileRef.update({
      readinessScore: newScore,
      readinessHistory: admin.firestore.FieldValue.arrayUnion({ score: newScore, date: new Date().toISOString() }),
      interviewFeedback: admin.firestore.FieldValue.arrayUnion(feedbackEntry),
      lastUpdated: new Date().toISOString()
    });

    const updatedDoc = await profileRef.get();

    res.status(200).json({ success: true, data: updatedDoc.data(), aiData });
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

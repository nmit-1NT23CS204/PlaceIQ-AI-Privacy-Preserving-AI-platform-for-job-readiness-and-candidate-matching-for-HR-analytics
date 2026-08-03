const Feedback = require('../models/Feedback');
const ResumeProfile = require('../models/ResumeProfile');
const aiService = require('../utils/aiService');

/**
 * @desc    Submit interview feedback for a student
 * @route   POST /api/feedback
 * @access  Private (Recruiter/TPO)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { studentId, driveId, feedbackText } = req.body;

    if (!studentId || !feedbackText) {
      return res.status(400).json({ success: false, message: 'Please provide student ID and feedback text' });
    }

    // 1. Analyze feedback with AI Service
    const aiResults = await aiService.analyzeFeedback(feedbackText);

    // 2. Save feedback to database
    const feedback = await Feedback.create({
      student: studentId,
      evaluator: req.user.id,
      drive: driveId,
      feedbackText,
      competencies: aiResults.competencies,
      sentiment: aiResults.sentiment,
      aiSummary: aiResults.summary
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Feedback Submission Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all feedback for a specific student
 * @route   GET /api/feedback/student/:studentId
 * @access  Private
 */
exports.getStudentFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.params.studentId })
      .populate('evaluator', 'name email')
      .populate('drive', 'title company')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

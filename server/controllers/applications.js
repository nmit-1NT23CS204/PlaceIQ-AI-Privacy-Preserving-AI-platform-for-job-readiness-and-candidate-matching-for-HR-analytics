const Application = require('../models/Application');
const aiService = require('../utils/aiService');

/**
 * @desc    Apply for a drive
 * @route   POST /api/applications
 * @access  Private (Student)
 */
exports.applyForDrive = async (req, res) => {
  try {
    const { driveId, matchScore, matchExplanation } = req.body;

    const existing = await Application.findOne({ drive: driveId, student: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    const application = await Application.create({
      drive: driveId,
      student: req.user.id,
      matchScore,
      matchExplanation,
      status: 'applied'
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update application status
 * @route   PUT /api/applications/:id
 * @access  Private (TPO/Admin)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // If final outcome (offered/rejected), trigger AI feedback loop
    if (['offered', 'rejected'].includes(status)) {
      await aiService.recordOutcome({
        job_id: application.drive.toString(),
        candidate_id: application.student.toString(),
        outcome: status,
        match_score: application.matchScore
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all applications (with filters)
 * @route   GET /api/applications
 * @access  Private
 */
exports.getApplications = async (req, res) => {
    try {
      const query = {};
      if (req.user.role === 'student') query.student = req.user.id;
      
      const apps = await Application.find(query)
        .populate('drive', 'title company')
        .populate('student', 'name email')
        .sort('-appliedAt');
  
      res.status(200).json({ success: true, count: apps.length, data: apps });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

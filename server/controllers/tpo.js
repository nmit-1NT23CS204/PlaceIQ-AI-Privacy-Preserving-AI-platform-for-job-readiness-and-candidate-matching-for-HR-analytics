const PlacementDrive = require('../models/PlacementDrive');
const ResumeProfile = require('../models/ResumeProfile');
const Application = require('../models/Application');
const User = require('../models/User');
const aiService = require('../utils/aiService');

/**
 * @desc    Create a new placement drive
 * @route   POST /api/tpo/drives
 * @access  Private (TPO)
 */
exports.createDrive = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    const drive = await PlacementDrive.create(req.body);

    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all drives created by TPO
 * @route   GET /api/tpo/drives
 * @access  Private (TPO)
 */
exports.getTPODrives = async (req, res) => {
    try {
      const drives = await PlacementDrive.find({ createdBy: req.user.id }).sort('-createdAt');
      res.status(200).json({ success: true, data: drives });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get AI-ranked shortlist for a drive
 * @route   GET /api/tpo/drives/:id/shortlist
 * @access  Private (TPO)
 */
exports.getDriveShortlist = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // 1. Find all students with processed profiles
    const profiles = await ResumeProfile.find().populate('user', 'name email');
    
    // 2. Filter by basic eligibility
    const eligibleProfiles = profiles.filter(profile => {
      const { minCgpa, maxBacklogs } = drive.eligibilityCriteria;
      const { cgpa, backlogs } = profile.academicRecord || { cgpa: 0, backlogs: 0 };
      
      return (!minCgpa || cgpa >= minCgpa) && (!maxBacklogs || backlogs <= maxBacklogs);
    });

    if (eligibleProfiles.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No eligible candidates found' });
    }

    // 3. Prepare data for AI Service
    const candidatesData = eligibleProfiles.map(p => ({
      id: p.user._id.toString(),
      name: p.user.name,
      skills: p.skills,
      embedding: p.embedding,
      readiness_score: p.readinessScore || 0
    }));

    const jobJd = {
      id: drive._id.toString(),
      title: drive.title,
      description: drive.jdText,
      required_skills: [] // AI will extract
    };

    // 4. Call AI Service for ranking
    const matchResults = await aiService.matchCandidates(jobJd, candidatesData);

    res.status(200).json({
      success: true,
      count: matchResults.length,
      data: matchResults
    });
  } catch (error) {
    console.error('Shortlist Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get TPO dashboard analytics
 * @route   GET /api/tpo/analytics
 * @access  Private (TPO)
 */
exports.getTPOAnalytics = async (req, res) => {
  try {
    const totalDrives = await PlacementDrive.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Aggregate application statuses
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average readiness score
    const profileStats = await ResumeProfile.aggregate([
      {
        $group: {
          _id: null,
          avgReadiness: { $avg: '$readinessScore' },
          totalProcessed: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDrives,
        totalStudents,
        applicationStats: stats,
        overallReadiness: profileStats.length > 0 ? profileStats[0].avgReadiness : 0,
        profilesProcessed: profileStats.length > 0 ? profileStats[0].totalProcessed : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

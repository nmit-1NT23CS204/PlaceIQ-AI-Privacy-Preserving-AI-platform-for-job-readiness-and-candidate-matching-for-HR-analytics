const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadResume, getProfile, getSkillGaps, addInterviewFeedback } = require('../controllers/resume');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('Only PDF and DOCX are allowed'));
    }
    cb(null, true);
  }
});

router.post('/upload', protect, authorize('student'), upload.single('file'), uploadResume);
router.get('/profile', protect, getProfile);
router.post('/analyze-gaps', protect, getSkillGaps);
router.post('/interview-feedback', protect, addInterviewFeedback);

module.exports = router;

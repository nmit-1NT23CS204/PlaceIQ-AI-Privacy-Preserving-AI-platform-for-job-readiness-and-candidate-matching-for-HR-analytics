const express = require('express');
const { submitFeedback, getStudentFeedback } = require('../controllers/feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('recruiter', 'tpo', 'admin'), submitFeedback);
router.get('/student/:studentId', getStudentFeedback);

module.exports = router;

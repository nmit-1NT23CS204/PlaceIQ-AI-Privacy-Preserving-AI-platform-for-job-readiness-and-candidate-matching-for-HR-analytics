const express = require('express');
const { getMatchedJobs } = require('../controllers/job');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/match', protect, authorize('student'), getMatchedJobs);

module.exports = router;

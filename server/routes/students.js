const express = require('express');
const { getRecommendedDrives } = require('../controllers/students');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/recommended-drives', protect, authorize('student'), getRecommendedDrives);

module.exports = router;

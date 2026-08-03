const express = require('express');
const { matchJD, getCandidateDetail } = require('../controllers/recruiters');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('recruiter'));

router.post('/match', matchJD);
router.get('/candidate/:id', getCandidateDetail);

module.exports = router;

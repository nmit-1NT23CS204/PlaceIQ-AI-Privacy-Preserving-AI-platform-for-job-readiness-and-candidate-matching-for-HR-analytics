const express = require('express');
const { applyForDrive, updateApplicationStatus, getApplications } = require('../controllers/applications');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('student'), applyForDrive)
    .get(getApplications);

router.put('/:id', authorize('tpo', 'admin'), updateApplicationStatus);

module.exports = router;

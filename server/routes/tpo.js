const express = require('express');
const { 
    createDrive, 
    getTPODrives, 
    getDriveShortlist, 
    getTPOAnalytics 
} = require('../controllers/tpo');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('tpo'));

router.route('/drives')
    .post(createDrive)
    .get(getTPODrives);

router.get('/drives/:id/shortlist', getDriveShortlist);
router.get('/analytics', getTPOAnalytics);

module.exports = router;

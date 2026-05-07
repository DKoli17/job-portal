const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getJobApplications, updateStatus, getAllApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/:jobId', protect, authorize('seeker'), upload.single('resume'), applyForJob);
router.get('/my', protect, authorize('seeker'), getMyApplications);
router.get('/all', protect, authorize('admin'), getAllApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), updateStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, toggleUserStatus, deleteUser, getAllJobs, toggleJobStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobs);
router.patch('/jobs/:id/toggle', toggleJobStatus);

module.exports = router;

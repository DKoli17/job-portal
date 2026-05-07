const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadResume, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.put('/change-password', protect, changePassword);

module.exports = router;

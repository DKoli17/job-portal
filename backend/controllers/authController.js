const User = require('../models/User');
const { sendTokenResponse } = require('../utils/tokenHelper');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { cloudinary } = require('../config/cloudinary');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role, company } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role: role || 'seeker', company: company || '' });

  // Send welcome email
  const { subject, html } = emailTemplates.welcome(name);
  await sendEmail({ to: email, subject, html });

  sendTokenResponse(user, 201, res);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, phone, location, bio, skills, company, companyWebsite } = req.body;

  const updateData = { name, phone, location, bio, company, companyWebsite };
  if (skills) {
    updateData.skills = typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : skills;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
  res.status(200).json({ success: true, user });
};

// @desc    Upload resume
// @route   POST /api/auth/upload-resume
// @access  Private (seekers)
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a resume file' });
  }

  // Delete old resume from cloudinary if exists
  const existingUser = await User.findById(req.user.id);
  if (existingUser.resumePublicId) {
    await cloudinary.uploader.destroy(existingUser.resumePublicId, { resource_type: 'raw' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { resumeUrl: req.file.path, resumePublicId: req.file.filename },
    { new: true }
  );

  res.status(200).json({ success: true, message: 'Resume uploaded successfully', resumeUrl: user.resumeUrl });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

module.exports = { register, login, getMe, updateProfile, uploadResume, changePassword };

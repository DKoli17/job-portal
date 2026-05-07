const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res) => {
  const [totalUsers, totalJobs, totalApplications, recentUsers, recentJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    Job.find().sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name').select('title company createdAt isActive'),
  ]);

  const seekerCount = await User.countDocuments({ role: 'seeker' });
  const recruiterCount = await User.countDocuments({ role: 'recruiter' });
  const activeJobs = await Job.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalJobs,
      totalApplications,
      seekerCount,
      recruiterCount,
      activeJobs,
    },
    recentUsers,
    recentJobs,
  });
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const query = role ? { role } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  res.status(200).json({ success: true, total, users });
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });

  await Application.deleteMany({ applicant: req.params.id });
  await Job.deleteMany({ postedBy: req.params.id });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
};

// @desc    Get all jobs (admin)
// @route   GET /api/admin/jobs
// @access  Private (admin)
const getAllJobs = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments();
  const jobs = await Job.find()
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({ success: true, total, jobs });
};

// @desc    Toggle job active status
// @route   PATCH /api/admin/jobs/:id/toggle
// @access  Private (admin)
const toggleJobStatus = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  job.isActive = !job.isActive;
  await job.save();

  res.status(200).json({ success: true, message: `Job ${job.isActive ? 'activated' : 'deactivated'}`, job });
};

module.exports = { getStats, getAllUsers, toggleUserStatus, deleteUser, getAllJobs, toggleJobStatus };

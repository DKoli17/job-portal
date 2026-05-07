const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs (with search, filter, pagination)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  const { keyword, location, type, category, experience, minSalary, maxSalary, page = 1, limit = 10 } = req.query;

  const query = { isActive: true };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (location) query.location = { $regex: location, $options: 'i' };
  if (type) query.type = type;
  if (category) query.category = category;
  if (experience) query.experience = experience;
  if (minSalary) query['salary.min'] = { $gte: parseInt(minSalary) };
  if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('postedBy', 'name company avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    jobs,
  });
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name company avatar companyWebsite email');

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }

  // Increment views
  await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json({ success: true, job });
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (recruiter/admin)
const createJob = async (req, res) => {
  req.body.postedBy = req.user.id;
  if (!req.body.company) req.body.company = req.user.company || 'Unknown Company';

  const job = await Job.create(req.body);
  res.status(201).json({ success: true, job });
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (recruiter who posted / admin)
const updateJob = async (req, res) => {
  let job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, job });
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (recruiter who posted / admin)
const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
  }

  await Application.deleteMany({ job: req.params.id });
  await job.deleteOne();
  res.status(200).json({ success: true, message: 'Job deleted successfully' });
};

// @desc    Get jobs posted by logged-in recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (recruiter)
const getMyJobs = async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
  const jobsWithCount = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicationCount: count };
    })
  );
  res.status(200).json({ success: true, jobs: jobsWithCount });
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs };

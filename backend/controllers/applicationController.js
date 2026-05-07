const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (seeker)
const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;

  const job = await Job.findById(jobId).populate('postedBy', 'name email');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  if (!job.isActive) return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

  // Check deadline
  if (new Date() > new Date(job.deadline)) {
    return res.status(400).json({ success: false, message: 'Application deadline has passed' });
  }

  // Check already applied
  const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
  if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job' });

  // Resume required
  let resumeUrl = req.user.resumeUrl;
  let resumePublicId = req.user.resumePublicId;

  if (req.file) {
    resumeUrl = req.file.path;
    resumePublicId = req.file.filename;
  }

  if (!resumeUrl) {
    return res.status(400).json({ success: false, message: 'Please upload a resume before applying' });
  }

  const application = await Application.create({
    job: jobId,
    applicant: req.user.id,
    resumeUrl,
    resumePublicId,
    coverLetter,
  });

  // Add applicant to job
  await Job.findByIdAndUpdate(jobId, { $addToSet: { applicants: req.user.id } });

  // Send emails
  const { subject: s1, html: h1 } = emailTemplates.applicationConfirmation(req.user.name, job.title, job.company);
  await sendEmail({ to: req.user.email, subject: s1, html: h1 });

  if (job.postedBy?.email) {
    const { subject: s2, html: h2 } = emailTemplates.newApplicant(job.postedBy.name, req.user.name, job.title, application._id);
    await sendEmail({ to: job.postedBy.email, subject: s2, html: h2 });
  }

  res.status(201).json({ success: true, message: 'Application submitted successfully', application });
};

// @desc    Get my applications (seeker)
// @route   GET /api/applications/my
// @access  Private (seeker)
const getMyApplications = async (req, res) => {
  const applications = await Application.find({ applicant: req.user.id })
    .populate('job', 'title company location type salary isActive')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, applications });
};

// @desc    Get applicants for a specific job (recruiter)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruiter)
const getJobApplications = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email phone location skills bio avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, applications });
};

// @desc    Update application status (recruiter)
// @route   PATCH /api/applications/:id/status
// @access  Private (recruiter)
const updateStatus = async (req, res) => {
  const { status, recruiterNote } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title postedBy')
    .populate('applicant', 'name email');

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  application.status = status;
  if (recruiterNote) application.recruiterNote = recruiterNote;
  await application.save();

  // Notify applicant
  const { subject, html } = emailTemplates.statusUpdate(application.applicant.name, application.job.title, status);
  await sendEmail({ to: application.applicant.email, subject, html });

  res.status(200).json({ success: true, application });
};

// @desc    Get all applications (admin)
// @route   GET /api/applications/all
// @access  Private (admin)
const getAllApplications = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Application.countDocuments();
  const applications = await Application.find()
    .populate('job', 'title company')
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({ success: true, total, applications });
};

module.exports = { applyForJob, getMyApplications, getJobApplications, updateStatus, getAllApplications };

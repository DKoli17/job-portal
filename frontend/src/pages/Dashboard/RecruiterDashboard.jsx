import { useState, useEffect } from 'react';
import { getMyJobs, createJob, deleteJob, getJobApplications, updateApplicationStatus } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Users, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Sales', 'HR', 'Operations', 'Other'];
const EXPERIENCE = ['fresher', '1-2 years', '2-5 years', '5-10 years', '10+ years'];
const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

const statusColors = { pending: 'badge-warning', reviewed: 'badge-info', shortlisted: 'badge-success', rejected: 'badge-danger', hired: 'badge-success' };

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data.jobs);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const onPostJob = async (data) => {
    setPosting(true);
    try {
      // Parse requirements/skills from comma-separated strings
      const payload = {
        ...data,
        requirements: data.requirements ? data.requirements.split('\n').filter(Boolean) : [],
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()) : [],
        salary: { min: parseInt(data.salaryMin) || 0, max: parseInt(data.salaryMax) || 0, period: 'yearly' },
      };
      await createJob(payload);
      toast.success('Job posted successfully! 🎉');
      reset();
      setShowPostForm(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job and all its applications?')) return;
    try {
      await deleteJob(jobId);
      toast.success('Job deleted');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (selectedJob?._id === jobId) setSelectedJob(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job);
    setLoadingApps(true);
    try {
      const res = await getJobApplications(job._id);
      setApplications(res.data.applications);
    } catch {} finally { setLoadingApps(false); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, { status });
      setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);

  return (
    <div className="page">
      <div className="container">
        <div className="dash-top">
          <div className="page-header" style={{ textAlign: 'left', marginBottom: 0 }}>
            <h1>Recruiter Dashboard</h1>
            <p>Manage your job postings and review applicants</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowPostForm(true)} id="post-job-btn">
            <Plus size={16} /> Post a Job
          </button>
        </div>

        {/* Stats */}
        <div className="grid-3 dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon-wrap primary"><Plus size={20} /></div>
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Jobs Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap success"><Users size={20} /></div>
            <div className="stat-number">{totalApplications}</div>
            <div className="stat-label">Total Applicants</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap warning"><Users size={20} /></div>
            <div className="stat-number">{jobs.filter((j) => j.isActive).length}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Jobs List */}
          <div className="dashboard-main">
            <div className="section-card glass">
              <div className="section-card-header">
                <h2>My Job Postings</h2>
                <span className="badge badge-primary">{jobs.length}</span>
              </div>

              {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <Plus size={48} />
                  <h3>No jobs posted yet</h3>
                  <p>Post your first job to start finding candidates!</p>
                  <button className="btn btn-primary" onClick={() => setShowPostForm(true)} style={{ marginTop: '1rem' }}>Post a Job</button>
                </div>
              ) : (
                <div className="job-post-list">
                  {jobs.map((job) => (
                    <div key={job._id} className={`job-post-card ${selectedJob?._id === job._id ? 'selected' : ''}`}>
                      <div className="job-post-info">
                        <h3>{job.title}</h3>
                        <p className="job-post-meta">{job.company} · {job.location} · <span className="capitalize">{job.type}</span></p>
                        <div className="job-post-footer">
                          <span className={`badge ${job.isActive ? 'badge-success' : 'badge-danger'}`}>{job.isActive ? 'Active' : 'Closed'}</span>
                          <span className="app-count"><Users size={13} /> {job.applicationCount || 0} applicants</span>
                          <span className="post-date">{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="job-post-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => viewApplications(job)} id={`view-apps-${job._id}`}>
                          <Users size={14} /> Applicants
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)} id={`delete-job-${job._id}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applicants Panel */}
          <aside className="dashboard-sidebar">
            {selectedJob ? (
              <div className="section-card glass applicants-panel">
                <div className="section-card-header">
                  <div>
                    <h3>{selectedJob.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Applicants</p>
                  </div>
                  <button className="modal-close" onClick={() => setSelectedJob(null)}><X size={16} /></button>
                </div>

                {loadingApps ? (
                  <div className="spinner" />
                ) : applications.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <Users size={36} />
                    <h3>No applicants yet</h3>
                  </div>
                ) : (
                  <div className="applicant-list">
                    {applications.map((app) => (
                      <div key={app._id} className="applicant-card">
                        <div className="applicant-avatar">{app.applicant?.name?.[0]}</div>
                        <div className="applicant-info">
                          <p className="applicant-name">{app.applicant?.name}</p>
                          <p className="applicant-email">{app.applicant?.email}</p>
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="resume-link">View Resume</a>
                          )}
                        </div>
                        <div className="applicant-actions">
                          <span className={`badge ${statusColors[app.status]}`}>{app.status}</span>
                          <select
                            className="status-select"
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            id={`status-select-${app._id}`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="sidebar-card glass empty-panel">
                <Users size={40} />
                <p>Select a job to view applicants</p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostForm && (
        <div className="modal-overlay" onClick={() => setShowPostForm(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()} id="post-job-modal">
            <div className="modal-header">
              <h2 className="modal-title">Post a New Job</h2>
              <button className="modal-close" onClick={() => setShowPostForm(false)} id="close-post-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onPostJob)} id="post-job-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" placeholder="e.g. Senior React Developer" {...register('title', { required: 'Title is required' })} id="job-title-input" />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" defaultValue={user?.company} {...register('company')} id="job-company-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g. Bangalore, India" {...register('location', { required: 'Location is required' })} id="job-location-input" />
                  {errors.location && <p className="form-error">{errors.location.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type *</label>
                  <select className="form-select" {...register('type', { required: true })} id="job-type-select">
                    {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" {...register('category')} id="job-category-select">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select className="form-select" {...register('experience')} id="job-experience-select">
                    {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Salary (₹/year)</label>
                  <input type="number" className="form-input" placeholder="e.g. 500000" {...register('salaryMin')} id="salary-min-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Salary (₹/year)</label>
                  <input type="number" className="form-input" placeholder="e.g. 1200000" {...register('salaryMax')} id="salary-max-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input className="form-input" placeholder="React, Node.js, MongoDB, TypeScript" {...register('skills')} id="job-skills-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Description *</label>
                <textarea className="form-textarea" rows={4} placeholder="Describe the role, team, and what you're looking for..." {...register('description', { required: 'Description is required' })} id="job-description-input" />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Requirements (one per line)</label>
                <textarea className="form-textarea" rows={4} placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience&#10;Strong communication skills" {...register('requirements')} id="job-requirements-input" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowPostForm(false); reset(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={posting} id="submit-job-btn">
                  {posting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;

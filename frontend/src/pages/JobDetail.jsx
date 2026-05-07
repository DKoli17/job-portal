import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, Building2, Calendar, Eye, Users, Upload, X, CheckCircle } from 'lucide-react';
import { getJob, applyForJob } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './JobDetail.css';

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Not disclosed';
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
  if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)} / ${salary.period}`;
  return salary.max ? `Up to ${fmt(salary.max)}` : `${fmt(salary.min)}+`;
};

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const statusColor = { pending: 'warning', reviewed: 'info', shortlisted: 'success', rejected: 'danger', hired: 'success' };

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getJob(id)
      .then((res) => setJob(res.data.job))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('coverLetter', coverLetter);
      if (resumeFile) fd.append('resume', resumeFile);

      await applyForJob(id, fd);
      setApplied(true);
      setApplyModal(false);
      toast.success('Application submitted! 🎉 Check your email for confirmation.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!job) return null;

  const isExpired = new Date() > new Date(job.deadline);
  const canApply = user?.role === 'seeker' && !applied && !isExpired && job.isActive;

  return (
    <div className="page">
      <div className="container">
        <div className="job-detail-layout">
          {/* Main Content */}
          <div className="job-main">
            {/* Header */}
            <div className="job-detail-header glass">
              <div className="jd-top">
                <div className="jd-company-logo">
                  <Building2 size={28} />
                </div>
                <div className="jd-info">
                  <h1 className="jd-title">{job.title}</h1>
                  <p className="jd-company">{job.company}</p>
                  {job.postedBy?.companyWebsite && (
                    <a href={job.postedBy.companyWebsite} target="_blank" rel="noreferrer" className="company-link">
                      {job.postedBy.companyWebsite}
                    </a>
                  )}
                </div>
              </div>

              <div className="jd-meta-row">
                <span className="jd-meta-item"><MapPin size={15} /> {job.location}</span>
                <span className="jd-meta-item"><DollarSign size={15} /> {formatSalary(job.salary)}</span>
                <span className="jd-meta-item"><Briefcase size={15} /> {job.experience}</span>
                <span className="jd-meta-item"><Eye size={15} /> {job.views} views</span>
                <span className="jd-meta-item"><Users size={15} /> {job.applicants?.length || 0} applicants</span>
                <span className="jd-meta-item"><Clock size={15} /> Posted {timeAgo(job.createdAt)}</span>
              </div>

              <div className="jd-tags">
                <span className={`badge badge-primary`}>{job.type}</span>
                <span className={`badge badge-info`}>{job.category}</span>
                {!job.isActive && <span className="badge badge-danger">Closed</span>}
                {isExpired && <span className="badge badge-danger">Expired</span>}
              </div>

              {/* Apply Button */}
              <div className="jd-apply-area">
                {applied ? (
                  <div className="applied-badge">
                    <CheckCircle size={18} /> Application Submitted!
                  </div>
                ) : canApply ? (
                  <button className="btn btn-primary btn-lg" onClick={() => setApplyModal(true)} id="apply-now-btn">
                    Apply Now
                  </button>
                ) : !user ? (
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')} id="login-to-apply-btn">
                    Login to Apply
                  </button>
                ) : (
                  <p className="apply-note">
                    {user.role === 'recruiter' ? 'Recruiters cannot apply for jobs.' : isExpired ? 'Application deadline passed.' : 'This job is no longer accepting applications.'}
                  </p>
                )}
                <div className="deadline-info">
                  <Calendar size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="job-section glass">
              <h2>Job Description</h2>
              <p className="job-desc-text">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="job-section glass">
                <h2>Requirements</h2>
                <ul className="req-list">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="job-section glass">
                <h2>Responsibilities</h2>
                <ul className="req-list">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="job-section glass">
                <h2>Required Skills</h2>
                <div className="job-skills-list">
                  {job.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="job-sidebar">
            <div className="sidebar-card glass">
              <h3>Job Overview</h3>
              <div className="overview-list">
                <div className="overview-item">
                  <span className="overview-label">Job Type</span>
                  <span className="overview-value capitalize">{job.type}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Category</span>
                  <span className="overview-value">{job.category}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Experience</span>
                  <span className="overview-value capitalize">{job.experience}</span>
                </div>
                {job.education && (
                  <div className="overview-item">
                    <span className="overview-label">Education</span>
                    <span className="overview-value">{job.education}</span>
                  </div>
                )}
                <div className="overview-item">
                  <span className="overview-label">Salary</span>
                  <span className="overview-value">{formatSalary(job.salary)}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Deadline</span>
                  <span className="overview-value">{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {job.postedBy && (
              <div className="sidebar-card glass">
                <h3>About the Recruiter</h3>
                <div className="recruiter-info">
                  <div className="recruiter-avatar">{job.postedBy.name?.[0]}</div>
                  <div>
                    <p className="recruiter-name">{job.postedBy.name}</p>
                    <p className="recruiter-company">{job.postedBy.company || job.company}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="modal-overlay" onClick={() => setApplyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} id="apply-modal">
            <div className="modal-header">
              <h2 className="modal-title">Apply for {job.title}</h2>
              <button className="modal-close" onClick={() => setApplyModal(false)} id="close-apply-modal"><X size={18} /></button>
            </div>

            <form onSubmit={handleApply} id="apply-form">
              <div className="form-group">
                <label className="form-label">Cover Letter (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Tell the recruiter why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  id="cover-letter-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resume (Optional – uses profile resume if not uploaded)</label>
                <div className="file-upload-area" onClick={() => document.getElementById('resume-upload').click()}>
                  <Upload size={22} />
                  <p>{resumeFile ? resumeFile.name : 'Click to upload PDF/DOC (max 5MB)'}</p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </div>
                {!user?.resumeUrl && !resumeFile && (
                  <p className="form-error">⚠ Please upload a resume (you don't have one on your profile yet)</p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={applying} id="submit-application-btn">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;

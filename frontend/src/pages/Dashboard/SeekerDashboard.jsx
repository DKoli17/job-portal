import { useState, useEffect } from 'react';
import { getMyApplications } from '../../api';
import { Briefcase, Clock, CheckCircle, XCircle, Eye, FileText, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadResume } from '../../api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-warning', icon: <Clock size={14} /> },
  reviewed: { label: 'Reviewed', color: 'badge-info', icon: <Eye size={14} /> },
  shortlisted: { label: 'Shortlisted', color: 'badge-success', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Rejected', color: 'badge-danger', icon: <XCircle size={14} /> },
  hired: { label: 'Hired! 🎉', color: 'badge-success', icon: <CheckCircle size={14} /> },
};

const SeekerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getMyApplications()
      .then((res) => setApplications(res.data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await uploadResume(fd);
      updateUser({ ...user, resumeUrl: res.data.resumeUrl });
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    hired: applications.filter((a) => a.status === 'hired').length,
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Dashboard</h1>
          <p>Track your job applications and profile</p>
        </div>

        {/* Stats */}
        <div className="grid-4 dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon-wrap primary"><Briefcase size={20} /></div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Applied</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap warning"><Clock size={20} /></div>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap success"><CheckCircle size={20} /></div>
            <div className="stat-number">{stats.shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap accent"><CheckCircle size={20} /></div>
            <div className="stat-number">{stats.hired}</div>
            <div className="stat-label">Hired</div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Applications */}
          <div className="dashboard-main">
            <div className="section-card glass">
              <div className="section-card-header">
                <h2>My Applications</h2>
                <span className="badge badge-primary">{applications.length}</span>
              </div>

              {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
              ) : applications.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <h3>No applications yet</h3>
                  <p>Start applying to jobs you love!</p>
                  <a href="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Jobs</a>
                </div>
              ) : (
                <div className="application-list">
                  {applications.map((app) => {
                    const sc = statusConfig[app.status] || statusConfig.pending;
                    return (
                      <div key={app._id} className="application-card">
                        <div className="app-job-info">
                          <h3 className="app-job-title">{app.job?.title || 'Job Deleted'}</h3>
                          <p className="app-company">{app.job?.company}</p>
                          <div className="app-meta">
                            <span>{app.job?.location}</span>
                            <span>·</span>
                            <span className="capitalize">{app.job?.type}</span>
                            <span>·</span>
                            <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="app-status-section">
                          <span className={`badge ${sc.color} app-status-badge`}>
                            {sc.icon} {sc.label}
                          </span>
                          {app.resumeUrl && (
                            <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                              <FileText size={13} /> Resume
                            </a>
                          )}
                        </div>
                        {app.recruiterNote && (
                          <div className="recruiter-note">
                            <strong>Recruiter Note:</strong> {app.recruiterNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            {/* Profile Card */}
            <div className="sidebar-card glass">
              <div className="profile-avatar-large">{user?.name?.[0]?.toUpperCase()}</div>
              <h3 className="profile-name">{user?.name}</h3>
              <p className="profile-role">{user?.email}</p>
              <div className="profile-completion">
                <div className="completion-bar">
                  <div className="completion-fill" style={{ width: `${[user?.bio, user?.phone, user?.location, user?.resumeUrl, user?.skills?.length > 0].filter(Boolean).length * 20}%` }} />
                </div>
                <p className="completion-label">Profile {[user?.bio, user?.phone, user?.location, user?.resumeUrl, user?.skills?.length > 0].filter(Boolean).length * 20}% complete</p>
              </div>
              <a href="/profile" className="btn btn-outline btn-full" style={{ marginTop: '1rem' }}>Edit Profile</a>
            </div>

            {/* Resume Upload */}
            <div className="sidebar-card glass">
              <h3>Resume</h3>
              {user?.resumeUrl ? (
                <div className="resume-status">
                  <CheckCircle size={18} className="text-success" />
                  <div>
                    <p className="resume-label">Resume uploaded</p>
                    <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="resume-link">View Resume</a>
                  </div>
                </div>
              ) : (
                <p className="no-resume">No resume uploaded yet</p>
              )}
              <label className="btn btn-outline btn-full upload-btn" id="resume-upload-label">
                <Upload size={14} /> {uploading ? 'Uploading...' : user?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploading} id="resume-file-input" />
              </label>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;

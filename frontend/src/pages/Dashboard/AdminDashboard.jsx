import { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, getAdminJobs, toggleUserStatus, deleteAdminUser, toggleJobStatus } from '../../api';
import { Users, Briefcase, FileText, TrendingUp, Trash2, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminJobs(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setJobs(jobsRes.data.jobs);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleToggleJob = async (id) => {
    try {
      const res = await toggleJobStatus(id);
      setJobs((prev) => prev.map((j) => j._id === id ? { ...j, isActive: res.data.job.isActive } : j));
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'users', label: `Users (${users.length})`, icon: <Users size={16} /> },
    { id: 'jobs', label: `Jobs (${jobs.length})`, icon: <Briefcase size={16} /> },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage the entire platform</p>
        </div>

        {/* Tab Nav */}
        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="admin-overview">
                <div className="grid-4 dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-icon-wrap primary"><Users size={20} /></div>
                    <div className="stat-number">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap success"><Briefcase size={20} /></div>
                    <div className="stat-number">{stats.totalJobs}</div>
                    <div className="stat-label">Total Jobs</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap warning"><FileText size={20} /></div>
                    <div className="stat-number">{stats.totalApplications}</div>
                    <div className="stat-label">Applications</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon-wrap accent"><TrendingUp size={20} /></div>
                    <div className="stat-number">{stats.activeJobs}</div>
                    <div className="stat-label">Active Jobs</div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '1.5rem' }}>
                  <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>User Breakdown</h3>
                    <div className="breakdown-item">
                      <span>Job Seekers</span>
                      <span className="badge badge-primary">{stats.seekerCount}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Recruiters</span>
                      <span className="badge badge-success">{stats.recruiterCount}</span>
                    </div>
                  </div>
                  <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Jobs Breakdown</h3>
                    <div className="breakdown-item">
                      <span>Active Jobs</span>
                      <span className="badge badge-success">{stats.activeJobs}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Inactive Jobs</span>
                      <span className="badge badge-danger">{stats.totalJobs - stats.activeJobs}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="section-card glass">
                <div className="table-wrapper">
                  <table id="admin-users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div className="table-avatar">{u.name?.[0]}</div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'recruiter' ? 'badge-success' : 'badge-gray'}`}>{u.role}</span></td>
                          <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {u.role !== 'admin' && (
                                <>
                                  <button className="btn btn-outline btn-sm" onClick={() => handleToggleUser(u._id)} id={`toggle-user-${u._id}`}>
                                    {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)} id={`delete-user-${u._id}`}>
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="section-card glass">
                <div className="table-wrapper">
                  <table id="admin-jobs-table">
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>Company</th>
                        <th>Posted By</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job._id}>
                          <td style={{ fontWeight: 600 }}>{job.title}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{job.company}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{job.postedBy?.name || 'Unknown'}</td>
                          <td><span className="badge badge-primary capitalize">{job.type}</span></td>
                          <td><span className={`badge ${job.isActive ? 'badge-success' : 'badge-danger'}`}>{job.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => handleToggleJob(job._id)} id={`toggle-job-${job._id}`}>
                              {job.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              {job.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

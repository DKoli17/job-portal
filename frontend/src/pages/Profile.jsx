import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api';
import { User, Mail, Phone, MapPin, FileText, Lock, Building2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const { register: reg1, handleSubmit: hs1 } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      company: user?.company || '',
      companyWebsite: user?.companyWebsite || '',
    },
  });

  const { register: reg2, handleSubmit: hs2, reset: reset2 } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await updateProfile(data);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      reset2();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-hero glass">
              <div className="profile-avatar-xl">{user?.name?.[0]?.toUpperCase()}</div>
              <h2 className="profile-name-lg">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className={`badge ${user?.role === 'recruiter' ? 'badge-success' : 'badge-primary'} profile-role-badge`}>
                {user?.role}
              </span>
              {user?.company && <p className="profile-company"><Building2 size={14} /> {user.company}</p>}
              {user?.location && <p className="profile-location"><MapPin size={14} /> {user.location}</p>}
            </div>
          </aside>

          {/* Main */}
          <div className="profile-main">
            <div className="profile-tabs">
              <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} id="tab-profile">
                <User size={15} /> Edit Profile
              </button>
              <button className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')} id="tab-security">
                <Lock size={15} /> Security
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="section-card glass">
                <h2 className="section-card-title">Personal Information</h2>
                <form onSubmit={hs1(onSaveProfile)} id="profile-form">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="input-wrapper">
                        <User size={15} className="input-icon" />
                        <input className="form-input with-icon" {...reg1('name', { required: true })} id="profile-name" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <div className="input-wrapper">
                        <Phone size={15} className="input-icon" />
                        <input className="form-input with-icon" placeholder="+91 98765 43210" {...reg1('phone')} id="profile-phone" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <div className="input-wrapper">
                        <MapPin size={15} className="input-icon" />
                        <input className="form-input with-icon" placeholder="Bangalore, India" {...reg1('location')} id="profile-location" />
                      </div>
                    </div>
                    {user?.role === 'recruiter' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Company</label>
                          <div className="input-wrapper">
                            <Building2 size={15} className="input-icon" />
                            <input className="form-input with-icon" {...reg1('company')} id="profile-company" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company Website</label>
                          <div className="input-wrapper">
                            <Globe size={15} className="input-icon" />
                            <input className="form-input with-icon" placeholder="https://..." {...reg1('companyWebsite')} id="profile-website" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" placeholder="Tell us about yourself..." rows={3} {...reg1('bio')} id="profile-bio" />
                  </div>
                  {user?.role === 'seeker' && (
                    <div className="form-group">
                      <label className="form-label">Skills (comma-separated)</label>
                      <div className="input-wrapper">
                        <FileText size={15} className="input-icon" />
                        <input className="form-input with-icon" placeholder="React, Node.js, Python..." {...reg1('skills')} id="profile-skills" />
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="section-card glass">
                <h2 className="section-card-title">Change Password</h2>
                <form onSubmit={hs2(onChangePassword)} id="password-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <div className="input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input type="password" className="form-input with-icon" {...reg2('currentPassword', { required: true })} id="current-password" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input type="password" className="form-input with-icon" {...reg2('newPassword', { required: true, minLength: 6 })} id="new-password" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input type="password" className="form-input with-icon" {...reg2('confirmPassword', { required: true })} id="confirm-password" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="change-password-btn">
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

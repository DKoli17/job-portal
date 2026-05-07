import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Briefcase, Mail, Lock, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultRole = searchParams.get('role') || 'seeker';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: defaultRole }
  });

  const role = watch('role');

  useEffect(() => {
    if (user) navigate('/');
  }, [user]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const u = await registerUser(data);
      toast.success(`Welcome, ${u.name}! 🎉`);
      if (u.role === 'recruiter') navigate('/recruiter');
      else navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card glass">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon"><Briefcase size={22} /></div>
          <span>JobPortal</span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join thousands of professionals today</p>

        <form onSubmit={handleSubmit(onSubmit)} id="register-form">
          {/* Role Selector */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${role === 'seeker' ? 'active' : ''}`}
              onClick={() => {}}
              id="role-seeker"
            >
              <input type="radio" value="seeker" {...register('role')} style={{ display: 'none' }} />
              <User size={16} /> Job Seeker
            </button>
            <label className={`role-btn ${role === 'recruiter' ? 'active' : ''}`} id="role-recruiter-label">
              <input type="radio" value="recruiter" {...register('role')} style={{ display: 'none' }} />
              <Building2 size={16} /> Recruiter
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="reg-name"
                className="form-input with-icon"
                placeholder="John Doe"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
              />
            </div>
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="reg-email"
                className="form-input with-icon"
                type="email"
                placeholder="john@example.com"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          {role === 'recruiter' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-wrapper">
                <Building2 size={16} className="input-icon" />
                <input
                  id="reg-company"
                  className="form-input with-icon"
                  placeholder="Acme Inc."
                  {...register('company', { required: role === 'recruiter' ? 'Company name is required for recruiters' : false })}
                />
              </div>
              {errors.company && <p className="form-error">{errors.company.message}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="reg-password"
                className="form-input with-icon"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min. 6 characters' } })}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} id="toggle-password">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" id="go-to-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

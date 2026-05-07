import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Briefcase, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const u = await login(data);
      toast.success(`Welcome back, ${u.name}!`);
      if (u.role === 'admin') navigate('/admin');
      else if (u.role === 'recruiter') navigate('/recruiter');
      else navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
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
        <div className="auth-logo">
          <div className="logo-icon"><Briefcase size={22} /></div>
          <span>JobPortal</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} id="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                className="form-input with-icon"
                type="email"
                placeholder="john@example.com"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                className="form-input with-icon"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                {...register('password', { required: 'Password is required' })}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} id="toggle-password">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-submit">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="demo-creds">
          <p className="demo-title">🔑 Demo Credentials</p>
          <p>Admin: <code>admin@jobportal.com</code> / <code>admin123</code></p>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register" id="go-to-register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

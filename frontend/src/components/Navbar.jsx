import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'recruiter') return '/recruiter';
    return '/seeker';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"><Briefcase size={20} /></div>
          <span>Job<span className="logo-accent">Portal</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links hide-mobile">
          <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>Browse Jobs</Link>
          {user?.role === 'recruiter' && (
            <Link to="/recruiter" className={`nav-link ${isActive('/recruiter') ? 'active' : ''}`}>My Jobs</Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="navbar-auth hide-mobile">
          {user ? (
            <div className="user-menu">
              <button className="user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)} id="user-menu-btn">
                <div className="user-avatar">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
                <ChevronDown size={14} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="dropdown" id="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-role">{user.role}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={getDashboardPath()} className="dropdown-item" onClick={() => setDropdownOpen(false)} id="dashboard-link">
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)} id="profile-link">
                    <User size={15} /> Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout} id="logout-btn">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm" id="login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-btn">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/jobs" className="mobile-link" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          {user ? (
            <>
              <Link to={getDashboardPath()} className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="mobile-link danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link highlight" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

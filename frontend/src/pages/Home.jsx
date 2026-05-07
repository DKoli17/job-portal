import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, Star, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { getJobs } from '../api';
import JobCard from '../components/JobCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: '2.4k+' },
  { name: 'Design', icon: '🎨', count: '890+' },
  { name: 'Marketing', icon: '📢', count: '1.2k+' },
  { name: 'Finance', icon: '💰', count: '950+' },
  { name: 'Healthcare', icon: '🏥', count: '780+' },
  { name: 'Education', icon: '📚', count: '640+' },
];

const STATS = [
  { icon: <Briefcase size={24} />, value: '50K+', label: 'Jobs Posted' },
  { icon: <Building2 size={24} />, value: '8K+', label: 'Companies' },
  { icon: <Users size={24} />, value: '200K+', label: 'Job Seekers' },
  { icon: <TrendingUp size={24} />, value: '95%', label: 'Success Rate' },
];

const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getJobs({ limit: 6 })
      .then((res) => setFeaturedJobs(res.data.jobs))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> <span>Your Dream Job Awaits</span>
          </div>
          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="gradient-text">Career Match</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top companies and discover opportunities that align with your skills, values, and ambitions.
          </p>

          {/* Search Form */}
          <form className="search-form glass" onSubmit={handleSearch} id="hero-search-form">
            <div className="search-field">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Job title, skills, or keywords..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
                id="search-keyword"
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <MapPin size={18} className="search-icon" />
              <input
                type="text"
                placeholder="City or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
                id="search-location"
              />
            </div>
            <button type="submit" className="btn btn-primary search-btn" id="search-submit">
              Search Jobs
            </button>
          </form>

          <div className="hero-tags">
            <span className="tag-label">Popular:</span>
            {['React Developer', 'UI Designer', 'Product Manager', 'Data Analyst'].map((t) => (
              <button key={t} className="trending-tag" onClick={() => navigate(`/jobs?keyword=${t}`)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-sub">Explore opportunities across all industries</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className="category-card glass"
                onClick={() => navigate(`/jobs?category=${cat.name}`)}
                id={`category-${cat.name.toLowerCase()}`}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-count">{cat.count} jobs</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Opportunities</h2>
              <p className="section-sub">Freshly posted jobs from top companies</p>
            </div>
            <Link to="/jobs" className="btn btn-outline" id="view-all-jobs-btn">
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {featuredJobs.length > 0 ? (
            <div className="jobs-grid">
              {featuredJobs.map((job) => <JobCard key={job._id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state">
              <Briefcase size={48} />
              <h3>No jobs yet</h3>
              <p>Be the first to post a job or check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass">
            <div className="cta-orb" />
            <div className="cta-content">
              <Star size={32} className="cta-star" />
              <h2>Are You a Recruiter?</h2>
              <p>Post jobs and find the perfect candidates for your team. Our platform connects you with thousands of qualified professionals.</p>
              <div className="cta-actions">
                <Link to="/register?role=recruiter" className="btn btn-primary btn-lg" id="recruiter-signup-btn">
                  Start Hiring <ChevronRight size={18} />
                </Link>
                <Link to="/jobs" className="btn btn-outline btn-lg" id="browse-jobs-cta-btn">
                  Browse Talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

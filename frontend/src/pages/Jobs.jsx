import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, SlidersHorizontal, X, Briefcase } from 'lucide-react';
import { getJobs } from '../api';
import JobCard from '../components/JobCard';
import './Jobs.css';

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Sales', 'HR', 'Operations', 'Other'];
const EXPERIENCE = ['fresher', '1-2 years', '2-5 years', '5-10 years', '10+ years'];

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    experience: searchParams.get('experience') || '',
    page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await getJobs({ ...params, limit: 12 });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', location: '', type: '', category: '', experience: '', page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.type || filters.category || filters.experience;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Find Your Next Job</h1>
          <p>{total.toLocaleString()} opportunities waiting for you</p>
        </div>

        {/* Search Bar */}
        <div className="jobs-search glass">
          <div className="search-field">
            <Search size={18} className="search-icon" />
            <input
              className="search-input"
              placeholder="Job title, skills, or keywords..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              id="jobs-search-keyword"
            />
          </div>
          <div className="search-divider" />
          <div className="search-field">
            <MapPin size={18} className="search-icon" />
            <input
              className="search-input"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              id="jobs-search-location"
            />
          </div>
          <button className="btn btn-outline filter-toggle-btn" onClick={() => setShowFilters(!showFilters)} id="toggle-filters-btn">
            <SlidersHorizontal size={16} />
            Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel glass">
            <div className="filter-row">
              <div>
                <p className="filter-label">Job Type</p>
                <div className="filter-chips">
                  {JOB_TYPES.map((t) => (
                    <button key={t} className={`filter-chip ${filters.type === t ? 'active' : ''}`} onClick={() => handleFilterChange('type', filters.type === t ? '' : t)} id={`filter-type-${t}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="filter-label">Category</p>
                <select className="form-select" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} id="filter-category">
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="filter-label">Experience</p>
                <select className="form-select" value={filters.experience} onChange={(e) => handleFilterChange('experience', e.target.value)} id="filter-experience">
                  <option value="">All Levels</option>
                  {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button className="btn btn-outline btn-sm clear-filters" onClick={clearFilters} id="clear-filters-btn">
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="jobs-results">
          {loading ? (
            <div className="loading-page"><div className="spinner" /><p>Finding jobs...</p></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={56} />
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters or browse all jobs.</p>
              <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <p className="results-count">{total} jobs found</p>
              <div className="jobs-grid-full">
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm" disabled={filters.page === 1} onClick={() => handleFilterChange('page', filters.page - 1)} id="prev-page-btn">
                    ← Previous
                  </button>
                  <span className="page-info">Page {filters.page} of {totalPages}</span>
                  <button className="btn btn-outline btn-sm" disabled={filters.page === totalPages} onClick={() => handleFilterChange('page', filters.page + 1)} id="next-page-btn">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;

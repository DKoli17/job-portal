import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, Building2, ArrowRight } from 'lucide-react';
import './JobCard.css';

const typeColors = {
  'full-time': 'success',
  'part-time': 'warning',
  'remote': 'primary',
  'contract': 'info',
  'internship': 'gray',
};

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Not disclosed';
  const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;
  if (salary.min && salary.max) return `₹${fmt(salary.min)} - ₹${fmt(salary.max)}`;
  if (salary.max) return `Up to ₹${fmt(salary.max)}`;
  return `₹${fmt(salary.min)}+`;
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
};

const JobCard = ({ job, showApplicants = false }) => {
  return (
    <Link to={`/jobs/${job._id}`} className="job-card glass" id={`job-card-${job._id}`}>
      {/* Header */}
      <div className="job-card-header">
        <div className="company-logo">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} />
          ) : (
            <Building2 size={22} />
          )}
        </div>
        <div className="job-card-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        <span className={`badge badge-${typeColors[job.type] || 'primary'}`}>{job.type}</span>
      </div>

      {/* Details */}
      <div className="job-card-details">
        <span className="job-detail"><MapPin size={13} /> {job.location}</span>
        <span className="job-detail"><DollarSign size={13} /> {formatSalary(job.salary)}</span>
        <span className="job-detail"><Briefcase size={13} /> {job.experience}</span>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
          {job.skills.length > 3 && <span className="skill-tag muted">+{job.skills.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="job-card-footer">
        <span className="job-time"><Clock size={13} /> {timeAgo(job.createdAt)}</span>
        {showApplicants && (
          <span className="applicant-count">{job.applicationCount || job.applicants?.length || 0} applicants</span>
        )}
        <span className="job-apply">View Details <ArrowRight size={13} /></span>
      </div>
    </Link>
  );
};

export default JobCard;

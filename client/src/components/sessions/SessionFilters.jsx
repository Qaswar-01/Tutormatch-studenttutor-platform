import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  UserX,
  Calendar,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import './SessionFilters.css';

const SessionFilters = ({ filters, onFilterChange, userRole }) => {
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    subject: true,
    date: true,
    sort: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      status: '',
      subject: '',
      upcoming: 'false',
      sortBy: 'sessionDate',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'sessionDate' && value !== 'desc' && value !== 'false'
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending', icon: <Clock size={14} /> },
    { value: 'approved', label: 'Approved', icon: <CheckCircle size={14} /> },
    { value: 'rejected', label: 'Rejected', icon: <XCircle size={14} /> },
    { value: 'cancelled', label: 'Cancelled', icon: <Ban size={14} /> },
    { value: 'in-progress', label: 'In Progress', icon: <RotateCcw size={14} /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
    { value: 'no-show', label: 'No Show', icon: <UserX size={14} /> }
  ];

  const sortOptions = [
    { value: 'sessionDate-desc', label: 'Newest First' },
    { value: 'sessionDate-asc', label: 'Oldest First' },
    { value: 'createdAt-desc', label: 'Recently Created' },
    { value: 'totalCost-desc', label: 'Highest Cost' },
    { value: 'totalCost-asc', label: 'Lowest Cost' },
    { value: 'duration-desc', label: 'Longest Duration' },
    { value: 'duration-asc', label: 'Shortest Duration' }
  ];

  return (
    <div className="session-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('status')}
        >
          <span>Status</span>
          <span className={`expand-icon ${expandedSections.status ? 'expanded' : ''}`}>
            <ChevronDown size={14} />
          </span>
        </button>
        
        {expandedSections.status && (
          <div className="filter-section-content">
            <div className="status-options">
              {statusOptions.map(option => (
                <label key={option.value} className="status-option">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={filters.status === option.value}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="radio"
                  />
                  <span className="radio-content">
                    {option.icon && <span className="status-icon">{option.icon}</span>}
                    <span className="radio-text">{option.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('subject')}
        >
          <span>Subject</span>
          <span className={`expand-icon ${expandedSections.subject ? 'expanded' : ''}`}>
            <ChevronDown size={14} />
          </span>
        </button>
        
        {expandedSections.subject && (
          <div className="filter-section-content">
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              placeholder="Filter by subject..."
              className="subject-input"
            />
          </div>
        )}
      </div>

      {/* Date Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('date')}
        >
          <span>Date Range</span>
          <span className={`expand-icon ${expandedSections.date ? 'expanded' : ''}`}>
            <ChevronDown size={14} />
          </span>
        </button>
        
        {expandedSections.date && (
          <div className="filter-section-content">
            <div className="date-options">
              <label className="date-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="false"
                  checked={filters.upcoming === 'false'}
                  onChange={(e) => handleFilterChange('upcoming', 'false')}
                  className="radio"
                />
                <span className="radio-text">All Sessions</span>
              </label>
              
              <label className="date-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="true"
                  checked={filters.upcoming === 'true'}
                  onChange={(e) => handleFilterChange('upcoming', 'true')}
                  className="radio"
                />
                <span className="radio-text">Upcoming Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('sort')}
        >
          <span>Sort By</span>
          <span className={`expand-icon ${expandedSections.sort ? 'expanded' : ''}`}>
            <ChevronDown size={14} />
          </span>
        </button>
        
        {expandedSections.sort && (
          <div className="filter-section-content">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="filter-section">
        <div className="filter-section-header">
          <span>Quick Filters</span>
        </div>
        <div className="filter-section-content">
          <div className="quick-filters">
            <button
              onClick={() => {
                handleFilterChange('status', 'pending');
                handleFilterChange('upcoming', 'false');
              }}
              className={`quick-filter-btn ${filters.status === 'pending' ? 'active' : ''}`}
            >
              <Clock size={14} /> Pending
            </button>

            <button
              onClick={() => {
                handleFilterChange('status', 'approved');
                handleFilterChange('upcoming', 'true');
              }}
              className={`quick-filter-btn ${filters.status === 'approved' && filters.upcoming === 'true' ? 'active' : ''}`}
            >
              <Calendar size={14} /> Upcoming
            </button>

            <button
              onClick={() => {
                handleFilterChange('status', 'completed');
                handleFilterChange('upcoming', 'false');
              }}
              className={`quick-filter-btn ${filters.status === 'completed' ? 'active' : ''}`}
            >
              <CheckCircle size={14} /> Completed
            </button>

            {userRole === 'tutor' && (
              <button
                onClick={() => {
                  handleFilterChange('status', '');
                  handleFilterChange('sortBy', 'totalCost');
                  handleFilterChange('sortOrder', 'desc');
                }}
                className="quick-filter-btn"
              >
                <DollarSign size={14} /> By Earnings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionFilters;

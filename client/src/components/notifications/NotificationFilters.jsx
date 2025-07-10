import React from 'react';
import './NotificationFilters.css';

const NotificationFilters = ({ filters, onFilterChange }) => {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'session', label: 'Sessions' },
    { value: 'message', label: 'Messages' },
    { value: 'account', label: 'Account' },
    { value: 'payment', label: 'Payments' },
    { value: 'system', label: 'System' }
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'session_request', label: 'Session Requests' },
    { value: 'session_approved', label: 'Session Approved' },
    { value: 'session_rejected', label: 'Session Rejected' },
    { value: 'session_cancelled', label: 'Session Cancelled' },
    { value: 'session_completed', label: 'Session Completed' },
    { value: 'session_reminder', label: 'Session Reminders' },
    { value: 'new_message', label: 'New Messages' },
    { value: 'tutor_approved', label: 'Tutor Approved' },
    { value: 'tutor_rejected', label: 'Tutor Rejected' },
    { value: 'rating_received', label: 'Ratings Received' },
    { value: 'payment_received', label: 'Payments Received' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'system_announcement', label: 'Announcements' },
    { value: 'account_update', label: 'Account Updates' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      unreadOnly: false,
      category: '',
      type: ''
    });
  };

  const hasActiveFilters = filters.unreadOnly || filters.category || filters.type;

  return (
    <div className="notification-filters">
      <div className="filters-header">
        <h4>Filter Notifications</h4>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="clear-filters-btn"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Unread Only Toggle */}
        <div className="filter-group">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) => handleFilterChange('unreadOnly', e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Show unread only</span>
          </label>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="category-filter" className="filter-label">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="filter-group">
          <label htmlFor="type-filter" className="filter-label">
            Type
          </label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="filter-tags">
            {filters.unreadOnly && (
              <span className="filter-tag">
                Unread only
                <button
                  onClick={() => handleFilterChange('unreadOnly', false)}
                  className="remove-filter"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="filter-tag">
                {categories.find(c => c.value === filters.category)?.label}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="remove-filter"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.type && (
              <span className="filter-tag">
                {types.find(t => t.value === filters.type)?.label}
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="remove-filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;

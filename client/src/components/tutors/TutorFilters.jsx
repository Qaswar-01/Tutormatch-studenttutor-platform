import React, { useState } from 'react';
import './TutorFilters.css';

const TutorFilters = ({ 
  filters, 
  availableSubjects, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    subjects: true,
    price: true,
    rating: true,
    experience: true,
    location: true
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

  const handleSubjectToggle = (subject) => {
    const currentSubjects = filters.subjects ? filters.subjects.split(',') : [];
    let newSubjects;
    
    if (currentSubjects.includes(subject)) {
      newSubjects = currentSubjects.filter(s => s !== subject);
    } else {
      newSubjects = [...currentSubjects, subject];
    }
    
    handleFilterChange('subjects', newSubjects.join(','));
  };

  const isSubjectSelected = (subject) => {
    const currentSubjects = filters.subjects ? filters.subjects.split(',') : [];
    return currentSubjects.includes(subject);
  };

  const experienceRanges = [
    { value: '0-1', label: '0-1 years' },
    { value: '2-5', label: '2-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  const ratingOptions = [
    { value: '4.5', label: '4.5+ stars' },
    { value: '4.0', label: '4.0+ stars' },
    { value: '3.5', label: '3.5+ stars' },
    { value: '3.0', label: '3.0+ stars' }
  ];

  return (
    <div className="tutor-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="clear-filters-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Subjects Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('subjects')}
        >
          <span>Subjects</span>
          <span className={`expand-icon ${expandedSections.subjects ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.subjects && (
          <div className="filter-section-content">
            <div className="subjects-grid">
              {availableSubjects.slice(0, 12).map(subject => (
                <label key={subject} className="subject-checkbox">
                  <input
                    type="checkbox"
                    checked={isSubjectSelected(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="checkbox"
                  />
                  <span className="checkbox-text">{subject}</span>
                </label>
              ))}
            </div>
            
            {availableSubjects.length > 12 && (
              <button className="show-more-subjects">
                Show {availableSubjects.length - 12} more subjects
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <span>Price Range</span>
          <span className={`expand-icon ${expandedSections.price ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.price && (
          <div className="filter-section-content">
            <div className="price-inputs">
              <div className="price-input-group">
                <label htmlFor="minRate" className="input-label">Min</label>
                <div className="price-input-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    type="number"
                    id="minRate"
                    value={filters.minRate}
                    onChange={(e) => handleFilterChange('minRate', e.target.value)}
                    placeholder="0"
                    min="0"
                    max="500"
                    className="price-input"
                  />
                </div>
              </div>
              
              <div className="price-separator">-</div>
              
              <div className="price-input-group">
                <label htmlFor="maxRate" className="input-label">Max</label>
                <div className="price-input-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    type="number"
                    id="maxRate"
                    value={filters.maxRate}
                    onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                    placeholder="500"
                    min="0"
                    max="500"
                    className="price-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="price-presets">
              <button 
                onClick={() => {
                  handleFilterChange('minRate', '');
                  handleFilterChange('maxRate', '25');
                }}
                className="price-preset-btn"
              >
                Under $25
              </button>
              <button 
                onClick={() => {
                  handleFilterChange('minRate', '25');
                  handleFilterChange('maxRate', '50');
                }}
                className="price-preset-btn"
              >
                $25 - $50
              </button>
              <button 
                onClick={() => {
                  handleFilterChange('minRate', '50');
                  handleFilterChange('maxRate', '100');
                }}
                className="price-preset-btn"
              >
                $50 - $100
              </button>
              <button 
                onClick={() => {
                  handleFilterChange('minRate', '100');
                  handleFilterChange('maxRate', '');
                }}
                className="price-preset-btn"
              >
                $100+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('rating')}
        >
          <span>Rating</span>
          <span className={`expand-icon ${expandedSections.rating ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.rating && (
          <div className="filter-section-content">
            <div className="rating-options">
              {ratingOptions.map(option => (
                <label key={option.value} className="rating-option">
                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={filters.minRating === option.value}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="radio"
                  />
                  <span className="radio-text">{option.label}</span>
                </label>
              ))}
              <label className="rating-option">
                <input
                  type="radio"
                  name="rating"
                  value=""
                  checked={!filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', '')}
                  className="radio"
                />
                <span className="radio-text">Any rating</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Experience Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('experience')}
        >
          <span>Experience</span>
          <span className={`expand-icon ${expandedSections.experience ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.experience && (
          <div className="filter-section-content">
            <div className="experience-options">
              {experienceRanges.map(range => (
                <label key={range.value} className="experience-option">
                  <input
                    type="radio"
                    name="experience"
                    value={range.value}
                    checked={filters.experience === range.value}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="radio"
                  />
                  <span className="radio-text">{range.label}</span>
                </label>
              ))}
              <label className="experience-option">
                <input
                  type="radio"
                  name="experience"
                  value=""
                  checked={!filters.experience}
                  onChange={(e) => handleFilterChange('experience', '')}
                  className="radio"
                />
                <span className="radio-text">Any experience</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('location')}
        >
          <span>Location</span>
          <span className={`expand-icon ${expandedSections.location ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        
        {expandedSections.location && (
          <div className="filter-section-content">
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Enter city or location"
              className="location-input"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorFilters;

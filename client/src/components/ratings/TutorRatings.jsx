import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import RatingCard from './RatingCard';
import StarRating from './StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import './TutorRatings.css';

const TutorRatings = ({ tutorId, showHeader = true }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minRating: 1,
    maxRating: 5,
    subject: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadRatings();
  }, [tutorId, filters]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getTutorRatings(tutorId, filters);
      
      setRatings(response.data.ratings);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getRatingDistribution = () => {
    if (!stats?.ratingDistribution) return [];
    
    const distribution = stats.ratingDistribution;
    const total = stats.totalRatings;
    
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: distribution[rating] || 0,
      percentage: total > 0 ? Math.round((distribution[rating] || 0) / total * 100) : 0
    }));
  };

  if (loading && ratings.length === 0) {
    return (
      <div className="tutor-ratings-loading">
        <LoadingSpinner text="Loading ratings..." />
      </div>
    );
  }

  return (
    <div className="tutor-ratings">
      {showHeader && stats && (
        <div className="ratings-header">
          <div className="ratings-overview">
            <div className="overall-rating">
              <div className="rating-score">
                <span className="score-number">{stats.averageRating?.toFixed(1) || '0.0'}</span>
                <StarRating rating={stats.averageRating || 0} readonly size="large" />
              </div>
              <div className="rating-summary">
                <span className="total-ratings">
                  {stats.totalRatings} review{stats.totalRatings !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="rating-distribution">
              {getRatingDistribution().map(({ rating, count, percentage }) => (
                <div key={rating} className="distribution-row">
                  <span className="rating-label">{rating} star{rating !== 1 ? 's' : ''}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="distribution-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="ratings-filters">
        <div className="filter-group">
          <label htmlFor="sortBy" className="filter-label">Sort by:</label>
          <select
            id="sortBy"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="filter-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
            <option value="helpfulScore-desc">Most Helpful</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="minRating" className="filter-label">Min Rating:</label>
          <select
            id="minRating"
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
            className="filter-select"
          >
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="subject" className="filter-label">Subject:</label>
          <input
            id="subject"
            type="text"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            placeholder="Filter by subject..."
            className="filter-input"
          />
        </div>
      </div>

      {/* Ratings List */}
      <div className="ratings-list">
        {ratings.length > 0 ? (
          ratings.map(rating => (
            <RatingCard
              key={rating._id}
              rating={rating}
              onUpdate={loadRatings}
              showTutorInfo={false}
            />
          ))
        ) : (
          <div className="no-ratings">
            <div className="no-ratings-icon">⭐</div>
            <h3>No reviews yet</h3>
            <p>This tutor hasn't received any reviews matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="ratings-pagination">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.current} of {pagination.pages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {loading && ratings.length > 0 && (
        <div className="ratings-loading-overlay">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};

export default TutorRatings;

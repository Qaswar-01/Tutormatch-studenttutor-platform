import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tutorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TutorCard from '../../components/tutors/TutorCard';
import TutorFilters from '../../components/tutors/TutorFilters';
import SearchBar from '../../components/tutors/SearchBar';
import Pagination from '../../components/common/Pagination';
import './TutorList.css';

const TutorList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    subjects: searchParams.get('subjects') || '',
    minRate: searchParams.get('minRate') || '',
    maxRate: searchParams.get('maxRate') || '',
    minRating: searchParams.get('minRating') || '',
    experience: searchParams.get('experience') || '',
    city: searchParams.get('city') || '',
    sortBy: searchParams.get('sortBy') || 'averageRating',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTutors();
  }, [searchParams]);

  // Add effect to refresh when page becomes visible (handles admin approval case)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh tutors to get any newly approved tutors
        loadTutors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);

      const params = {
        page: searchParams.get('page') || 1,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await tutorAPI.getAllTutors(params);
      setTutors(response.data?.tutors || []);
      setPagination(response.data?.pagination || { total: 0, current: 1, pages: 1, hasNext: false, hasPrev: false });
      setAvailableSubjects(response.data?.filters?.subjects || []);
    } catch (error) {
      console.error('Error loading tutors:', error);
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      }
    });

    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const handleSearch = (searchTerm) => {
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      subjects: '',
      minRate: '',
      maxRate: '',
      minRating: '',
      experience: '',
      city: '',
      sortBy: 'averageRating',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value && value !== 'averageRating' && value !== 'desc'
  );

  return (
    <div className="tutor-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Find Your Perfect Tutor</h1>
            <p>
              Discover qualified tutors who can help you achieve your learning goals.
              Browse by subject, location, or search for specific expertise.
            </p>
          </div>

          <SearchBar
            value={filters.search}
            onSearch={handleSearch}
            placeholder="Search tutors by name, subject, or expertise..."
          />
        </div>

        {/* Filters and Results */}
        <div className="content-layout">
          {/* Mobile Filter Toggle */}
          <div className="mobile-filter-toggle">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
            >
              <span>🔍</span>
              Filters
              {hasActiveFilters && <span className="filter-badge">•</span>}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <TutorFilters
              filters={filters}
              availableSubjects={availableSubjects}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* Main Content */}
          <main className="tutors-content">
            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                {loading ? (
                  <span>Loading tutors...</span>
                ) : (
                  <span>
                    {pagination?.total || 0} tutor{(pagination?.total || 0) !== 1 ? 's' : ''} found
                    {hasActiveFilters && ' with current filters'}
                  </span>
                )}
                <button
                  onClick={loadTutors}
                  className="btn btn-outline btn-sm"
                  disabled={loading}
                  title="Refresh tutors list"
                  style={{ marginLeft: '1rem' }}
                >
                  🔄 Refresh
                </button>
              </div>

              <div className="sort-controls">
                <label htmlFor="sortBy" className="sort-label">Sort by:</label>
                <select
                  id="sortBy"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ ...filters, sortBy, sortOrder });
                  }}
                  className="sort-select"
                >
                  <option value="averageRating-desc">Highest Rated</option>
                  <option value="totalRatings-desc">Most Reviews</option>
                  <option value="hourlyRate-asc">Price: Low to High</option>
                  <option value="hourlyRate-desc">Price: High to Low</option>
                  <option value="experience-desc">Most Experienced</option>
                  <option value="createdAt-desc">Newest</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-container">
                <LoadingSpinner text="Finding tutors..." />
              </div>
            )}

            {/* Empty State */}
            {!loading && tutors.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No tutors found</h3>
                <p>
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'No tutors are currently available.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Tutors Grid */}
            {!loading && tutors.length > 0 && (
              <>
                <div className="tutors-grid">
                  {tutors.map(tutor => (
                    <TutorCard key={tutor._id} tutor={tutor} />
                  ))}
                </div>

                {/* Pagination */}
                {(pagination?.pages || 0) > 1 && (
                  <Pagination
                    current={pagination?.current || 1}
                    pages={pagination?.pages || 1}
                    onPageChange={handlePageChange}
                    hasNext={pagination?.hasNext || false}
                    hasPrev={pagination?.hasPrev || false}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TutorList;

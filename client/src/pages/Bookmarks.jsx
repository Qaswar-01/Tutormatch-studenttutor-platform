import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TutorCard from '../components/tutors/TutorCard';
import { Heart, BookOpen, Search, Filter } from 'lucide-react';
import './Bookmarks.css';

const Bookmarks = () => {
  const { user, isStudent } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    if (!isStudent()) {
      setError('Only students can view bookmarks');
      setLoading(false);
      return;
    }
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getBookmarks();
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError(error.response?.data?.message || 'Failed to load bookmarks');
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (tutorId) => {
    try {
      await userAPI.toggleBookmark(tutorId);
      setBookmarks(bookmarks.filter(tutor => tutor._id !== tutorId));
      toast.success('Tutor removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks
    .filter(tutor => {
      const matchesSearch = 
        tutor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects?.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesSubject = !filterSubject || 
        tutor.subjects?.includes(filterSubject);
      
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'price':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        default:
          return 0;
      }
    });

  // Get unique subjects for filter
  const allSubjects = [...new Set(
    bookmarks.flatMap(tutor => tutor.subjects || [])
  )].sort();

  if (!isStudent()) {
    return (
      <div className="bookmarks-page">
        <div className="container">
          <div className="error-state">
            <Heart size={64} />
            <h2>Access Denied</h2>
            <p>Only students can view bookmarks.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bookmarks-page">
        <div className="container">
          <LoadingSpinner text="Loading your bookmarks..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-page">
        <div className="container">
          <div className="error-state">
            <Heart size={64} />
            <h2>Error Loading Bookmarks</h2>
            <p>{error}</p>
            <button onClick={loadBookmarks} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <BookOpen size={32} />
                My Bookmarks
              </h1>
              <p>
                {bookmarks.length === 0 
                  ? "You haven't bookmarked any tutors yet"
                  : `${bookmarks.length} tutor${bookmarks.length !== 1 ? 's' : ''} bookmarked`
                }
              </p>
            </div>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-content">
              <Heart size={80} />
              <h2>No Bookmarks Yet</h2>
              <p>
                Start exploring tutors and bookmark your favorites to see them here.
                Bookmarked tutors are easy to find when you need them!
              </p>
              <a href="/tutors" className="btn btn-primary">
                <Search size={18} />
                Find Tutors
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bookmarks-controls">
              <div className="search-bar">
                <div className="search-input-wrapper">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search bookmarked tutors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="subject-filter">
                    <Filter size={16} />
                    Subject
                  </label>
                  <select
                    id="subject-filter"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Subjects</option>
                    {allSubjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sort-select">Sort by</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bookmarks-results">
              <div className="results-header">
                <h3>
                  {filteredBookmarks.length === bookmarks.length 
                    ? `${bookmarks.length} Bookmarked Tutor${bookmarks.length !== 1 ? 's' : ''}`
                    : `${filteredBookmarks.length} of ${bookmarks.length} Tutor${bookmarks.length !== 1 ? 's' : ''}`
                  }
                </h3>
              </div>

              {filteredBookmarks.length === 0 ? (
                <div className="no-results">
                  <Search size={48} />
                  <h3>No tutors match your search</h3>
                  <p>Try adjusting your search terms or filters.</p>
                </div>
              ) : (
                <div className="tutors-grid">
                  {filteredBookmarks.map(tutor => (
                    <TutorCard 
                      key={tutor._id} 
                      tutor={tutor}
                      onBookmarkChange={() => handleRemoveBookmark(tutor._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;

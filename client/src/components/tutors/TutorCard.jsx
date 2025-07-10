import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getAvatarUrl, formatCurrency, renderStars } from '../../utils/helpers';
import { Heart, Calendar } from 'lucide-react';
import BookSession from '../sessions/BookSession';
import './TutorCard.css';

const TutorCard = ({ tutor, onBookmarkChange }) => {
  const { user, isStudent } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(
    user?.bookmarkedTutors?.includes(tutor._id) || false
  );
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to bookmark tutors');
      return;
    }
    
    if (!isStudent()) {
      toast.error('Only students can bookmark tutors');
      return;
    }
    
    try {
      setIsBookmarking(true);
      await userAPI.toggleBookmark(tutor._id);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Tutor unbookmarked' : 'Tutor bookmarked');

      // Call the callback if provided (for bookmarks page)
      if (onBookmarkChange) {
        onBookmarkChange(tutor._id, !isBookmarked);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleBookSession = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isStudent()) {
      toast.error('Only students can book sessions');
      return;
    }

    setShowBooking(true);
  };

  const handleBookingSuccess = () => {
    setShowBooking(false);
    toast.success('Session request sent successfully!');
  };

  const getExperienceText = (years) => {
    if (years === 0) return 'New tutor';
    if (years === 1) return '1 year experience';
    return `${years} years experience`;
  };

  const getAvailabilityText = () => {
    if (!tutor.availability) return 'Availability not set';

    const availableDays = Object.values(tutor.availability).filter(day => day.available);
    if (availableDays.length === 0) return 'No availability';
    if (availableDays.length === 7) return 'Available 7 days a week';
    if (availableDays.length >= 5) return 'Available most days';
    return `Available ${availableDays.length} days a week`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="tutor-card">
      <Link to={`/tutors/${tutor._id}`} className="tutor-card-link">
        <div className="tutor-card-content">
          {/* Header with avatar and basic info */}
          <div className="tutor-card-header">
            <div className="tutor-avatar">
              {tutor.avatar ? (
                <img
                  src={getAvatarUrl(tutor)}
                  alt={`${tutor.firstName} ${tutor.lastName}`}
                  className="avatar-image"
                />
              ) : (
                <div
                  className="avatar-initials"
                  style={{ backgroundColor: getAvatarColor(tutor.firstName || 'A') }}
                >
                  {getInitials(tutor.firstName, tutor.lastName)}
                </div>
              )}
              {tutor.isOnline && <div className="online-indicator"></div>}
            </div>

            <div className="tutor-basic-info">
              <h3 className="tutor-name">
                {tutor.firstName} {tutor.lastName}
              </h3>
              <div className="tutor-location">
                <i className="fas fa-map-marker-alt"></i>
                <span>{tutor.city || 'Location not specified'}</span>
              </div>
            </div>

            {isStudent() && (
              <button
                onClick={handleBookmark}
                className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                disabled={isBookmarking}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark tutor'}
              >
                <Heart size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="tutor-rating">
            <div className="stars">
              {'★'.repeat(Math.floor(tutor.averageRating || 0))}
              {'☆'.repeat(5 - Math.floor(tutor.averageRating || 0))}
            </div>
            <span className="rating-text">
              {tutor.averageRating ? tutor.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="rating-count">
              ({tutor.totalRatings || 0})
            </span>
          </div>

          {/* Top subjects only */}
          <div className="tutor-subjects">
            <div className="subjects-list">
              {tutor.subjects?.slice(0, 2).map((subject, index) => (
                <span key={index} className="subject-tag">
                  {subject}
                </span>
              ))}
              {tutor.subjects?.length > 2 && (
                <span className="subject-tag more">
                  +{tutor.subjects.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Essential info only */}
          <div className="tutor-key-info">
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-value">{tutor.experience || 0} years</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rate</span>
              <span className="info-value">{formatCurrency(tutor.hourlyRate || 0)}/hr</span>
            </div>
          </div>
        </div>

        {/* Simple footer */}
        <div className="tutor-card-footer">
          <span className="view-profile-text">View Full Profile</span>
          <i className="fas fa-arrow-right arrow-icon"></i>
        </div>
      </Link>

      {/* Book Session Modal */}
      {showBooking && (
        <BookSession
          tutor={tutor}
          onClose={() => setShowBooking(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default TutorCard;

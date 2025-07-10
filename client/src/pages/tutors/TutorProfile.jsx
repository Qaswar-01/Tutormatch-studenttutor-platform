import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tutorAPI, ratingAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Calendar,
  BookOpen,
  Award,
  Heart,
  MessageCircle,
  Video
} from 'lucide-react';
import { getAvatarUrl, formatCurrency, renderStars } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookSession from '../../components/sessions/BookSession';
import './TutorProfile.css';

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [tutorStats, setTutorStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    responseTime: 'Quick'
  });
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadTutorProfile();
  }, [id]);

  const loadTutorProfile = async () => {
    try {
      setLoading(true);

      // Load tutor profile
      const tutorResponse = await tutorAPI.getTutorById(id);
      setTutor(tutorResponse.data?.tutor || null);

      // Load tutor stats
      try {
        const statsResponse = await tutorAPI.getTutorStats(id);
        setTutorStats(statsResponse.data.stats);
      } catch (error) {
        console.error('Error loading tutor stats:', error);
        // Keep default stats if API fails
      }

      // Load ratings
      try {
        const ratingsResponse = await ratingAPI.getTutorRatings(id, { limit: 5 });
        setRatings(ratingsResponse.data?.ratings || []);
      } catch (error) {
        console.warn('Ratings API not available, using mock data:', error.message);

        // Mock ratings data for development
        const mockRatings = [
          {
            _id: '1',
            rating: 5,
            comment: 'Excellent tutor! Very patient and knowledgeable. Helped me understand complex concepts easily.',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            student: {
              firstName: 'Alice',
              avatar: 'https://ui-avatars.com/api/?name=Alice&size=300&background=4F46E5&color=fff'
            }
          },
          {
            _id: '2',
            rating: 5,
            comment: 'Great teaching style and very responsive. Highly recommend!',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            student: {
              firstName: 'Bob',
              avatar: 'https://ui-avatars.com/api/?name=Bob&size=300&background=F59E0B&color=fff'
            }
          },
          {
            _id: '3',
            rating: 4,
            comment: 'Very helpful and professional. Sessions were well-structured.',
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
            student: {
              firstName: 'Carol',
              avatar: 'https://ui-avatars.com/api/?name=Carol&size=300&background=10B981&color=fff'
            }
          }
        ];

        setRatings(mockRatings);
      }

      // Check if bookmarked
      if (user?.bookmarkedTutors?.includes(id)) {
        setIsBookmarked(true);
      }

    } catch (error) {
      console.error('Error loading tutor profile:', error);
      toast.error('Failed to load tutor profile');
      navigate('/tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    console.log('Book Session clicked!');
    console.log('User:', user);
    console.log('Is Student:', isStudent());

    if (!isStudent()) {
      toast.error('Only students can book sessions. Please log in as a student.');
      return;
    }

    console.log('Opening booking modal...');
    setShowBooking(true);
  };

  const handleBookingSuccess = () => {
    setShowBooking(false);
    toast.success('Session request sent successfully!');
  };

  if (loading) {
    return (
      <div className="tutor-profile-page">
        <div className="container">
          <LoadingSpinner text="Loading tutor profile..." />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="tutor-profile-page">
        <div className="container">
          <div className="error-message">
            <h2>Tutor Not Found</h2>
            <p>The tutor you're looking for doesn't exist or is not available.</p>
            <button onClick={() => navigate('/tutors')} className="btn btn-primary">
              Browse Tutors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-profile-page">
      <div className="container">
        {/* Header */}
        <div className="tutor-header">
          <div className="tutor-header-content">
            <div className="tutor-avatar-section">
              <img
                src={getAvatarUrl(tutor)}
                alt={`${tutor.firstName} ${tutor.lastName}`}
                className="tutor-avatar-large"
              />
              {tutor.isOnline && <div className="online-indicator-large"></div>}
            </div>

            <div className="tutor-header-info">
              <h1 className="tutor-name">
                {tutor.firstName} {tutor.lastName}
              </h1>

              <div className="tutor-rating-large">
                <div className="stars-large">
                  {renderStars(tutor.averageRating || 0)}
                </div>
                <span className="rating-text-large">
                  {tutor.averageRating ? tutor.averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="rating-count-large">
                  ({tutor.totalRatings || 0} review{tutor.totalRatings !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="tutor-location-large">
                <MapPin size={16} />
                <span>{tutor.city || 'Location not specified'}</span>
              </div>

              <div className="tutor-rate-large">
                <DollarSign size={20} />
                <span className="rate-amount">{formatCurrency(tutor.hourlyRate || 0)}</span>
                <span className="rate-period">/hour</span>
              </div>
            </div>

            <div className="tutor-header-actions">
              {isStudent() && (
                <>
                  <button
                    onClick={handleBookSession}
                    className="btn btn-primary btn-lg"
                    style={{ position: 'relative' }}
                  >
                    <Calendar size={18} />
                    Book Session
                    {showBooking && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '10px',
                        height: '10px',
                        background: '#22c55e',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await userAPI.toggleBookmark(tutor._id);
                        setIsBookmarked(!isBookmarked);
                        toast.success(isBookmarked ? 'Tutor unbookmarked' : 'Tutor bookmarked');
                      } catch (error) {
                        console.error('Bookmark error:', error);
                        toast.error('Failed to update bookmark');
                      }
                    }}
                    className={`btn btn-outline ${isBookmarked ? 'bookmarked' : ''}`}
                  >
                    <Heart size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </>
              )}


            </div>
          </div>
        </div>

        {/* Content */}
        <div className="tutor-content">
          <div className="tutor-main">
            {/* About */}
            <section className="tutor-section">
              <h2>About {tutor.firstName}</h2>
              <p className="tutor-bio">
                {tutor.bio || 'No bio available.'}
              </p>
            </section>

            {/* Subjects */}
            <section className="tutor-section">
              <h2>Subjects I Teach</h2>
              <div className="subjects-grid">
                {tutor.subjects?.map((subject, index) => (
                  <div key={index} className="subject-card">
                    <BookOpen size={16} />
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience & Qualifications */}
            <section className="tutor-section">
              <h2>Experience & Qualifications</h2>
              <div className="experience-grid">
                <div className="experience-item">
                  <Clock size={20} />
                  <div>
                    <h4>Teaching Experience</h4>
                    <p>{tutor.experience || 0} years</p>
                  </div>
                </div>

                <div className="experience-item">
                  <Award size={20} />
                  <div>
                    <h4>Qualifications</h4>
                    <p>{tutor.qualifications || 'Not specified'}</p>
                  </div>
                </div>

                <div className="experience-item">
                  <Video size={20} />
                  <div>
                    <h4>Sessions Completed</h4>
                    <p>{tutorStats.completedSessions || 0} sessions</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews */}
            {ratings.length > 0 && (
              <section className="tutor-section">
                <h2>Recent Reviews</h2>
                <div className="reviews-list">
                  {ratings.map((rating) => (
                    <div key={rating._id} className="review-card">
                      <div className="review-header">
                        <div className="review-student">
                          <img
                            src={getAvatarUrl(rating.student)}
                            alt={rating.student.firstName}
                            className="review-avatar"
                          />
                          <span>{rating.student.firstName}</span>
                        </div>
                        <div className="review-rating">
                          {renderStars(rating.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{rating.comment}</p>
                      <span className="review-date">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="tutor-sidebar">
            <div className="sidebar-card">
              <h3>Quick Stats</h3>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="stat-label">Response Time</span>
                  <span className="stat-value">{tutorStats.responseTime || 'Quick'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Sessions</span>
                  <span className="stat-value">{tutorStats.totalSessions || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">
                    {new Date(tutor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Availability</h3>
              <p className="availability-text">
                Available most days. Book a session to see specific time slots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Book Session Modal */}
      <BookSession
        tutor={tutor}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default TutorProfile;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ratingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import StarRating from './StarRating';
import DetailedRatings from './DetailedRatings';
import TutorResponse from './TutorResponse';
import RatingActions from './RatingActions';
import './RatingCard.css';

const RatingCard = ({ rating, onUpdate, showTutorInfo = true, showActions = true }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState({
    helpful: rating.helpfulCount || 0,
    notHelpful: rating.notHelpfulCount || 0,
    userVote: rating.userVote || null
  });

  const isOwnRating = user && rating.student._id === user._id;
  const isTutor = user && rating.tutor._id === user._id;
  const canVote = user && !isOwnRating && !isTutor;

  const handleVote = async (isHelpful) => {
    try {
      if (helpfulVotes.userVote === isHelpful) {
        // Remove vote if clicking the same vote
        await ratingAPI.removeVote(rating._id);
        setHelpfulVotes(prev => ({
          helpful: prev.helpful - (isHelpful ? 1 : 0),
          notHelpful: prev.notHelpful - (!isHelpful ? 1 : 0),
          userVote: null
        }));
      } else {
        // Add or change vote
        await ratingAPI.voteOnRating(rating._id, { isHelpful });
        setHelpfulVotes(prev => ({
          helpful: prev.helpful + (isHelpful ? 1 : 0) - (prev.userVote === true ? 1 : 0),
          notHelpful: prev.notHelpful + (!isHelpful ? 1 : 0) - (prev.userVote === false ? 1 : 0),
          userVote: isHelpful
        }));
      }
    } catch (error) {
      console.error('Error voting on rating:', error);
      toast.error('Failed to record vote');
    }
  };

  const handleFlag = async (reason) => {
    try {
      await ratingAPI.flagRating(rating._id, { reason });
      toast.success('Rating flagged for review');
    } catch (error) {
      console.error('Error flagging rating:', error);
      toast.error('Failed to flag rating');
    }
  };

  const handleTutorResponse = async (response) => {
    try {
      await ratingAPI.addTutorResponse(rating._id, { response });
      toast.success('Response added successfully');
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error adding tutor response:', error);
      toast.error('Failed to add response');
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const ratingDate = new Date(date);
    const diffInDays = Math.floor((now - ratingDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className={`rating-card ${isOwnRating ? 'own-rating' : ''}`}>
      {/* Header */}
      <div className="rating-header">
        {showTutorInfo && (
          <div className="student-info">
            <img
              src={getAvatarUrl(rating.student)}
              alt={`${rating.student.firstName} ${rating.student.lastName}`}
              className="student-avatar"
            />
            <div className="student-details">
              <h4 className="student-name">
                {rating.student.firstName} {rating.student.lastName}
              </h4>
              <div className="rating-meta">
                <span className="rating-date">{getTimeAgo(rating.createdAt)}</span>
                {rating.session && (
                  <>
                    <span className="meta-separator">•</span>
                    <span className="session-subject">{rating.session.subject}</span>
                    <span className="meta-separator">•</span>
                    <span className="session-duration">{rating.session.duration}h session</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="rating-score">
          <StarRating rating={rating.rating} size="large" readonly />
          <span className="rating-number">{rating.rating}/5</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="rating-content">
        {rating.comment && (
          <div className="rating-comment">
            <p>{rating.comment}</p>
          </div>
        )}

        {/* Detailed Ratings */}
        {rating.detailedRatings && Object.keys(rating.detailedRatings).length > 0 && (
          <div className="detailed-ratings-section">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            >
              <span>Detailed Ratings</span>
              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
            </button>
            
            {isExpanded && (
              <DetailedRatings ratings={rating.detailedRatings} />
            )}
          </div>
        )}

        {/* Tutor Response */}
        {rating.tutorResponse && (
          <TutorResponse
            response={rating.tutorResponse}
            tutor={rating.tutor}
            responseDate={rating.tutorResponseDate}
          />
        )}

        {/* Add Response (for tutors) */}
        {isTutor && !rating.tutorResponse && (
          <TutorResponse
            onAddResponse={handleTutorResponse}
            isAdding={true}
          />
        )}
      </div>

      {/* Footer */}
      <div className="rating-footer">
        {/* Helpful Votes */}
        <div className="helpful-votes">
          <span className="helpful-label">Was this helpful?</span>
          <div className="vote-buttons">
            <button
              onClick={() => handleVote(true)}
              disabled={!canVote}
              className={`vote-btn helpful ${helpfulVotes.userVote === true ? 'active' : ''}`}
            >
              👍 {helpfulVotes.helpful}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={!canVote}
              className={`vote-btn not-helpful ${helpfulVotes.userVote === false ? 'active' : ''}`}
            >
              👎 {helpfulVotes.notHelpful}
            </button>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <RatingActions
            rating={rating}
            isOwnRating={isOwnRating}
            onFlag={handleFlag}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Verification Badge */}
      {rating.isVerified && (
        <div className="verification-badge" title="Verified session">
          ✓ Verified
        </div>
      )}

      {/* Flagged Indicator */}
      {rating.isFlagged && user?.role === 'admin' && (
        <div className="flagged-indicator" title="This rating has been flagged">
          ⚠️ Flagged
        </div>
      )}
    </div>
  );
};

export default RatingCard;

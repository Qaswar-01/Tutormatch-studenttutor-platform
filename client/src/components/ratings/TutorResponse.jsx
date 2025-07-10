import React, { useState } from 'react';
import { formatDate, getAvatarUrl } from '../../utils/helpers';
import './TutorResponse.css';

const TutorResponse = ({ 
  response, 
  tutor, 
  responseDate, 
  onAddResponse, 
  isAdding = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newResponse.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddResponse(newResponse.trim());
      setNewResponse('');
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const responseDateTime = new Date(date);
    const diffInDays = Math.floor((now - responseDateTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (isAdding) {
    return (
      <div className="tutor-response adding">
        <div className="response-header">
          <h5>Respond to this review</h5>
          <p>Share your perspective and show that you value student feedback</p>
        </div>
        
        <form onSubmit={handleSubmit} className="response-form">
          <textarea
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
            placeholder="Write a professional response to this review..."
            className="response-textarea"
            rows="4"
            maxLength="500"
            required
          />
          
          <div className="form-footer">
            <span className="character-count">
              {newResponse.length}/500 characters
            </span>
            
            <div className="form-actions">
              <button
                type="submit"
                disabled={!newResponse.trim() || isSubmitting}
                className="btn btn-primary btn-sm"
              >
                {isSubmitting ? 'Posting...' : 'Post Response'}
              </button>
            </div>
          </div>
        </form>
        
        <div className="response-tips">
          <h6>Tips for a good response:</h6>
          <ul>
            <li>Thank the student for their feedback</li>
            <li>Address any specific concerns mentioned</li>
            <li>Keep it professional and constructive</li>
            <li>Show how you're improving based on feedback</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!response) return null;

  const shouldTruncate = response.length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? response.substring(0, 200) + '...' 
    : response;

  return (
    <div className="tutor-response">
      <div className="response-header">
        <div className="tutor-info">
          <img
            src={getAvatarUrl(tutor)}
            alt={`${tutor.firstName} ${tutor.lastName}`}
            className="tutor-avatar"
          />
          <div className="tutor-details">
            <h5 className="tutor-name">
              Response from {tutor.firstName} {tutor.lastName}
            </h5>
            <div className="response-meta">
              <span className="response-date">
                {responseDate ? getTimeAgo(responseDate) : 'Recently'}
              </span>
              <span className="verified-badge">✓ Verified Tutor</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="response-content">
        <p className="response-text">{displayText}</p>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-response-btn"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorResponse;

import React from 'react';
import StarRating from './StarRating';
import './DetailedRatings.css';

const DetailedRatings = ({ ratings, onRatingChange, readonly = true }) => {
  const ratingCategories = [
    {
      key: 'communication',
      label: 'Communication',
      description: 'Clear explanations and responsiveness',
      icon: '💬'
    },
    {
      key: 'knowledge',
      label: 'Subject Knowledge',
      description: 'Expertise and understanding of the topic',
      icon: '🧠'
    },
    {
      key: 'punctuality',
      label: 'Punctuality',
      description: 'On-time arrival and session management',
      icon: '⏰'
    },
    {
      key: 'helpfulness',
      label: 'Helpfulness',
      description: 'Willingness to assist and support learning',
      icon: '🤝'
    },
    {
      key: 'overall',
      label: 'Overall Experience',
      description: 'General satisfaction with the session',
      icon: '⭐'
    }
  ];

  const handleRatingChange = (category, rating) => {
    if (onRatingChange) {
      onRatingChange(category, rating);
    }
  };

  const getAverageRating = () => {
    const validRatings = Object.values(ratings).filter(rating => rating > 0);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 3.5) return 'good';
    if (rating >= 2.5) return 'average';
    if (rating >= 1.5) return 'poor';
    return 'very-poor';
  };

  return (
    <div className="detailed-ratings">
      {!readonly && (
        <div className="detailed-ratings-header">
          <h4>Rate Different Aspects</h4>
          <p>Help other students by rating specific aspects of your tutoring experience</p>
        </div>
      )}

      <div className="rating-categories">
        {ratingCategories.map(category => {
          const rating = ratings[category.key] || 0;
          const colorClass = getRatingColor(rating);
          
          return (
            <div key={category.key} className={`rating-category ${colorClass}`}>
              <div className="category-info">
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-text">
                    <h5 className="category-label">{category.label}</h5>
                    <p className="category-description">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="category-rating">
                <StarRating
                  rating={rating}
                  onRatingChange={(newRating) => handleRatingChange(category.key, newRating)}
                  readonly={readonly}
                  size="medium"
                  showValue={readonly}
                />
              </div>
            </div>
          );
        })}
      </div>

      {readonly && Object.keys(ratings).length > 0 && (
        <div className="rating-summary">
          <div className="average-rating">
            <span className="average-label">Average:</span>
            <StarRating
              rating={getAverageRating()}
              readonly={true}
              size="small"
              showValue={true}
            />
          </div>
        </div>
      )}

      {!readonly && (
        <div className="rating-tips">
          <h5>Rating Guidelines:</h5>
          <ul>
            <li><strong>5 stars:</strong> Exceptional - Exceeded expectations</li>
            <li><strong>4 stars:</strong> Very Good - Met expectations well</li>
            <li><strong>3 stars:</strong> Good - Met basic expectations</li>
            <li><strong>2 stars:</strong> Fair - Below expectations</li>
            <li><strong>1 star:</strong> Poor - Well below expectations</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetailedRatings;

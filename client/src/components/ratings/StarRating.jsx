import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showValue = false,
  precision = 1 // 1 for whole stars, 0.5 for half stars
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const maxStars = 5;
  const currentRating = isHovering ? hoverRating : rating;

  const handleStarClick = (starValue) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starValue);
  };

  const handleStarHover = (starValue) => {
    if (readonly) return;
    setHoverRating(starValue);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setIsHovering(false);
    setHoverRating(0);
  };

  const getStarValue = (starIndex) => {
    if (precision === 0.5) {
      return starIndex + 0.5;
    }
    return starIndex + 1;
  };

  const getStarFill = (starIndex) => {
    const starValue = starIndex + 1;
    
    if (currentRating >= starValue) {
      return 'full';
    } else if (currentRating >= starValue - 0.5 && precision === 0.5) {
      return 'half';
    } else {
      return 'empty';
    }
  };

  const renderStar = (starIndex) => {
    const fill = getStarFill(starIndex);
    const starValue = getStarValue(starIndex);
    
    return (
      <button
        key={starIndex}
        type="button"
        className={`star-button ${fill} ${size} ${readonly ? 'readonly' : 'interactive'}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        disabled={readonly}
        aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <span className="star-icon">
          {fill === 'full' ? '★' : fill === 'half' ? '☆' : '☆'}
        </span>
        {fill === 'half' && (
          <span className="star-half-overlay">★</span>
        )}
      </button>
    );
  };

  const renderHalfStars = () => {
    const stars = [];
    
    for (let i = 0; i < maxStars; i++) {
      const starValue = i + 1;
      
      if (precision === 0.5) {
        // Render half-star button
        stars.push(
          <button
            key={`${i}-half`}
            type="button"
            className={`star-button half-star ${size} ${readonly ? 'readonly' : 'interactive'}`}
            onClick={() => handleStarClick(i + 0.5)}
            onMouseEnter={() => handleStarHover(i + 0.5)}
            disabled={readonly}
            aria-label={`Rate ${i + 0.5} stars`}
          >
            <span className="star-icon">☆</span>
            <span className={`star-half-overlay ${currentRating >= i + 0.5 ? 'visible' : ''}`}>
              ★
            </span>
          </button>
        );
      }
      
      // Render full star button
      stars.push(renderStar(i));
    }
    
    return stars;
  };

  return (
    <div 
      className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}
      onMouseLeave={handleMouseLeave}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Rating: ${rating} out of ${maxStars} stars` : 'Rate this item'}
    >
      <div className="stars-container">
        {precision === 0.5 ? renderHalfStars() : (
          Array.from({ length: maxStars }, (_, index) => renderStar(index))
        )}
      </div>
      
      {showValue && (
        <span className="rating-value">
          {currentRating.toFixed(precision === 0.5 ? 1 : 0)}/{maxStars}
        </span>
      )}
      
      {!readonly && isHovering && (
        <span className="rating-preview">
          {hoverRating.toFixed(precision === 0.5 ? 1 : 0)} star{hoverRating !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;

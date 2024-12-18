import React from 'react';
import './StarRating.css'; // opcjonalne, jeśli stylujesz gwiazdki

const StarRating = ({ rating, isUserRating = false }) => {
  return (
    <div className="star-rating">
      {Array(5)
        .fill(0)
        .map((_, index) => {
          const isFilled = index < Math.floor(rating);
          const isPartial = index === Math.floor(rating) && rating % 1 !== 0;
          const starClass = isUserRating ? 'user-rating-star' : 'average-rating-star';

          return (
            <span
              key={index}
              className={`star ${starClass} ${isFilled ? 'filled' : isPartial ? 'partial' : 'empty'}`}
              style={isPartial ? { '--clip-width': `${(rating % 1) * 100}%` } : {}}
            >
              ★
            </span>
          );
        })}
    </div>
  );
};

export default StarRating;

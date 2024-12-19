import React from 'react';
import '../styles/CommunityCocktailDetail.css';

const StarRating = ({ currentRating, isUserRating = false }) => {
  return (
    <div className="star-rating">
      {Array(5)
        .fill(0)
        .map((_, index) => {
          const isFilled = index < Math.floor(currentRating);
          const isPartial = index === Math.floor(currentRating) && currentRating % 1 !== 0;
          const starClass = isUserRating ? 'user-rating-star' : 'average-rating-star';

          return (
            <span
              key={index}
              className={`star ${starClass} ${isFilled ? 'filled' : isPartial ? 'partial' : 'empty'}`}
              style={isPartial ? { '--clip-width': `${(currentRating % 1) * 100}%` } : {}}
            >
              ★
            </span>
          );
        })}
    </div>
  );
};

export default StarRating;

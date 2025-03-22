import { useState, useEffect } from 'react';

const StarRating = ({ rating, onChange, max = 10 }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Create array of stars based on max rating
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  
  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= (hoveredRating || rating) ? 'filled' : 'empty'}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          {star <= (hoveredRating || rating) ? '★' : '☆'}
        </span>
      ))}
      <span className="rating-number">{rating}/{max}</span>
    </div>
  );
};

export default StarRating;
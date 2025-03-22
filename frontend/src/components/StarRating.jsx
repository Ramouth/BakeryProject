import { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

// Optimized star rating component with memoization
const StarRating = ({ 
  rating, 
  onChange, 
  max = 10,
  size = 'medium',
  disabled = false,
  showValue = true
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Create array of stars based on max rating
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  
  // Memoized callbacks for performance
  const handleMouseEnter = useCallback((star) => {
    if (!disabled) {
      setHoveredRating(star);
    }
  }, [disabled]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredRating(0);
  }, []);
  
  const handleClick = useCallback((star) => {
    if (!disabled) {
      onChange(star);
    }
  }, [onChange, disabled]);
  
  // Determine size class
  const sizeClass = `star-${size}`;
  
  return (
    <div className={`star-rating ${disabled ? 'disabled' : ''}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${sizeClass} ${star <= (hoveredRating || rating) ? 'filled' : 'empty'}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Rate ${star} of ${max}`}
        >
          {star <= (hoveredRating || rating) ? '★' : '☆'}
        </span>
      ))}
      {showValue && (
        <span className="rating-number">
          {rating}/{max}
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  showValue: PropTypes.bool
};

// Memoize to prevent unnecessary re-renders
export default memo(StarRating);
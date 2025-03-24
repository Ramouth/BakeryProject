import { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

// Progress bar rating component with 0-10 scale that displays current value
const RatingBar = ({ 
  rating = 0, // Default to 0 instead of requiring a value
  onChange, 
  max = 10,
  disabled = false,
  showValue = true
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Create array of rating values
  const ratingValues = Array.from({ length: max }, (_, i) => i + 1);
  
  // Memoized callbacks for performance
  const handleMouseEnter = useCallback((value) => {
    if (!disabled) {
      setHoveredRating(value);
    }
  }, [disabled]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredRating(0);
  }, []);
  
  const handleClick = useCallback((value) => {
    if (!disabled) {
      onChange(value);
    }
  }, [onChange, disabled]);

  return (
    <div className={`rating-bar-container ${disabled ? 'disabled' : ''}`}>
      <div 
        className="rating-bar"
        onMouseLeave={handleMouseLeave}
      >
        {ratingValues.map((value) => (
          <div
            key={value}
            className={`rating-segment ${value <= (hoveredRating || rating) ? 'filled' : 'empty'}`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Rate ${value} of ${max}`}
          />
        ))}
      </div>
      
      {showValue && (
        <div className="rating-value">
          {hoveredRating || rating}/{max}
        </div>
      )}
      
      {/* Rating scale numbers removed */}
    </div>
  );
};

RatingBar.propTypes = {
  rating: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  showValue: PropTypes.bool
};

// Memoize to prevent unnecessary re-renders
export default memo(RatingBar);
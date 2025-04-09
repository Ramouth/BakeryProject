import { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import '../styles/croissant-rating.css';

// Croissant rating component with left/right click zones for half/full ratings
const CroissantRating = ({ 
  rating = 0, 
  onChange, 
  max = 5,
  disabled = false,
  showValue = true
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Convert backend rating (1-10) to display rating (0.5-5)
  const displayRating = (rating / 2);
  
  // Handle mouse enter for a specific position
  const handleMouseMove = useCallback((event, croissantIndex) => {
    if (disabled) return;
    
    // Get the relative x position within the croissant
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftSide = x < rect.width / 2;
    
    // Calculate rating based on position (0.5 for left side, 1.0 for right side)
    const newRating = isLeftSide 
      ? croissantIndex + 0.5 
      : croissantIndex + 1.0;
    
    setHoveredRating(newRating);
  }, [disabled]);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredRating(0);
  }, []);
  
  // Handle click to set rating
  const handleClick = useCallback((event, croissantIndex) => {
    if (disabled) return;
    
    // Get the relative x position within the croissant
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftSide = x < rect.width / 2;
    
    // Calculate rating based on position (0.5 for left side, 1.0 for right side)
    const newRating = isLeftSide 
      ? croissantIndex + 0.5 
      : croissantIndex + 1.0;
    
    // Convert to backend scale (1-10) and pass to handler
    const backendRating = newRating * 2;
    onChange(backendRating);
  }, [onChange, disabled]);

  return (
    <div 
      className={`croissant-rating-container ${disabled ? 'disabled' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="croissant-rating">
        {/* Render croissants for each whole number */}
        {Array.from({ length: max }).map((_, index) => {
          // Calculate if this croissant should be filled fully, half, or empty
          const currentRating = hoveredRating || displayRating;
          let fillClass = 'empty';
          
          if (currentRating >= index + 1) {
            fillClass = 'full';
          } else if (currentRating > index && currentRating < index + 1) {
            fillClass = 'half';
          }
          
          return (
            <div
              key={index}
              className={`croissant-wrapper`}
              onClick={(e) => handleClick(e, index)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Rate between ${index + 0.5} and ${index + 1} out of ${max}`}
            >
              {/* Left/right indicators to help users understand the interaction */}
              <div className="click-zones">
                <div className="left-zone"></div>
                <div className="right-zone"></div>
              </div>
              
              {/* The actual croissant with appropriate fill level */}
              <div className={`croissant ${fillClass}`}>
                🥐
              </div>
            </div>
          );
        })}
      </div>
      
      {showValue && (
        <div className="rating-value">
            {(hoveredRating || displayRating).toFixed((hoveredRating || displayRating) % 1 === 0 ? 0 : 1)}/{max}
     </div>
    )}
    </div>
  );
};

CroissantRating.propTypes = {
  rating: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  showValue: PropTypes.bool
};

// Memoize to prevent unnecessary re-renders
export default memo(CroissantRating);
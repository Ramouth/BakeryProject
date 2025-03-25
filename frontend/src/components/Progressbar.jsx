import { memo } from 'react';
import PropTypes from 'prop-types';
import "../styles/ProgressBar.css";


const ProgressBar = ({ currentStep, totalSteps, steps }) => {
  // Calculate percentage for the progress bar
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar-wrapper">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
        
        {/* Display step indicators */}
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-indicator ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
            >
              <div className="step-dot"></div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ).isRequired
};

export default memo(ProgressBar);
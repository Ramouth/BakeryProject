import { useState, useEffect } from 'react';
import { useReview } from '../store/ReviewContext';
import RatingBar from '../components/RatingComponent';

const ThankYou = () => {
  const { 
    experienceRating, 
    setExperienceRating, 
    resetReview, 
    goToNextStep 
  } = useReview();
  
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset the review state immediately when component mounts
  useEffect(() => {
    // Reset review state to ensure fresh start for new reviews
    resetReview();
    
    // Still keep a timeout as a fallback
    const timer = setTimeout(() => {
      // Force reset review state again if user stays on page
      if (!isSubmitting) {
        resetReview();
      }
    }, 10000); // Reset after 10 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [resetReview, isSubmitting]);
  
  return (
    <div className="container">
      <div className="card">
        <h2>Thank You!</h2>
        <p>
          Your review has been saved.
        </p>
        
        <div className="review-experience-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem' }}>How was your experience?</h3>
          <p style={{ fontSize: '0.9rem' }}>Please rate your review experience:</p>
          
          <div className="rating-container">
            <div className="rating-row">
              <div className="rating-label">Your Rating:</div>
              <RatingBar 
                rating={experienceRating} 
                onChange={(value) => setExperienceRating(value)} 
                max={10}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="feedback">Additional Feedback (Optional):</label>
            <textarea
              id="feedback"
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any suggestions to improve our review process?"
            />
          </div>
        </div>
        
        <div className="nav-buttons" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            className="btn"
            onClick={() => goToNextStep('Start')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
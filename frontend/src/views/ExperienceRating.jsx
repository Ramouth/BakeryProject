import { useState } from 'react';
import { useReview } from '../store/reviewContext';
import StarRating from '../components/StarRating';

const ExperienceRating = () => {
  const { 
    experienceRating, 
    setExperienceRating, 
    submitExperienceRating,
    goToNextStep,
    resetReview
  } = useReview();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitExperienceRating();
      // Reset and go to thank you page
      goToNextStep('thankYou');
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h2>How was the review experience?</h2>
        <p>Please rate your experience with our review process</p>
        
        <div className="form-group">
          <label>Rating (1-10):</label>
          <StarRating 
            rating={experienceRating} 
            onChange={(value) => setExperienceRating(value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="feedback">Additional Feedback (Optional):</label>
          <textarea
            id="feedback"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any suggestions or comments about the review process?"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceRating;
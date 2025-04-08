import { useEffect } from 'react';
import { useReview } from '../store/ReviewContext';
import RatingBar from '../components/RatingComponent';

const ThankYou = () => {
  const { 
    experienceRating, 
    setExperienceRating, 
    resetReview 
  } = useReview();

  // Reset the review state immediately when component mounts
  useEffect(() => {
    resetReview();
  }, [resetReview]);

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
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
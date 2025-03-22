import { useState } from 'react';
import { useReview } from '../store/reviewContext';
import StarRating from '../components/StarRating';

const BakeryRating = () => {
  const { 
    selectedBakery, 
    bakeryRatings, 
    setBakeryRatings, 
    submitBakeryReview,
    goToNextStep 
  } = useReview();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle rating changes
  const handleRatingChange = (field, value) => {
    setBakeryRatings({
      ...bakeryRatings,
      [field]: value
    });
  };
  
  // Handle comments change
  const handleCommentsChange = (e) => {
    setBakeryRatings({
      ...bakeryRatings,
      comments: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitBakeryReview();
      goToNextStep('experienceRating');
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h2>Bakery Rating</h2>
        <p>
          Rate {selectedBakery.name}
        </p>
        
        <div className="form-group">
          <label>Overall Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.overall} 
            onChange={(value) => handleRatingChange('overall', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Service Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.service} 
            onChange={(value) => handleRatingChange('service', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Price Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.price} 
            onChange={(value) => handleRatingChange('price', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Atmosphere Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.atmosphere} 
            onChange={(value) => handleRatingChange('atmosphere', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Location Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.location} 
            onChange={(value) => handleRatingChange('location', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Selection Rating (1-10):</label>
          <StarRating 
            rating={bakeryRatings.selection} 
            onChange={(value) => handleRatingChange('selection', value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="comments">Comments (Optional):</label>
          <textarea
            id="comments"
            rows="4"
            value={bakeryRatings.comments}
            onChange={handleCommentsChange}
            placeholder="Share your thoughts about this bakery..."
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="nav-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => goToNextStep('reviewOptions')}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button 
            className="btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BakeryRating;
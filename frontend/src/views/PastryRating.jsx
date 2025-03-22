import { useState } from 'react';
import { useReview } from '../store/reviewContext';
import StarRating from '../components/StarRating';

const PastryRating = () => {
  const { 
    selectedBakery, 
    selectedPastry, 
    pastryRatings, 
    setPastryRatings, 
    submitPastryReview,
    goToNextStep 
  } = useReview();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle rating changes
  const handleRatingChange = (field, value) => {
    setPastryRatings({
      ...pastryRatings,
      [field]: value
    });
  };
  
  // Handle comments change
  const handleCommentsChange = (e) => {
    setPastryRatings({
      ...pastryRatings,
      comments: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitPastryReview();
      goToNextStep('reviewOptions');
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display pastry name
  const pastryName = selectedPastry.name === 'Other' 
    ? selectedPastry.customName 
    : selectedPastry.name;
  
  return (
    <div className="container">
      <div className="card">
        <h2>Pastry Rating</h2>
        <p>
          Rate your {pastryName} from {selectedBakery.name}
        </p>
        
        <div className="form-group">
          <label>Overall Rating (1-10):</label>
          <StarRating 
            rating={pastryRatings.overall} 
            onChange={(value) => handleRatingChange('overall', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Taste Rating (1-10):</label>
          <StarRating 
            rating={pastryRatings.taste} 
            onChange={(value) => handleRatingChange('taste', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Price Rating (1-10):</label>
          <StarRating 
            rating={pastryRatings.price} 
            onChange={(value) => handleRatingChange('price', value)} 
          />
        </div>
        
        <div className="form-group">
          <label>Presentation Rating (1-10):</label>
          <StarRating 
            rating={pastryRatings.presentation} 
            onChange={(value) => handleRatingChange('presentation', value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="comments">Comments (Optional):</label>
          <textarea
            id="comments"
            rows="4"
            value={pastryRatings.comments}
            onChange={handleCommentsChange}
            placeholder="Share your thoughts about this pastry..."
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="nav-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => goToNextStep('pastrySelection')}
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

export default PastryRating;
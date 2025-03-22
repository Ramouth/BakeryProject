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
        <h2>Your Review:</h2>
        <p>
          {selectedBakery.name} - {pastryName}
        </p>
        
        <div className="rating-container">
          <div className="rating-row">
            <div className="rating-label">Overall:</div>
            <StarRating 
              rating={pastryRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Taste:</div>
            <StarRating 
              rating={pastryRatings.taste} 
              onChange={(value) => handleRatingChange('taste', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Value:</div>
            <StarRating 
              rating={pastryRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Presentation:</div>
            <StarRating 
              rating={pastryRatings.presentation} 
              onChange={(value) => handleRatingChange('presentation', value)} 
              max={5}
            />
          </div>
        </div>
        
        <div className="form-group">
          <textarea
            rows="3"
            value={pastryRatings.comments}
            onChange={handleCommentsChange}
            placeholder="Add additional comments..."
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('pastrySelection')}
            disabled={isSubmitting}
          >
            Back
          </button>
          {/* Repeat review button removed */}
          <button 
            className="btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastryRating;
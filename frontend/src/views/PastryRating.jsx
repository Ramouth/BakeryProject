import { useState } from 'react';
import { useReview } from '../store/reviewContext';
import { useNotification } from '../store/NotificationContext';
import RatingBar from '../components/RatingComponent';

const PastryRating = () => {
  const { 
    selectedBakery, 
    selectedPastry, 
    pastryRatings, 
    setPastryRatings, 
    submitPastryReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Handle form submission - now directly uses the ReviewContext method
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate that overall rating is provided
      if (pastryRatings.overall <= 0) {
        showError("Please provide an overall rating");
        setIsSubmitting(false);
        return;
      }
      
      // This will now handle anonymous reviews
      await submitPastryReview();
      
      // Show success notification
      showSuccess("Pastry review saved successfully!");
      
      // Navigate to next step
      goToNextStep('reviewOptions');
    } catch (err) {
      // Show error notification
      showError(`Failed to submit review: ${err.message || "Please try again"}`);
      console.error('Error submitting review:', err);
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
            <RatingBar 
              rating={pastryRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={10}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Taste:</div>
            <RatingBar 
              rating={pastryRatings.taste} 
              onChange={(value) => handleRatingChange('taste', value)} 
              max={10}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Value:</div>
            <RatingBar 
              rating={pastryRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={10}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Presentation:</div>
            <RatingBar 
              rating={pastryRatings.presentation} 
              onChange={(value) => handleRatingChange('presentation', value)} 
              max={10}
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
        
        <div className="nav-buttons">
          <button 
            className="btn"
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
            {isSubmitting ? 'Submitting...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastryRating;
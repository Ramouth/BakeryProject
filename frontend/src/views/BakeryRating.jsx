import { useState } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';
import CroissantRating from '../components/CroissantRatingComponent.jsx';

const BakeryRating = () => {
  const { 
    selectedBakery, 
    bakeryRatings, 
    setBakeryRatings, 
    submitBakeryReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle rating changes - rating will already be in 1-10 scale from CroissantRating component
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
  
  // Handle form submission - now directly uses the ReviewContext method
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate overall rating is provided
      if (bakeryRatings.overall <= 0) {
        showError("Please provide an overall rating");
        setIsSubmitting(false);
        return;
      }
      
      // This will now handle anonymous reviews
      await submitBakeryReview();
      
      // Show success notification
      showSuccess("Bakery review saved successfully!");
      
      // Navigate to next step
      goToNextStep('experienceRating');
    } catch (err) {
      // Show error notification
      showError(`Failed to submit review: ${err.message || "Please try again"}`);
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container">
      <div className="card">
        <h2>Bakery Rating</h2>
        <p>
          Rate {selectedBakery.name} with Croissants!
        </p>
        
        <div className="rating-container">
          <div className="rating-row">
            <div className="rating-label">Overall:</div>
            <CroissantRating 
              rating={bakeryRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Service:</div>
            <CroissantRating 
              rating={bakeryRatings.service} 
              onChange={(value) => handleRatingChange('service', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Price:</div>
            <CroissantRating 
              rating={bakeryRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Atmosphere:</div>
            <CroissantRating 
              rating={bakeryRatings.atmosphere} 
              onChange={(value) => handleRatingChange('atmosphere', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Location:</div>
            <CroissantRating 
              rating={bakeryRatings.location} 
              onChange={(value) => handleRatingChange('location', value)} 
              max={5}
            />
          </div>
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
        
        <div className="nav-buttons">
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
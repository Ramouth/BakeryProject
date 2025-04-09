import { useState } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';
import CroissantRating from '../components/CroissantRatingComponent.jsx';

const ProductRating = () => {
  const { 
    selectedBakery, 
    selectedProduct, 
    productRatings, 
    setProductRatings, 
    submitProductReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle rating changes - rating will already be in 1-10 scale from CroissantRating component
  const handleRatingChange = (field, value) => {
    setProductRatings({
      ...productRatings,
      [field]: value
    });
  };
  
  // Handle comments change
  const handleCommentsChange = (e) => {
    setProductRatings({
      ...productRatings,
      comments: e.target.value
    });
  };
  
  // Handle form submission - now directly uses the ReviewContext method
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate that overall rating is provided
      if (productRatings.overall <= 0) {
        showError("Please provide an overall rating");
        setIsSubmitting(false);
        return;
      }
      
      // This will now handle anonymous reviews
      await submitProductReview();
      
      // Show success notification
      showSuccess("Product review saved successfully!");
      
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
  
  // Display product name
  const productName = selectedProduct.name === 'Other' 
    ? selectedProduct.customName 
    : selectedProduct.name;
  
  return (
    <div className="container">
      <div className="card">
        <h2>Your Review:</h2>
        <p>
          {selectedBakery.name} - {productName}
        </p>
        
        <div className="rating-container">
          <div className="rating-row">
            <div className="rating-label">Overall:</div>
            <CroissantRating 
              rating={productRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Taste:</div>
            <CroissantRating 
              rating={productRatings.taste} 
              onChange={(value) => handleRatingChange('taste', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Value:</div>
            <CroissantRating 
              rating={productRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Presentation:</div>
            <CroissantRating 
              rating={productRatings.presentation} 
              onChange={(value) => handleRatingChange('presentation', value)} 
              max={5}
            />
          </div>
        </div>
        
        <div className="form-group">
          <textarea
            rows="3"
            value={productRatings.comments}
            onChange={handleCommentsChange}
            placeholder="Add additional comments..."
          />
        </div>
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('productSelection')}
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

export default ProductRating;
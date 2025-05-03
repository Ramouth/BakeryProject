import { useProductRatingViewModel } from '../viewmodels/useProductRatingViewModel';
import CookieRating from '../components/CookieRatingComponent.jsx';

const ProductRating = () => {
  const {
    selectedBakery,
    productRatings,
    isSubmitting,
    productName,
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  } = useProductRatingViewModel();
  
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
            <CookieRating 
              rating={productRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Taste:</div>
            <CookieRating 
              rating={productRatings.taste} 
              onChange={(value) => handleRatingChange('taste', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Value:</div>
            <CookieRating 
              rating={productRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Presentation:</div>
            <CookieRating 
              rating={productRatings.presentation} 
              onChange={(value) => handleRatingChange('presentation', value)} 
              max={5}
            />
          </div>
        </div>
        
        <div className="form-group">
          <div className="textarea-container">
             <textarea
               rows="3"
               value={productRatings.comments}
               onChange={(e) => {
                 // Only update if under the character limit
                 if (e.target.value.length <= 280) {
                   handleCommentsChange(e);
                 }
               }}
               maxLength={280}
               placeholder="Add additional comments..."
             />
             <div className="character-count">
               <span className={productRatings.comments.length > 200 ? (productRatings.comments.length > 250 ? "count-warning" : "count-notice") : ""}>
                 {productRatings.comments.length}/280
               </span>
             </div>
           </div>
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
import { useBakeryRatingViewModel } from '../viewmodels/useBakeryRatingViewModel';
import CookieRating from '../components/CookieRatingComponent.jsx';

const BakeryRating = () => {
  const {
    selectedBakery,
    bakeryRatings,
    isSubmitting,
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  } = useBakeryRatingViewModel();
  
  return (
    <div className="container">
      <div className="card">
        <h2>Bakery Rating</h2>
        <p>
          Rate {selectedBakery.name} with Cookies!
        </p>
        
        <div className="rating-container">
          <div className="rating-row">
            <div className="rating-label">Overall:</div>
            <CookieRating 
              rating={bakeryRatings.overall} 
              onChange={(value) => handleRatingChange('overall', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Service:</div>
            <CookieRating 
              rating={bakeryRatings.service} 
              onChange={(value) => handleRatingChange('service', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Price:</div>
            <CookieRating 
              rating={bakeryRatings.price} 
              onChange={(value) => handleRatingChange('price', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Atmosphere:</div>
            <CookieRating 
              rating={bakeryRatings.atmosphere} 
              onChange={(value) => handleRatingChange('atmosphere', value)} 
              max={5}
            />
          </div>
          
          <div className="rating-row">
            <div className="rating-label">Location:</div>
            <CookieRating 
              rating={bakeryRatings.location} 
              onChange={(value) => handleRatingChange('location', value)} 
              max={5}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comments">Comments (Optional):</label>
          <div className="textarea-container">
             <textarea
               id="comments"
               rows="4"
               value={bakeryRatings.comments}
               onChange={(e) => {
                 // Only update if under the character limit
                 if (e.target.value.length <= 280) {
                   handleCommentsChange(e);
                 }
               }}
               maxLength={280}
               placeholder="Share your thoughts about this bakery..."
             />
             <div className="character-count">
               <span className={bakeryRatings.comments.length > 200 ? (bakeryRatings.comments.length > 250 ? "count-warning" : "count-notice") : ""}>
                 {bakeryRatings.comments.length}/280
               </span>
             </div>
           </div>
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
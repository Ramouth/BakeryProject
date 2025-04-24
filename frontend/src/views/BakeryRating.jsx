import { useBakeryRatingViewModel } from '../viewmodels/useBakeryRatingViewModel';
import CroissantRating from '../components/CroissantRatingComponent.jsx';

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
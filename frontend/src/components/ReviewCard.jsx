import { Link } from 'react-router-dom';

const ReviewCard = ({ review, formatDate, handleDeleteReview, loading }) => {
  // Helper function to format names for URLs
  const formatNameForUrl = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Helper to render cookie rating display
  const renderCookieRating = (rating) => {
    const displayRating = rating; // Already in 0-5 scale
    const fullCookies = Math.floor(displayRating);
    const hasHalfCookie = displayRating % 1 >= 0.5;
    const emptyCookies = 5 - fullCookies - (hasHalfCookie ? 1 : 0);
    
    return (
      <div className="cookie-display cookie-small">
        {Array(fullCookies).fill().map((_, i) => (
          <span key={`full-${i}`} className="cookie-filled">🍪</span>
        ))}
        {hasHalfCookie && (
          <div className="cookie-half-container">
            <span className="cookie-half">🍪</span>
          </div>
        )}
        {Array(emptyCookies).fill().map((_, i) => (
          <span key={`empty-${i}`} className="cookie-empty">🍪</span>
        ))}
      </div>
    );
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-title-section">
          {/* Product/Bakery Name as Link */}
          {review.type === 'bakery' ? (
            <Link 
              to={`/bakery/${encodeURIComponent(formatNameForUrl(review.itemName))}`} 
              className="review-item-name"
            >
              {review.itemName}
            </Link>
          ) : (
            <Link 
              to={`/product/${review.itemId}`} 
              className="review-item-name"
            >
              {review.itemName}
            </Link>
          )}
          
          {/* Bakery Name for Product Reviews */}
          {review.type === 'product' && review.bakeryName && (
            <Link 
              to={`/bakery/${encodeURIComponent(formatNameForUrl(review.bakeryName))}`}
              className="review-bakery-name"
            >
              {review.bakeryName}
            </Link>
          )}
        </div>
        
        <span className="review-type-badge">
          {review.type === 'bakery' ? 'Bakery' : 'Product'}
        </span>
      </div>
      
      <div className="review-rating-row">
        <div className="rating-value">{review.rating.toFixed(1)}</div>
        {renderCookieRating(review.rating)}
        <div className="review-date">{formatDate(review.date)}</div>
      </div>
      
      <p className="review-comment">{review.comment}</p>
      
      <div className="review-actions">
        <button 
          className="review-action-btn edit-btn"
          aria-label="Edit review"
        >
          Edit
        </button>
        <button 
          className="review-action-btn delete-btn"
          onClick={() => handleDeleteReview(review.id, review.type)}
          disabled={loading}
          aria-label="Delete review"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
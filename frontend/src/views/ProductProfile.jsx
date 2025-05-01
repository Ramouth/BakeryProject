import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProductProfileViewModel } from '../viewmodels/useProductProfileViewModel';
import ReviewModal from '../components/ReviewModal';
import '../styles/product-profile.css';
import '../styles/cookie-display.css';

const ProductProfile = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const {
    product,
    bakery,
    productReviews,
    similarProducts,
    loading,
    error,
    activeTab,
    setActiveTab,
    calculateRatings,
    formatDate
  } = useProductProfileViewModel(productId);

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  // Helper function to render cookie stars - same as in BakeryProfile
  const renderCookieStars = (rating, size = 'medium') => {
    const displayRating = rating / 2;
    const fullCookies = Math.floor(displayRating);
    const hasHalfCookie = displayRating % 1 >= 0.5;
    const emptyCookies = 5 - fullCookies - (hasHalfCookie ? 1 : 0);
    
    const sizeClass = size === 'large' ? 'cookie-large' : 
                     size === 'small' ? 'cookie-small' : '';
    
    return (
      <div className={`cookie-display ${sizeClass}`}>
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p className="error-message">Product not found</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const ratings = calculateRatings();
  const reviewCount = productReviews.length;
  
  // Format bakery name for URL
  const formatBakeryNameForUrl = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="product-profile-container">
      <div className="product-header">
        <div className="product-header-content">
          <div className="product-bakery">
            {bakery && <Link to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(bakery.name))}`}>{bakery.name}</Link>}
          </div>
          <h1>{product.name}</h1>
          <div className="product-rating-summary">
            <span className="product-rating-value">{(ratings.overall / 2).toFixed(1)}</span>
            {renderCookieStars(ratings.overall)}
            <span className="product-review-count">({reviewCount} reviews)</span>
          </div>
        </div>
        <div className="product-image-container">
          <div className="product-image-placeholder">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.name} className="product-image" />
            )}
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <button 
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button 
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      <div className="product-content">
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <div className="reviews-summary">
              <div className="reviews-total">
                <span className="large-rating">{(ratings.overall / 2).toFixed(1)}</span>
                {renderCookieStars(ratings.overall, 'large')}
                <span className="total-reviews">{reviewCount} reviews</span>
              </div>
              
              <div className="rating-details">
                <div className="rating-item">
                  <span className="rating-label">Overall:</span>
                  <span className="rating-numeric-value">{(ratings.overall / 2).toFixed(1)}</span>
                  {renderCookieStars(ratings.overall)}
                </div>
                <div className="rating-item">
                  <span className="rating-label">Taste:</span>
                  <span className="rating-numeric-value">{(ratings.taste / 2).toFixed(1)}</span>
                  {renderCookieStars(ratings.taste)}
                </div>
                <div className="rating-item">
                  <span className="rating-label">Price:</span>
                  <span className="rating-numeric-value">{(ratings.price / 2).toFixed(1)}</span>
                  {renderCookieStars(ratings.price)}
                </div>
                <div className="rating-item">
                  <span className="rating-label">Presentation:</span>
                  <span className="rating-numeric-value">{(ratings.presentation / 2).toFixed(1)}</span>
                  {renderCookieStars(ratings.presentation)}
                </div>
              </div>
              
              <button className="btn btn-primary" onClick={openReviewModal}>Write a Review</button>
            </div>
            
            <div className="reviews-list">
              {productReviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product!</p>
              ) : (
                productReviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.username || 'Anonymous'}</span>
                      <span className="review-date">{formatDate(review.created_at)}</span>
                    </div>
                    
                    <div className="review-rating">
                      {renderCookieStars(review.overallRating)}
                    </div>
                    
                    <p className="review-text">{review.review}</p>
                  </div>
                ))
              )}
              
              {productReviews.length > 0 && (
                <button className="btn btn-secondary load-more">Load More Reviews</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-section">
            <h2>About this {product.name}</h2>
            <p className="product-description">
              {product.description || `${product.name} is a delicious product offered by ${bakery?.name || 'this bakery'}.`}
            </p>
            
            <div className="product-details">
              <div className="availability-section">
                <h3>Availability</h3>
                <p>{product.availability || 'Available daily'}</p>
                {bakery && (
                  <p>
                    Available at <Link to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(bakery.name))}`}>{bakery.name}</Link>, {bakery.address}
                  </p>
                )}
              </div>
              
              <div className="serving-section">
                <h3>Category</h3>
                <p>{product.category || 'Pastry'}</p>
              </div>
            </div>
            
            <div className="similar-products-section">
              <h3>Similar Products</h3>
              {similarProducts.length === 0 ? (
                <p>No similar products found.</p>
              ) : (
                <div className="similar-products">
                  {similarProducts.map(item => (
                    <div key={item.id} className="similar-product-card">
                      <div className="similar-product-img-placeholder">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="similar-product-image" />
                        )}
                      </div>
                      <div className="similar-product-info">
                        <h4>{item.name}</h4>
                        <div className="similar-product-bakery">
                          {bakery && <Link to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(bakery.name))}`}>{bakery.name}</Link>}
                        </div>
                        <Link to={`/product/${item.id}`} className="btn btn-small">View</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={closeReviewModal}
        initialReviewType="product"
        initialSelectedItem={product}
      />
    </div>
  );
};

export default ProductProfile;
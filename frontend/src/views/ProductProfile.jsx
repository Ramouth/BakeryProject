import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProductProfileViewModel } from '../viewmodels/useProductProfileViewModel';
import ReviewModal from '../components/ReviewModal';

const ProductProfile = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Lifecycle logging for debugging
  useEffect(() => {
    console.log(`ProductProfile mounted/updated for product ${productId}`);
    return () => {
      console.log(`ProductProfile unmounting for product ${productId}`);
    };
  }, [productId]);

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
    formatDate,
  } = useProductProfileViewModel(productId);

  const openReviewModal = () => setIsReviewModalOpen(true);
  const closeReviewModal = () => setIsReviewModalOpen(false);

  // Helper to render cookie stars
  const renderCookieStars = (rating, size = 'medium') => {
    const displayRating = rating / 2;
    const full = Math.floor(displayRating);
    const half = displayRating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    const sizeClass = size === 'large' ? 'cookie-large' :
                      size === 'small' ? 'cookie-small' : '';

    return (
      <div className={`cookie-display ${sizeClass}`}>
        {Array(full).fill().map((_, i) => (
          <span key={`full-${i}`} className="cookie-filled">🍪</span>
        ))}
        {half && (
          <div className="cookie-half-container">
            <span className="cookie-half">🍪</span>
          </div>
        )}
        {Array(empty).fill().map((_, i) => (
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
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p className="error-message">Product not found</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const ratings = calculateRatings();
  const reviewCount = productReviews.length;

  const formatBakeryUrl = (name) =>
    name ? name.toLowerCase().replace(/\s+/g, '-') : '';

  return (
    <div className="product-profile-container">
      <div className="product-header">
        <div className="product-header-content">
          {bakery && (
            <div className="product-bakery">
              <Link to={`/bakery/${encodeURIComponent(formatBakeryUrl(bakery.name))}`}>
                {bakery.name}
              </Link>
            </div>
          )}
          <h1>{product.name}</h1>
          <div className="product-rating-summary">
            <span className="product-rating-value">{(ratings.overall / 2).toFixed(1)}</span>
            {renderCookieStars(ratings.overall)}
            <span className="product-review-count">({reviewCount} reviews)</span>
          </div>
        </div>
        <div className="product-image-container">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="product-image" />
          ) : (
            <div className="product-image-placeholder"></div>
          )}
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
                {['overall', 'taste', 'price', 'presentation'].map((key) => (
                  <div key={key} className="rating-item">
                    <span className="rating-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="rating-numeric-value">
                      {(ratings[key] / 2).toFixed(1)}
                    </span>
                    {renderCookieStars(ratings[key])}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={openReviewModal}>
                Write a Review
              </button>
            </div>

            <div className="reviews-list">
              {productReviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product!</p>
              ) : (
                productReviews.map((review) => {
                  // Debug each review as it's rendered
                  console.log("Rendering review:", review);
                  console.log("Username:", review.username);
                  console.log("UserId:", review.userId);
                  
                  return (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="reviewer-name">
                          {/* Try all possible ways to get username */}
                          {review.username || (review.userId ? `User ${review.userId}` : 'Anonymous')}
                        </span>
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                      <div className="review-rating">
                        {renderCookieStars(review.overallRating)}
                      </div>
                      <p className="review-text">{review.review}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="details-section">
            <h2>About this {product.name}</h2>
            <p className="product-description">
              {product.description ||
                `${product.name} is a delicious product offered by ${bakery?.name || 'this bakery'}.`}
            </p>
            <div className="product-details">
              <div className="availability-section">
                <h3>Availability</h3>
                <p>{product.availability || 'Available daily'}</p>
                {bakery && (
                  <p>
                    Available at{' '}
                    <Link to={`/bakery/${encodeURIComponent(formatBakeryUrl(bakery.name))}`}>
                      {bakery.name}
                    </Link>
                    , {bakery.address}
                  </p>
                )}
              </div>
              <div className="serving-section">
                <h3>Category</h3>
                <p>{product.category?.name || 'Uncategorized'}</p>
                {product.subcategory && <p className="subcategory">{product.subcategory.name}</p>}
              </div>
              <div className="similar-products-section">
                <h3>Similar Products</h3>
                {similarProducts.length === 0 ? (
                  <p>No similar products found.</p>
                ) : (
                  <div className="similar-products">
                    {similarProducts.map((item) => (
                      <div key={item.id} className="similar-product-card">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="similar-product-image"
                          />
                        ) : (
                          <div className="similar-product-img-placeholder"></div>
                        )}
                        <div className="similar-product-info">
                          <h4>{item.name}</h4>
                          <Link to={`/product/${item.id}`} className="btn btn-small">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
// Update the BakeryProfile.jsx file to add review functionality
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBakeryProfileViewModel } from '../viewmodels/useBakeryProfileViewModel';
import CookieRating from '../components/CookieRatingComponent';
import ReviewModal from '../components/ReviewModal';
import bakeryLogo from '../assets/bageri-logo.jpeg';
import bakeryHeader from '../assets/bageri.jpeg';
import '../styles/bakery-profile.css';
import apiClient from '../services/api';

const BakeryProfile = () => {
  const { bakeryName } = useParams();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Clear relevant cache when component mounts or bakeryName changes
  useEffect(() => {
    console.log(`BakeryProfile mounted/updated for ${bakeryName}`);
    
    // Force clear all bakery-related caches
    apiClient.clearCacheForUrl(`/bakeries`);
    apiClient.invalidateCacheByTags(['bakery-reviews', 'api-request']);
    
    // Debug the cache state
    apiClient.debugCache();
    
    // Cleanup on unmount
    return () => {
      console.log(`BakeryProfile unmounting for ${bakeryName}`);
    };
  }, [bakeryName]);
  
  const {
    bakery,
    bakeryProducts,
    bakeryReviews,
    bakeryStats,
    loading,
    error,
    activeTab,
    setActiveTab,
    getTopRatedProducts,
    formatDate
  } = useBakeryProfileViewModel(bakeryName);

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bakery information for {bakeryName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/bakery-rankings" className="btn btn-primary">Back to Bakeries</Link>
      </div>
    );
  }

  if (!bakery) {
    return (
      <div className="error-container">
        <p className="error-message">Bakery not found: {bakeryName}</p>
        <Link to="/bakery-rankings" className="btn btn-primary">Back to Bakeries</Link>
      </div>
    );
  }

  // Helper function to render cookie stars
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

  // Mock opening hours
  const openingHours = {
    monday: "7:00 - 19:00",
    tuesday: "7:00 - 19:00",
    wednesday: "7:00 - 19:00",
    thursday: "7:00 - 19:00",
    friday: "7:00 - 19:00",
    saturday: "7:00 - 19:00",
    sunday: "7:00 - 18:00"
  };

  const ratings = bakeryStats?.ratings || {
    overall: 0,
    service: 0,
    price: 0,
    atmosphere: 0,
    location: 0
  };

  const reviewCount = bakeryStats?.review_count || bakeryReviews.length || 0;
  const bakeryImageUrl = bakery.imageUrl || bakeryHeader;
  const bakeryLogoUrl = bakery.logoUrl || bakeryLogo;

  return (
    <div className="bakery-profile-container">
      <div className="bakery-header" style={{ backgroundImage: `url(${bakeryImageUrl})` }}>
        <div className="bakery-header-overlay">
          <div className="bakery-logo-container">
            <img src={bakeryLogoUrl} alt={`${bakery.name} logo`} className="bakery-logo" />
          </div>
        </div>
      </div>

      <div className="bakery-content">
        <div className="bakery-info-header">
          <div className="bakery-title-section">
            <h1>{bakery.name}</h1>
            <p className="bakery-address">{bakery.address}</p>
            
            <div className="bakery-rating-summary">
              <span className="bakery-rating-value">{((ratings.overall || 0) / 2).toFixed(1)}</span>
              {renderCookieStars(ratings.overall || 0)}
              <span className="bakery-review-count">({reviewCount} reviews)</span>
            </div>
          </div>
          
          <div className="bakery-actions">
            <button className="btn btn-primary" onClick={openReviewModal}>Write a Review</button>
            <button className="btn btn-secondary">Share</button>
          </div>
        </div>

        <div className="bakery-tabs">
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-info">
                <h2>About {bakery.name}</h2>
                <p className="bakery-description">
                  {bakery.description || 
                    `${bakery.name} is a quality bakery located in Copenhagen offering a range of delicious baked goods and pastries. Visit us to experience authentic Danish baking.`}
                </p>
                
                <div className="bakery-details">
                  <div className="hours-section">
                    <h3>Opening Hours</h3>
                    <ul className="hours-list">
                      {Object.entries(openingHours).map(([day, hours]) => (
                        <li key={day}>
                          <span>{day.charAt(0).toUpperCase() + day.slice(1)}:</span> {hours}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="ratings-section">
                    <h3>Detailed Ratings</h3>
                    <div className="rating-details">
                      {Object.entries(ratings).map(([label, value]) => (
                        <div key={label} className="rating-item">
                          <span className="rating-label">{label.charAt(0).toUpperCase() + label.slice(1)}:</span>
                          <CookieRating rating={value} max={5} disabled={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="most-popular-section">
                <h3>Most Popular Items</h3>
                <div className="popular-items">
                  {getTopRatedProducts().length > 0 ? (
                    getTopRatedProducts().map(product => (
                      <Link to={`/product/${product.id}`} key={product.id} className="popular-item">
                        <div className="popular-item-img-placeholder"></div>
                        <div className="popular-item-info">
                          <h4>{product.name}</h4>
                          <div className="popular-item-rating">
                            <span>{((product.rating || product.average_rating || 0) / 2).toFixed(1)}</span>
                            {renderCookieStars(product.rating || product.average_rating || 0, 'small')}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p>No products available for this bakery yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="menu-section">
              <h2>Menu</h2>
              {bakeryProducts.length > 0 ? (
                <div className="product-grid">
                  {bakeryProducts.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                      <div className="product-image">
                        <div className="placeholder-image"></div>
                      </div>
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        {(product.rating || product.average_rating) && (
                          <div className="product-rating">
                            <span>{((product.rating || product.average_rating) / 2).toFixed(1)}</span>
                            {renderCookieStars(product.rating || product.average_rating, 'small')}
                          </div>
                        )}
                        {product.category && (
                          <div className="product-category">{typeof product.category === 'object' ? product.category.name : product.category}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No menu items available for this bakery yet.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              
              <div className="reviews-summary">
                <div className="reviews-total">
                  <span className="large-rating">{((ratings.overall || 0) / 2).toFixed(1)}</span>
                  {renderCookieStars(ratings.overall || 0, 'large')}
                  <span className="total-reviews">{reviewCount} reviews</span>
                </div>
                
                <button className="btn btn-primary" onClick={openReviewModal}>Write a Review</button>
              </div>
              
              <div className="reviews-list">
                {bakeryReviews.length > 0 ? (
                  bakeryReviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="reviewer-name">{review.username || 'Anonymous'}</span>
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                      
                      <div className="review-rating">
                        {renderCookieStars(review.overallRating || 0)}
                      </div>
                      
                      <p className="review-text">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet. Be the first to review this bakery!</p>
                )}
                
                {bakeryReviews.length > 0 && (
                  <button className="btn btn-secondary load-more">Load More Reviews</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={closeReviewModal}
        initialReviewType="bakery"
        initialSelectedItem={bakery}
      />
    </div>
  );
};

export default BakeryProfile;
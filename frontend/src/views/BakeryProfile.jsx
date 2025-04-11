import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CroissantRating from '../components/CroissantRatingComponent.jsx';
import apiClient from '../services/api';
import bakeryLogo from '../assets/bageri-logo.jpeg';
import bakeryHeader from '../assets/bageri.jpeg';
import '../styles/bakery-profile.css';

const BakeryProfile = () => {
  const { bakeryId } = useParams();
  const [bakery, setBakery] = useState(null);
  const [bakeryProducts, setBakeryProducts] = useState([]);
  const [bakeryReviews, setBakeryReviews] = useState([]);
  const [bakeryStats, setBakeryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchBakeryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch bakery details with caching (60 seconds default)
        const bakeryResponse = await apiClient.get(`/bakeries/${bakeryId}`, true);
        setBakery(bakeryResponse);
        
        // Fetch bakery stats with caching
        const statsResponse = await apiClient.get(`/bakeries/${bakeryId}/stats`, true);
        setBakeryStats(statsResponse);
        
        // Fetch bakery products with caching
        const productsResponse = await apiClient.get(`/bakeries/${bakeryId}/products`, true);
        setBakeryProducts(productsResponse.products || []);
        
        // Fetch bakery reviews with caching (shorter cache time as reviews change more frequently)
        const reviewsResponse = await apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true);
        setBakeryReviews(reviewsResponse.bakeryReviews || []);
        
      } catch (error) {
        console.error('Error fetching bakery data:', error);
        setError('Failed to load bakery information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (bakeryId) {
      fetchBakeryData();
    }
  }, [bakeryId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bakery information...</p>
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
        <p className="error-message">Bakery not found</p>
        <Link to="/bakery-rankings" className="btn btn-primary">Back to Bakeries</Link>
      </div>
    );
  }

  // Helper function to convert 0-10 rating to 0-5 display with improved croissant display
  const renderCroissantStars = (rating, size = 'medium') => {
    // Convert 0-10 scale to 0-5 scale
    const displayRating = rating / 2;
    const fullCroissants = Math.floor(displayRating);
    const hasHalfCroissant = displayRating % 1 >= 0.5;
    const emptyCroissants = 5 - fullCroissants - (hasHalfCroissant ? 1 : 0);
    
    // Define size classes
    const sizeClass = size === 'large' ? 'croissant-large' : 
                     size === 'small' ? 'croissant-small' : '';
    
    return (
      <div className={`croissant-display ${sizeClass}`}>
        {/* Full croissants */}
        {Array(fullCroissants).fill().map((_, i) => (
          <span key={`full-${i}`} className="croissant-filled">🍪</span>
        ))}
        
        {/* Half croissant */}
        {hasHalfCroissant && (
          <div className="croissant-half-container">
            <span className="croissant-half">🍪</span>
          </div>
        )}
        
        {/* Empty croissants */}
        {Array(emptyCroissants).fill().map((_, i) => (
          <span key={`empty-${i}`} className="croissant-empty">🍪</span>
        ))}
      </div>
    );
  };

  // Helper function to format address
  const formatAddress = () => {
    const addressParts = [];
    if (bakery.streetName) addressParts.push(bakery.streetName);
    if (bakery.streetNumber) addressParts.push(bakery.streetNumber);
    if (bakery.zipCode) addressParts.push(bakery.zipCode);
    
    return addressParts.join(' ');
  };

  // Get and sort top rated products
  const getTopRatedProducts = () => {
    // If we have products with reviews, sort them by rating
    return bakeryProducts
      .filter(product => product.rating || product.average_rating)
      .sort((a, b) => {
        const ratingA = a.rating || a.average_rating || 0;
        const ratingB = b.rating || b.average_rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 3); // Get top 3
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Rating values from bakeryStats or defaults
  const ratings = bakeryStats?.ratings || {
    overall: 0,
    service: 0,
    price: 0,
    atmosphere: 0, 
    location: 0
  };

  // Mock opening hours until backend provides them
  const openingHours = {
    monday: "7:00 - 19:00",
    tuesday: "7:00 - 19:00",
    wednesday: "7:00 - 19:00",
    thursday: "7:00 - 19:00",
    friday: "7:00 - 19:00",
    saturday: "7:00 - 19:00",
    sunday: "7:00 - 18:00"
  };

  // Get review count
  const reviewCount = bakeryStats?.review_count || bakeryReviews.length || 0;

  // Get bakery image URL or use default
  const bakeryImageUrl = bakery.imageUrl || bakeryHeader;
  
  // Get bakery logo URL or use default
  const bakeryLogoUrl = bakery.logoUrl || bakeryLogo;

  return (
    <div className="bakery-profile-container">
      {/* Bakery header image */}
      <div className="bakery-header" style={{ backgroundImage: `url(${bakeryImageUrl})` }}>
        <div className="bakery-header-overlay">
          <div className="bakery-logo-container">
            <img src={bakeryLogoUrl} alt={`${bakery.name} logo`} className="bakery-logo" />
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      <div className="bakery-content">
        <div className="bakery-info-header">
          <div className="bakery-title-section">
            <h1>{bakery.name}</h1>
            <p className="bakery-address">{formatAddress()}</p>
            
            <div className="bakery-rating-summary">
              <span className="bakery-rating-value">{((ratings.overall || 0) / 2).toFixed(1)}</span>
              {renderCroissantStars(ratings.overall || 0)}
              <span className="bakery-review-count">({reviewCount} reviews)</span>
            </div>
          </div>
          
          <div className="bakery-actions">
            <button className="btn btn-primary">Write a Review</button>
            <button className="btn btn-secondary">Share</button>
          </div>
        </div>

        {/* Navigation tabs */}
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

        {/* Tab content */}
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
                      <li><span>Monday:</span> {openingHours.monday}</li>
                      <li><span>Tuesday:</span> {openingHours.tuesday}</li>
                      <li><span>Wednesday:</span> {openingHours.wednesday}</li>
                      <li><span>Thursday:</span> {openingHours.thursday}</li>
                      <li><span>Friday:</span> {openingHours.friday}</li>
                      <li><span>Saturday:</span> {openingHours.saturday}</li>
                      <li><span>Sunday:</span> {openingHours.sunday}</li>
                    </ul>
                  </div>
                  
                  <div className="ratings-section">
                    <h3>Detailed Ratings</h3>
                    <div className="rating-details">
                      <div className="rating-item">
                        <span className="rating-label">Overall:</span>
                        <CroissantRating rating={ratings.overall || 0} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Service:</span>
                        <CroissantRating rating={ratings.service || 0} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Price:</span>
                        <CroissantRating rating={ratings.price || 0} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Atmosphere:</span>
                        <CroissantRating rating={ratings.atmosphere || 0} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Location:</span>
                        <CroissantRating rating={ratings.location || 0} max={5} disabled={true} />
                      </div>
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
                        <div className="popular-item-img-placeholder">
                          {/* Product image would go here */}
                        </div>
                        <div className="popular-item-info">
                          <h4>{product.name}</h4>
                          <div className="popular-item-rating">
                            <span>{((product.rating || product.average_rating || 0) / 2).toFixed(1)}</span>
                            {renderCroissantStars(product.rating || product.average_rating || 0, 'small')}
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
                        <div className="placeholder-image">
                          {/* Product image would go here */}
                        </div>
                      </div>
                      <div className="product-details">
                        <h3>{product.name}</h3>
                        {(product.rating || product.average_rating) && (
                          <div className="product-rating">
                            <span>{((product.rating || product.average_rating) / 2).toFixed(1)}</span>
                            {renderCroissantStars(product.rating || product.average_rating, 'small')}
                          </div>
                        )}
                        {product.category && (
                          <div className="product-category">{product.category}</div>
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
                  {renderCroissantStars(ratings.overall || 0, 'large')}
                  <span className="total-reviews">{reviewCount} reviews</span>
                </div>
                
                <button className="btn btn-primary">Write a Review</button>
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
                        {renderCroissantStars(review.overallRating || 0)}
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
    </div>
  );
};

export default BakeryProfile;
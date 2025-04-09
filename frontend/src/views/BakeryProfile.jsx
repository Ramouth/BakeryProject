import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CroissantRating from '../components/CroissantRatingComponent.jsx';
import bakeryLogo from '../assets/bageri-logo.jpeg';
import bakeryHeader from '../assets/bageri.jpeg';
import '../styles/bakery-profile.css';

const BakeryProfile = () => {
  const { bakeryId } = useParams();
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    // Mock data for the bakery profile
    const fetchBakeryData = async () => {
      setLoading(true);
      // In a real app, you would fetch from API
      // await bakeryService.getBakeryById(bakeryId)
      
      // Mock data
      const mockBakery = {
        id: 3,
        name: "Lagkagehuset",
        location: "Torvegade 45, 1400 København K",
        zipCode: "1400",
        description: "Lagkagehuset is a high-quality Danish bakery chain known for their wide selection of products, bread, and cakes. Their kanelsnegl (cinnamon rolls) are especially popular.",
        openingHours: {
          monday: "7:00 - 19:00",
          tuesday: "7:00 - 19:00",
          wednesday: "7:00 - 19:00",
          thursday: "7:00 - 19:00",
          friday: "7:00 - 19:00",
          saturday: "7:00 - 19:00",
          sunday: "7:00 - 18:00"
        },
        ratings: {
          overall: 9.4, // Values are 0-10 in backend, display as 0.5-5 croissants
          service: 9.0,
          price: 8.0,
          atmosphere: 9.2,
          location: 9.6
        },
        reviewCount: 458,
        popularProducts: [
          { id: 1, name: "Kanelsnegl", rating: 9.8 }, // Rating is 0-10 in backend
          { id: 2, name: "Tebirkes", rating: 9.4 },
          { id: 3, name: "Rugbrød", rating: 9.6 }
        ],
        reviews: [
          {
            id: 1,
            userName: "Marie J.",
            date: "October 24, 2024",
            rating: 10, // Rating is 0-10 in backend, displayed as 5 croissants
            comment: "The kanelsnegl here is absolutely amazing! Perfectly sweet and flaky. My favorite bakery in Copenhagen."
          },
          {
            id: 2,
            userName: "Jacob P.",
            date: "October 18, 2024",
            rating: 8, // Rating is 0-10 in backend, displayed as 4 croissants
            comment: "Great selection of Danish products. A bit pricey but the quality justifies it. Very good tebirkes."
          },
          {
            id: 3,
            userName: "Sarah T.",
            date: "October 5, 2024",
            rating: 10, // Rating is 0-10 in backend, displayed as 5 croissants
            comment: "Love their sourdough bread! The location is convenient and staff is always friendly."
          }
        ]
      };

      setTimeout(() => {
        setBakery(mockBakery);
        setLoading(false);
      }, 500);
    };

    fetchBakeryData();
  }, [bakeryId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bakery information...</p>
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
        <span key={`full-${i}`} className="croissant-filled">🥐</span>
      ))}
      
      {/* Half croissant */}
      {hasHalfCroissant && (
        <div className="croissant-half-container">
          <span className="croissant-half">🥐</span>
        </div>
      )}
      
      {/* Empty croissants */}
      {Array(emptyCroissants).fill().map((_, i) => (
        <span key={`empty-${i}`} className="croissant-empty">🥐</span>
      ))}
    </div>
  );
};

  return (
    <div className="bakery-profile-container">
      {/* Bakery header image */}
      <div className="bakery-header" style={{ backgroundImage: `url(${bakeryHeader})` }}>
        <div className="bakery-header-overlay">
          <div className="bakery-logo-container">
            <img src={bakeryLogo} alt={`${bakery.name} logo`} className="bakery-logo" />
          </div>
        </div>
      </div>

      {/* Bakery main content */}
      <div className="bakery-content">
        <div className="bakery-info-header">
          <div className="bakery-title-section">
            <h1>{bakery.name}</h1>
            <p className="bakery-address">{bakery.location}</p>
            
            <div className="bakery-rating-summary">
              <span className="bakery-rating-value">{(bakery.ratings.overall / 2).toFixed(1)}</span>
              {renderCroissantStars(bakery.ratings.overall)}
              <span className="bakery-review-count">({bakery.reviewCount} reviews)</span>
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
                <p className="bakery-description">{bakery.description}</p>
                
                <div className="bakery-details">
                  <div className="hours-section">
                    <h3>Opening Hours</h3>
                    <ul className="hours-list">
                      <li><span>Monday:</span> {bakery.openingHours.monday}</li>
                      <li><span>Tuesday:</span> {bakery.openingHours.tuesday}</li>
                      <li><span>Wednesday:</span> {bakery.openingHours.wednesday}</li>
                      <li><span>Thursday:</span> {bakery.openingHours.thursday}</li>
                      <li><span>Friday:</span> {bakery.openingHours.friday}</li>
                      <li><span>Saturday:</span> {bakery.openingHours.saturday}</li>
                      <li><span>Sunday:</span> {bakery.openingHours.sunday}</li>
                    </ul>
                  </div>
                  
                  <div className="ratings-section">
                    <h3>Detailed Ratings</h3>
                    <div className="rating-details">
                      <div className="rating-item">
                        <span className="rating-label">Overall:</span>
                        <CroissantRating rating={bakery.ratings.overall} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Service:</span>
                        <CroissantRating rating={bakery.ratings.service} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Price:</span>
                        <CroissantRating rating={bakery.ratings.price} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Atmosphere:</span>
                        <CroissantRating rating={bakery.ratings.atmosphere} max={5} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Location:</span>
                        <CroissantRating rating={bakery.ratings.location} max={5} disabled={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="most-popular-section">
                <h3>Most Popular Items</h3>
                <div className="popular-items">
                  {bakery.popularProducts.map(product => (
                    <div key={product.id} className="popular-item">
                      <div className="popular-item-img-placeholder">
                        {/* Replace with actual product images when available */}
                      </div>
                      <div className="popular-item-info">
                        <h4>{product.name}</h4>
                        <div className="popular-item-rating">
                          <span>{(product.rating / 2).toFixed(1)}</span>
                          {renderCroissantStars(product.rating, 'small')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="menu-section">
              <h2>Menu</h2>
              <p>Menu content will be displayed here.</p>
              {/* Menu items would go here */}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              
              <div className="reviews-summary">
                <div className="reviews-total">
                  <span className="large-rating">{(bakery.ratings.overall / 2).toFixed(1)}</span>
                  {renderCroissantStars(bakery.ratings.overall, 'large')}
                  <span className="total-reviews">{bakery.reviewCount} reviews</span>
                </div>
                
                <button className="btn btn-primary">Write a Review</button>
              </div>
              
              <div className="reviews-list">
                {bakery.reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.userName}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    
                    <div className="review-rating">
                      {renderCroissantStars(review.rating)}
                    </div>
                    
                    <p className="review-text">{review.comment}</p>
                  </div>
                ))}
                
                <button className="btn btn-secondary load-more">Load More Reviews</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BakeryProfile;
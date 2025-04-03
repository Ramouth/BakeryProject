import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RatingBar from '../components/RatingComponent';
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
        description: "Lagkagehuset is a high-quality Danish bakery chain known for their wide selection of pastries, bread, and cakes. Their kanelsnegl (cinnamon rolls) are especially popular.",
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
          overall: 4.7,
          service: 4.5,
          price: 4.0,
          atmosphere: 4.6,
          location: 4.8
        },
        reviewCount: 458,
        popularProducts: [
          { id: 1, name: "Kanelsnegl", rating: 4.9 },
          { id: 2, name: "Tebirkes", rating: 4.7 },
          { id: 3, name: "Rugbrød", rating: 4.8 }
        ],
        reviews: [
          {
            id: 1,
            userName: "Marie J.",
            date: "October 24, 2024",
            rating: 5,
            comment: "The kanelsnegl here is absolutely amazing! Perfectly sweet and flaky. My favorite bakery in Copenhagen."
          },
          {
            id: 2,
            userName: "Jacob P.",
            date: "October 18, 2024",
            rating: 4,
            comment: "Great selection of Danish pastries. A bit pricey but the quality justifies it. Very good tebirkes."
          },
          {
            id: 3,
            userName: "Sarah T.",
            date: "October 5, 2024",
            rating: 5,
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
              <span className="bakery-rating-value">{bakery.ratings.overall}</span>
              <span className="bakery-rating-stars">★★★★★</span>
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
                        <RatingBar rating={bakery.ratings.overall * 2} max={10} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Service:</span>
                        <RatingBar rating={bakery.ratings.service * 2} max={10} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Price:</span>
                        <RatingBar rating={bakery.ratings.price * 2} max={10} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Atmosphere:</span>
                        <RatingBar rating={bakery.ratings.atmosphere * 2} max={10} disabled={true} />
                      </div>
                      <div className="rating-item">
                        <span className="rating-label">Location:</span>
                        <RatingBar rating={bakery.ratings.location * 2} max={10} disabled={true} />
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
                          <span>{product.rating}</span>
                          <span className="stars">★★★★★</span>
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
                  <span className="large-rating">{bakery.ratings.overall}</span>
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
                      {Array.from({length: 5}).map((_, index) => (
                        <span key={index} className={index < review.rating ? "star filled" : "star"}>★</span>
                      ))}
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
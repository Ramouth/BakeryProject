import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReview } from '../store/ReviewContext';

const HomePage = () => {
  const { resetReview } = useReview();
  
  // Reset review state when homepage loads
  useEffect(() => {
    resetReview();
  }, [resetReview]);

  return (
    <div className="container">
      <div className="home-banner">
        <h1>Discover Copenhagen's Best Bakeries</h1>
        <p>Find the perfect pastry with CrumbCompass</p>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🥐</div>
          <h3>Rate Pastries</h3>
          <p>Share your experience with the best Danish pastries in town</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Review Bakeries</h3>
          <p>Help others find cozy and delicious bakeries around Copenhagen</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Discover</h3>
          <p>Find hidden gems and local favorites in your neighborhood</p>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>Ready to share your bakery experience?</h2>
        <p>Your reviews help the Copenhagen community discover incredible pastries and bakeries</p>
        <Link to="/bakery-selection" className="btn start-review-btn">
          Start a Review
        </Link>
      </div>
      
      <div className="top-bakeries">
        <h2>Top Bakeries in Copenhagen</h2>
        <div className="bakery-grid">
          <div className="bakery-card">
            <div className="bakery-image">
              <div className="placeholder-image">Hart Bageri</div>
            </div>
            <h3>Hart Bageri</h3>
            <p>Famous for their sourdough bread and danish pastries</p>
            <div className="bakery-rating">4.8 ★</div>
          </div>
          
          <div className="bakery-card">
            <div className="bakery-image">
              <div className="placeholder-image">Juno</div>
            </div>
            <h3>Juno The Bakery</h3>
            <p>Known for their amazing cardamom buns</p>
            <div className="bakery-rating">4.9 ★</div>
          </div>
          
          <div className="bakery-card">
            <div className="bakery-image">
              <div className="placeholder-image">Andersen</div>
            </div>
            <h3>Andersen Bakery</h3>
            <p>Traditional Danish pastries with a modern twist</p>
            <div className="bakery-rating">4.7 ★</div>
          </div>
          
          <div className="bakery-card">
            <div className="bakery-image">
              <div className="placeholder-image">Lagkagehuset</div>
            </div>
            <h3>Lagkagehuset</h3>
            <p>Popular chain with consistently delicious offerings</p>
            <div className="bakery-rating">4.5 ★</div>
          </div>
        </div>
      </div>
      
      <div className="about-section">
        <h2>About CrumbCompass</h2>
        <p>
          CrumbCompass is a student project from DTU (Technical University of Denmark) designed to help locals and visitors 
          navigate Copenhagen's vibrant bakery scene. Our platform allows users to discover, rate, and review the best pastries 
          and bakeries throughout the city.
        </p>
        <p>
          Whether you're searching for the perfect croissant, a traditional Danish pastry, or an artisanal sourdough, 
          CrumbCompass is your guide to finding the most delicious baked goods Copenhagen has to offer.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
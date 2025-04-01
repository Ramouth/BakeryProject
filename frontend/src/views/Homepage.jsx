import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReview } from '../store/ReviewContext';

const HomePage = () => {
  const { resetReview } = useReview();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Reset review state when homepage loads
  useEffect(() => {
    resetReview();
  }, [resetReview]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implementation for search functionality would go here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="container">
      {/* Hero section with search bar */}
      <div className="hero-section">
        <h1>Denmark`s first ever bakery guide</h1>
        
        <div className="search-container">
          <form onSubmit={handleSearchSubmit}>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Places to go, things to do, bakeries..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button type="submit" className="search-button">Search</button>
            </div>
          </form>
        </div>

        <div className="category-tabs">
          <Link to="/" className="category-tab active">All</Link>
          <Link to="/" className="category-tab">Bakeries</Link>
          <Link to="/" className="category-tab">Cafés</Link>
          <Link to="/" className="category-tab">Pastries</Link>
          <Link to="/" className="category-tab">Reviews</Link>
        </div>
      </div>
      
      {/* Promotional card section */}
      <div className="promo-card">
        <div className="promo-content">
          <h2>Plan your bakery visit</h2>
          <p>Get custom recommendations for all the things you're into with our product rankings.</p>
          <Link to="/bakery-selection" className="btn">View rankings</Link>
        </div>
      </div>
      
      {/* Top bakeries section */}
      <div className="top-bakeries">
        <h2>Explore Copenhagens most cozy bakeries</h2>
        <p>Top four ranked bakeries, currently:</p>
        
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
    </div>
  );
};

export default HomePage;
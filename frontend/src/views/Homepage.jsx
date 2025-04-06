import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReview } from '../store/ReviewContext';

const HomePage = () => {
  const { resetReview } = useReview();
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedPastryType, setSelectedPastryType] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  
  // Reset review state when homepage loads
  useEffect(() => {
    resetReview();
  }, [resetReview]);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implementation for search functionality would go here
    console.log("Searching for:", {
      type: searchType,
      zipCode: selectedZipCode,
      pastryType: selectedPastryType,
      rating: selectedRating
    });
  };

  return (
    <div className="container">
      {/* Hero section with search dropdown */}
      <div className="hero-section">
        <h1>Denmark's first ever bakery guide</h1>
        
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-dropdown-form">
            <div className="search-type-selector">
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="search-dropdown"
              >
                <option value="bakeries">Find Bakeries</option>
                <option value="pastries">Find Pastries</option>
                <option value="reviews">Browse Reviews</option>
                <option value="topRated">Top Rated</option>
              </select>
            </div>
            
            <div className="search-filters">
              {searchType === 'bakeries' && (
                <select 
                  value={selectedZipCode} 
                  onChange={(e) => setSelectedZipCode(e.target.value)}
                  className="search-dropdown"
                >
                  <option value="">All Copenhagen</option>
                  <option value="1050">1050 - Inner City</option>
                  <option value="1500">1500 - Vesterbro</option>
                  <option value="2000">2000 - Frederiksberg</option>
                  <option value="2100">2100 - Østerbro</option>
                  <option value="2200">2200 - Nørrebro</option>
                  <option value="2300">2300 - Amager</option>
                </select>
              )}
              
              {searchType === 'pastries' && (
                <select 
                  value={selectedPastryType} 
                  onChange={(e) => setSelectedPastryType(e.target.value)}
                  className="search-dropdown"
                >
                  <option value="">All Pastry Types</option>
                  <option value="danish">Danish Pastry</option>
                  <option value="bread">Bread</option>
                  <option value="cake">Cakes</option>
                  <option value="croissant">Croissants</option>
                  <option value="cinnamon">Cinnamon Rolls</option>
                </select>
              )}
              
              {searchType === 'reviews' || searchType === 'topRated' ? (
                <select 
                  value={selectedRating} 
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="search-dropdown"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              ) : null}
            </div>
            
            <button type="submit" className="search-button">Search</button>
          </form>
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
        
        <div className="homepage-bakery-grid">
          <div className="homepage-bakery-card">
            <div className="homepage-bakery-image">
              <div className="homepage-placeholder-image">Hart Bageri</div>
            </div>
            <h3>Hart Bageri</h3>
            <p>Famous for their sourdough bread and danish pastries</p>
            <div className="bakery-rating">4.8 ★</div>
          </div>
          
          <div className="homepage-bakery-card">
            <div className="homepage-bakery-image">
              <div className="homepage-placeholder-image">Juno</div>
            </div>
            <h3>Juno The Bakery</h3>
            <p>Known for their amazing cardamom buns</p>
            <div className="bakery-rating">4.9 ★</div>
          </div>
          
          <div className="homepage-bakery-card">
            <div className="homepage-bakery-image">
              <div className="homepage-placeholder-image">Andersen</div>
            </div>
            <h3>Andersen Bakery</h3>
            <p>Traditional Danish pastries with a modern twist</p>
            <div className="bakery-rating">4.7 ★</div>
          </div>
          
          <div className="homepage-bakery-card">
            <div className="homepage-bakery-image">
              <div className="homepage-placeholder-image">Lagkagehuset</div>
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
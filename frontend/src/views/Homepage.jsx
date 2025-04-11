import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReview } from '../store/ReviewContext';
import apiClient from '../services/api';
import { useNotification } from '../store/NotificationContext';

const HomePage = () => {
  const { resetReview } = useReview();
  const { showError } = useNotification();
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [topBakeries, setTopBakeries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Reset review state when homepage loads
  useEffect(() => {
    resetReview();
    
    // Fetch top bakeries from API
    const fetchTopBakeries = async () => {
      setLoading(true);
      try {
        // Use the dedicated top bakeries endpoint with caching enabled
        const response = await apiClient.get('/bakeries/top?limit=4', true);
        
        if (response && response.bakeries && response.bakeries.length > 0) {
          setTopBakeries(response.bakeries);
        } else {
          setTopBakeries([]);
        }
      } catch (error) {
        console.error('Error fetching top bakeries:', error);
        showError('Unable to load top bakeries');
        setTopBakeries([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopBakeries();
  }, [resetReview, showError]);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implementation for search functionality would go here
    console.log("Searching for:", {
      type: searchType,
      zipCode: selectedZipCode,
      productType: selectedProductType,
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
                <option value="products">Find Products</option>
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
              
              {searchType === 'products' && (
                <select 
                  value={selectedProductType} 
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="search-dropdown"
                >
                  <option value="">All Product Types</option>
                  <option value="danish">Danish Product</option>
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
          <Link to="/bakery-rankings" className="btn">View rankings</Link>
        </div>
      </div>
      
      {/* Top bakeries section */}
      <div className="top-bakeries">
        <h2>Explore Copenhagens most cozy bakeries</h2>
        <p>Top four ranked bakeries, currently:</p>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading top bakeries...</p>
          </div>
        ) : topBakeries.length > 0 ? (
          <div className="homepage-bakery-grid">
            {topBakeries.map(bakery => {
              // Simply use the provided average_rating directly
              const rating = bakery.average_rating || 0;
              
              // Format for display (adjusted to 5-star scale if needed)
              const displayRating = (rating > 10 ? (rating / 2) : rating).toFixed(1);
              
              // Generate a short description based on available data
              const getDescription = () => {
                if (bakery.description) return bakery.description;
                
                // If no description, create one from bakery data
                const parts = [];
                if (bakery.streetName && bakery.zipCode) {
                  parts.push(`Located at ${bakery.streetName} ${bakery.streetNumber || ''} in ${bakery.zipCode}`);
                }
                
                return parts.length > 0 ? parts.join('. ') : 'Delicious bakery in Copenhagen';
              };
              
              return (
                <Link to={`/bakery/${bakery.id}`} key={bakery.id} className="homepage-bakery-card">
                  <div className="homepage-bakery-image">
                    <div className="homepage-placeholder-image">
                      {bakery.imageUrl ? (
                        <img src={bakery.imageUrl} alt={bakery.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : bakery.name}
                    </div>
                  </div>
                  <h3>{bakery.name}</h3>
                  <p>{getDescription()}</p>
                  <div className="bakery-rating">{displayRating} ★</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="no-bakeries-message">
            <p>No bakeries available at the moment. Please check back later!</p>
            <Link to="/bakery-rankings" className="btn">View All Bakeries</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
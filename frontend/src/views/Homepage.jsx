import { useEffect, useState, useCallback } from 'react';
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
  
  // Memoized function to efficiently fetch bakery stats with batching
  const fetchBakeryStatsInBatches = useCallback(async (bakeries, batchSize = 2) => {
    const result = [...bakeries];
    
    // Process bakeries in batches to avoid too many concurrent requests
    for (let i = 0; i < result.length; i += batchSize) {
      const batch = result.slice(i, i + batchSize);
      
      // Process a batch of bakeries concurrently, but limit the batch size
      await Promise.all(
        batch.map(async (bakery, index) => {
          try {
            // Fetch bakery stats which include proper ratings
            const statsResponse = await apiClient.get(`/bakeries/${bakery.id}/stats`, true);
            
            // Update the bakery in the original array with stats data
            result[i + index] = {
              ...bakery,
              // Use the stats ratings if available
              average_rating: statsResponse.average_rating || 0,
              review_count: statsResponse.review_count || 0,
              ratings: statsResponse.ratings || {
                overall: 0,
                service: 0,
                price: 0,
                atmosphere: 0,
                location: 0
              }
            };
          } catch (error) {
            console.error(`Error fetching stats for bakery ${bakery.id}:`, error);
            // Keep the original bakery data if stats couldn't be fetched
          }
        })
      );
    }
    
    return result;
  }, []);
  
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
          // Get bakery stats in optimized batches
          const bakeriesWithStats = await fetchBakeryStatsInBatches(response.bakeries);
          setTopBakeries(bakeriesWithStats);
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
  }, [resetReview, showError, fetchBakeryStatsInBatches]);

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
              // Get the rating from various possible sources, with fallbacks
              let rating = 0;
              
              // First try to use average_rating directly
              if (typeof bakery.average_rating === 'number') {
                rating = bakery.average_rating;
              } 
              // Then try to use the overall rating from ratings object
              else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
                rating = bakery.ratings.overall;
              }
              
              // Format for display (ensure the rating is on a 5-star scale)
              // If the rating is on a 10-point scale (greater than 5), convert it to a 5-point scale
              const displayRating = (rating > 5 ? (rating / 2) : rating).toFixed(1);
              
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
                  <div style={{ 
                    position: 'relative', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden' // Prevent content from spilling out
                  }}>
                    <div className="homepage-bakery-image">
                      <div className="homepage-placeholder-image">
                        {bakery.imageUrl ? (
                          <img src={bakery.imageUrl} alt={bakery.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : bakery.name}
                      </div>
                    </div>
                    
                    {/* Limit bakery name to 2 lines and show ellipsis if longer */}
                    <h3 style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginBottom: '8px',
                      marginTop: '12px'
                    }}>
                      {bakery.name}
                    </h3>
                    
                    {/* Add margin at the bottom of the card and limit lines to prevent overlap */}
                    <p style={{ 
                      flex: '1', 
                      marginBottom: '75px', // Increased space for rating
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3, // Limit to 3 lines
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {getDescription()}
                    </p>
                    
                    {/* Position rating at bottom left with improved styling */}
                    <div className="bakery-rating" style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      left: '10px',
                      padding: '4px 8px',
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', // More opaque background
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      zIndex: 2 // Ensure it's above other content
                    }}>
                      {displayRating} 🍪
                    </div>
                  </div>
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
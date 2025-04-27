import { Link } from 'react-router-dom';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

const HomePage = () => {
  const {
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedProductType,
    setSelectedProductType,
    selectedRating,
    setSelectedRating,
    topBakeries,
    loading,
    handleSearchSubmit,
    getBakeryDescription,
    getBakeryRating
  } = useHomeViewModel();

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
            {topBakeries.map(bakery => (
              <Link to={`/bakery/${bakery.id}`} key={bakery.id} className="homepage-bakery-card">
                <div style={{ 
                  position: 'relative', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div className="homepage-bakery-image">
                    <div className="homepage-placeholder-image">
                      {bakery.imageUrl ? (
                        <img src={bakery.imageUrl} alt={bakery.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : bakery.name}
                    </div>
                  </div>
                  
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
                  
                  <p style={{ 
                    flex: '1', 
                    marginBottom: '75px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {getBakeryDescription(bakery)}
                  </p>
                  
                  <div className="bakery-rating" style={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    left: '10px',
                    padding: '4px 8px',
                    fontWeight: 'bold',
                    backgroundColor: 'var(--primary-100)',
                    filter: 'brightness(0.96)', // Makes the color slightly darker
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    zIndex: 2
                  }}>
                    {getBakeryRating(bakery)} 🍪
                  </div>
                </div>
              </Link>
            ))}
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
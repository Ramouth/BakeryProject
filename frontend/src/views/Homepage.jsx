// src/views/Homepage.jsx
import { Link } from 'react-router-dom';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { useFacetedSearchViewModel } from '../viewmodels/useFacetedSearchViewModel';
import FacetedSearch from '../components/FacetedSearch';

const HomePage = () => {
  const {
    topBakeries,
    loading: topBakeriesLoading,
    getBakeryDescription,
    getBakeryRating,
  } = useHomeViewModel();

  const {
    searchResults,
    isLoading: searchResultsLoading,
    handleSearch,
    formatBakeryNameForUrl,
    resetFilters
  } = useFacetedSearchViewModel();

  // Determine what to display: search results or top bakeries
  const displayItems = searchResults.length > 0 ? searchResults : topBakeries;
  const isLoading = searchResultsLoading || topBakeriesLoading;
  const isSearchActive = searchResults.length > 0;

  // Helper function to get proper bakery rating
  const getDisplayRating = (bakery) => {
    // Try to get rating from different possible sources
    let rating = 0;
    
    if (typeof bakery.average_rating === 'number') {
      rating = bakery.average_rating;
    } else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
      rating = bakery.ratings.overall;
    }
    
    // Always divide by 2 to convert from 10-scale to 5-scale
    return (rating / 2).toFixed(1);
  };

  return (
    <div className="container">
      {/* Hero section with search */}
      <div className="hero-section">
        <h1>Denmark's first ever bakery guide</h1>
        
        {/* Enhanced Faceted Search Component */}
        <FacetedSearch onSearch={handleSearch} />
      </div>
      
      {/* Promotional card section */}
      {!isSearchActive && (
        <div className="promo-card">
          <div className="promo-content">
            <h2>Plan your bakery visit</h2>
            <p>Get custom recommendations for all the things you're into with our product rankings.</p>
            <Link to="/bakery-rankings" className="btn">View rankings</Link>
          </div>
        </div>
      )}
      
      {/* Results section (either search results or top bakeries) */}
      <div className={`top-bakeries ${isSearchActive ? 'search-active' : ''}`}>
        <div className="search-results-header">
          <h2>
            {isSearchActive 
              ? "Search Results" 
              : "Explore Copenhagen's most cozy bakeries"}
          </h2>
          <p className="search-results-count">
            {isSearchActive 
              ? `Found ${searchResults.length} top bakeries matching your criteria` 
              : "Top rated bakeries in Copenhagen:"}
          </p>
          
          {isSearchActive && (
            <button 
              className="reset-filters-button"
              onClick={() => resetFilters()}
            >
              Reset Filters
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bakeries...</p>
          </div>
        ) : displayItems.length > 0 ? (
          <div className="homepage-bakery-grid">
            {displayItems.map(bakery => (
              <Link 
                to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(bakery.name))}`} 
                key={bakery.id} 
                className="homepage-bakery-card"
              >
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
                    {getDisplayRating(bakery)} 🍪
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-bakeries-message">
            <p>No bakeries match your search criteria. Try adjusting your filters!</p>
            <button className="btn" onClick={() => resetFilters()}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
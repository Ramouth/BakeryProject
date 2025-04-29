// src/views/Homepage.jsx
import { Link } from 'react-router-dom';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { useFacetedSearchViewModel } from '../viewmodels/useFacetedSearchViewModel';
import FacetedSearch from '../components/FacetedSearch';

const HomePage = () => {
  const {
    topBakeries,
    loading: topBakeriesLoading,
  } = useHomeViewModel();

  const {
    searchResults,
    isLoading: searchResultsLoading,
    handleSearch,
    formatBakeryNameForUrl,
    getBakeryDescription,
    getBakeryRating
  } = useFacetedSearchViewModel();

  // Determine what to display: search results or top bakeries
  const displayItems = searchResults.length > 0 ? searchResults : topBakeries;
  const isLoading = searchResultsLoading || topBakeriesLoading;
  const isSearchActive = searchResults.length > 0;

  return (
    <div className="container">
      {/* Hero section with search */}
      <div className="hero-section">
        <h1>Denmark's first ever bakery guide</h1>
        
        {/* Faceted Search Component */}
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
      <div className="top-bakeries">
        <h2>
          {isSearchActive 
            ? "Search Results" 
            : "Explore Copenhagens most cozy bakeries"}
        </h2>
        <p>
          {isSearchActive 
            ? `Found ${searchResults.length} bakeries matching your criteria` 
            : "Top four ranked bakeries, currently:"}
        </p>
        
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
                    {getBakeryRating(bakery)} 🍪
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-bakeries-message">
            <p>No bakeries match your search criteria. Try adjusting your filters!</p>
            <button className="btn" onClick={() => handleSearch([])}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
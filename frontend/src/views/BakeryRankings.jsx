import { Link } from 'react-router-dom';
import { useBakeryRankingsViewModel } from '../viewmodels/useBakeryRankingsViewModel';
import SearchDropdown from '../components/SearchDropdown';
import Button from '../components/Button';

const BakeryRankings = () => {
  const {
    bakeries,
    totalBakeries,
    loading,
    error,
    handleSearch,
    hasMore,
    loadMore
  } = useBakeryRankingsViewModel();

  const filterOptions = {
    bakeries: [
      {
        name: 'zipCode',
        options: [
          { value: '', label: 'All Postal Codes' },
          { value: '1000-1499', label: '1000-1499 - Copenhagen K (City Center)' },
          { value: '1500-1799', label: '1500-1799 - Copenhagen V (Vesterbro)' },
          { value: '1800-1999', label: '1800-1999 - Frederiksberg C' },
          { value: '2000-2099', label: '2000-2099 - Frederiksberg' },
          { value: '2100-2199', label: '2100-2199 - Copenhagen Ø (Østerbro)' },
          { value: '2200-2299', label: '2200-2299 - Copenhagen N (Nørrebro)' },
          { value: '2300-2399', label: '2300-2399 - Copenhagen S (Amager)' },
          { value: '2400-2499', label: '2400-2499 - Copenhagen NV (Nordvest)' },
          { value: '2500-2599', label: '2500-2599 - Valby' },
          { value: '2600-2699', label: '2600-2699 - Glostrup' },
          { value: '2700-2799', label: '2700-2799 - Brønshøj' },
          { value: '2800-2899', label: '2800-2899 - Lyngby' },
          { value: '2900-2999', label: '2900-2999 - Hellerup' }
        ]
      },
      {
        name: 'rating',
        options: [
          { value: '', label: 'All Ratings' },
          { value: '4.5', label: '4.5+' },
          { value: '4', label: '4+' },
          { value: '3.5', label: '3.5+' },
          { value: '3', label: '3+' }
        ]
      }
    ]
  };

  // Convert backend rating (1-10) to display rating (0.5-5)
  const getBakeryRating = (bakery) => {
    // Get the bakery's average rating from different possible sources
    let rating = 0;
    
    if (typeof bakery.average_rating === 'number') {
      rating = bakery.average_rating;
    } else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
      rating = bakery.ratings.overall;
    }
    
    // Always divide by 2 to convert from 10-scale to 5-scale
    // Backend consistently stores ratings on a 1-10 scale
    return (rating / 2).toFixed(1);
  };

  // Format bakery name for URL
  const formatBakeryNameForUrl = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="container">
      <div className="rankings-header">
        <h1>Top Bakeries in Copenhagen</h1>
        <p>Discover the best bakeries based on user reviews and ratings</p>
      </div>
      
      {/* Modified SearchDropdown to hide product search option */}
      <SearchDropdown 
        onSearch={handleSearch}
        filterOptions={filterOptions}
        hideSwitcher={true} // Add a prop to hide the search type switcher
        defaultType="bakeries" // Always set to bakeries
      />

      <div className="bakery-rankings">
        {loading && bakeries.length === 0 ? (
          <div className="loading">Loading bakeries...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : bakeries.length === 0 ? (
          <div className="no-results">No bakeries found matching your criteria.</div>
        ) : (
          <>
            <div className="bakery-count-info">
              Showing {bakeries.length} of {totalBakeries} bakeries
            </div>
            
            <div className="bakery-list">
              {bakeries.map((bakery, index) => (
                <Link 
                  to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(bakery.name))}`} 
                  className="bakery-card" 
                  key={bakery.id}
                >
                  <div className="bakery-rank">{index + 1}</div>
                  <div className="bakery-image">
                    <div className="placeholder-image">
                      {bakery.name}
                      {bakery.average_rating >= 9.4 && (
                        <div className="top-review-badge">TOP REVIEW</div>
                      )}
                    </div>
                  </div>
                  <div className="bakery-details">
                    <h3>{bakery.name}</h3>
                    <p className="bakery-location">
                      {bakery.streetName ? `${bakery.streetName} ${bakery.streetNumber || ''}` : ''} 
                      {bakery.zipCode ? `${bakery.streetName ? ', ' : ''}${bakery.zipCode} Copenhagen` : ''}
                    </p>
                    <p className="bakery-description">
                    {bakery.description || `A wonderful bakery in Copenhagen located at ${bakery.streetName || 'an unknown street'} with delicious products.`}
                    </p>
                    <div className="bakery-meta">
                      <div className="bakery-rating">
                        <span className="rating-value">{getBakeryRating(bakery)}</span>
                        <span className="cookie">🍪</span>
                        <span className="review-count">({bakery.review_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {hasMore && (
              <div className="load-more-container">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  variant="secondary"
                  className="load-more-button"
                >
                  {loading ? 'Loading...' : 'Load More Bakeries'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BakeryRankings;
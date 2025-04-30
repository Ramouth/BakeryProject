import { Link } from 'react-router-dom';
import { useBakeryRankingsViewModel } from '../viewmodels/useBakeryRankingsViewModel';
import SearchDropdown from '../components/SearchDropdown';
import '../styles/bakery-rankings.css';

const BakeryRankings = () => {
  const {
    bakeries,
    loading,
    error,
    handleSearch
  } = useBakeryRankingsViewModel();

  const searchTypes = [
    { value: 'bakeries', label: 'Find Bakeries' },
    { value: 'products', label: 'Find Products' }
  ];

  const filterOptions = {
    bakeries: [
      {
        name: 'zipCode',
        options: [
          { value: '', label: 'All Postal Codes' },
          { value: '1050', label: '1050 - Inner City' },
          { value: '1400', label: '1400 - København K' },
          { value: '1437', label: '1437 - København K' },
          { value: '1453', label: '1453 - København K' },
          { value: '1500', label: '1500 - Vesterbro' },
          { value: '1572', label: '1572 - København V' },
          { value: '1850', label: '1850 - Frederiksberg' },
          { value: '1871', label: '1871 - Frederiksberg' },
          { value: '2000', label: '2000 - Frederiksberg' },
          { value: '2100', label: '2100 - Østerbro' },
          { value: '2200', label: '2200 - Nørrebro' },
          { value: '2300', label: '2300 - Amager' }
        ]
      },
      {
        name: 'rating',
        options: [
          { value: '', label: 'All Ratings' },
          { value: '4.5', label: '4.5+ Stars' },
          { value: '4', label: '4+ Stars' },
          { value: '3.5', label: '3.5+ Stars' },
          { value: '3', label: '3+ Stars' }
        ]
      }
    ],
    products: []
  };

  // Convert backend rating (1-10) to display rating (0.5-5)
  const getBakeryRating = (bakery) => {
    // Get the bakery's average rating or default to 0
    const rating = bakery.average_rating || 0;
    
    // Divide by 2 to convert from 10-scale to 5-scale
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
      
      <SearchDropdown 
        onSearch={handleSearch}
        searchTypes={searchTypes}
        filterOptions={filterOptions}
      />

      <div className="bakery-rankings">
        {loading ? (
          <div className="loading">Loading bakeries...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : bakeries.length === 0 ? (
          <div className="no-results">No bakeries found matching your criteria.</div>
        ) : (
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
                  <p className="bakery-location">{bakery.address}</p>
                  <p className="bakery-description">
                    {bakery.description || "A wonderful bakery in Copenhagen offering delicious products."}
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
        )}
      </div>
    </div>
  );
};

export default BakeryRankings;
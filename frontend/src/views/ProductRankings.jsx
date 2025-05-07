import { Link, useNavigate } from 'react-router-dom';
import { useProductRankingsViewModel } from '../viewmodels/useProductRankingsViewModel';

const ProductRankings = () => {
  const navigate = useNavigate();
  const {
    category,
    subcategory,
    subcategories,
    selectedSubcategoryId,
    productRankings,
    loading,
    error,
    handleSubcategorySelect,
    categoryId
  } = useProductRankingsViewModel();

  const renderCookieRating = (rating) => {
    const displayRating = parseFloat(rating);
    const fullCookies = Math.floor(displayRating);
    const hasHalfCookie = displayRating % 1 >= 0.5;
    const emptyCookies = 5 - fullCookies - (hasHalfCookie ? 1 : 0);
    
    return (
      <div className="cookie-display cookie-small">
        {Array(fullCookies).fill().map((_, i) => (
          <span key={`full-${i}`} className="cookie-filled">🍪</span>
        ))}
        {hasHalfCookie && (
          <div className="cookie-half-container">
            <span className="cookie-half">🍪</span>
          </div>
        )}
        {Array(emptyCookies).fill().map((_, i) => (
          <span key={`empty-${i}`} className="cookie-empty">🍪</span>
        ))}
      </div>
    );
  };

  // Get category name for display
  const getCategoryName = () => {
    if (category) {
      return category.name;
    }
    
    if (categoryId) {
      // Simple mapping for known category IDs if the category object isn't loaded yet
      const categoryNames = {
        'danish': 'Danish Products',
        'bread': 'Breads',
        'viennoiserie': 'Viennoiserie',
        'cakes': 'Cakes & Tarts',
        'specialty': 'Specialty Items'
      };
      
      return categoryNames[categoryId] || categoryId;
    }
    
    return 'All Categories';
  };

  // Format bakery name for URL
  const formatNameForUrl = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Show error message
  if (error) {
    return (
      <div className="product-container">
        <div className="product-error-container">
          <p className="product-error-message">{error}</p>
          <Link to="/product-categories" className="product-btn product-btn-primary">View Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-container">
      <div className="product-rankings-header">
        <h1>Product Rankings: {getCategoryName()}</h1>
        <p>Compare the best places to get popular Danish products</p>
        
        {categoryId && (
          <div className="product-category-nav">
            <Link to="/product-categories" className="product-back-link">
              ← Back to Categories
            </Link>
          </div>
        )}
      </div>
      
      {/* Subcategory Navigation */}
      <div className="product-navigation">
        {loading && subcategories.length === 0 ? (
          <div className="product-loading-indicator">Loading products...</div>
        ) : subcategories.length === 0 ? (
          <div className="product-no-products-message">
            <p>No products found in this category.</p>
          </div>
        ) : (
          subcategories.map(item => (
            <button
              key={item.id}
              className={`product-nav-item ${
                selectedSubcategoryId === item.id || 
                selectedSubcategoryId === String(item.id) || 
                (selectedSubcategoryId && String(selectedSubcategoryId) === String(item.id)) 
                  ? 'product-active' 
                  : ''
              }`}
              onClick={() => handleSubcategorySelect(item.id)}
            >
              {item.name}
            </button>
          ))
        )}
      </div>

      {/* Product Rankings List */}
      {selectedSubcategoryId && (
        <div className="product-ranking-section">
          <div className="product-ranking-title">
            <h2>{subcategory ? subcategory.name : 'Loading...'}</h2>
          </div>
          
          {loading ? (
            <div className="product-loading-indicator">Loading rankings...</div>
          ) : productRankings.length > 0 ? (
            <div className="product-rankings-grid">
              {productRankings.map((item) => (
                <Link 
                  to={`/product/${item.productId}`} 
                  className="product-ranking-card" 
                  key={item.productId}
                >
                  <div className="product-ranking-content">
                    <div className="product-rank-badge">{item.rank}</div>
                    <div className="product-info">
                      <h3 className="product-name">{item.productName}</h3>
                      <div className="product-bakery-info">
                        {/* Fix: Change Link to span with onClick handler */}
                        <span 
                          className="product-bakery-name"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            navigate(`/bakery/${encodeURIComponent(formatNameForUrl(item.bakeryName))}`);
                          }}
                        >
                          {item.bakeryName}
                        </span>
                        <span className="product-postal">{item.address}</span>
                      </div>
                    </div>
                    
                    <div className="product-review-section">
                      <div className="product-review-heading">Top Review</div>
                      <p className="product-review-text">{item.topReview}</p>
                    </div>
                    
                    <div className="product-rating-container">
                      <div className="product-rating-value">{item.rating}</div>
                      {renderCookieRating(item.rating)}
                      <div className="product-review-count">
                        ({item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'})
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="product-no-rankings-message">
              <p>No rankings available for this product yet. Be the first to review it!</p>
              <button className="product-btn product-btn-primary">Write a Review</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRankings;
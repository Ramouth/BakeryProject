import { Link } from 'react-router-dom';
import { useProductRankingsViewModel } from '../viewmodels/useProductRankingsViewModel';
import '../styles/product-rankings.css';

const ProductRankings = () => {
  const {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    error,
    handleProductSelect,
    getSelectedProductName,
    getCategoryName,
    categoryId
  } = useProductRankingsViewModel();

  // Format bakery name for URL
  const formatBakeryNameForUrl = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Helper function to render cookie stars (same approach as in bakery rankings)
  const renderRatingStars = (rating) => {
    // Convert to a number in case it's a string
    const numRating = parseFloat(rating);
    
    return (
      <span className="rating-with-star">
        <span className="rating-value">{numRating}</span>
        <span className="cookie">🍪</span>
      </span>
    );
  };

  // Show error message
  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Link to="/product-categories" className="btn btn-primary">View Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-rankings-header">
        <h1>Product Rankings: {getCategoryName()}</h1>
        <p>Compare the best places to get popular Danish products</p>
        
        {categoryId && (
          <div className="category-nav">
            <Link to="/product-categories" className="back-link">
              ← Back to Categories
            </Link>
          </div>
        )}
      </div>
      
      {/* Product Navigation */}
      <div className="product-navigation">
        {loading && productTypes.length === 0 ? (
          <div className="loading-indicator">Loading products...</div>
        ) : productTypes.length === 0 ? (
          <div className="no-products-message">
            <p>No products found in this category.</p>
          </div>
        ) : (
          productTypes.map(product => (
            <button
              key={product.id}
              className={`product-nav-item ${selectedProduct === product.id ? 'active' : ''}`}
              onClick={() => handleProductSelect(product.id)}
            >
              {product.name}
            </button>
          ))
        )}
      </div>

      {/* Product Rankings List */}
      {selectedProduct && (
        <div className="ranking-section">
          <div className="ranking-title">
            <h2>{getSelectedProductName()}</h2>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Loading rankings...</div>
          ) : productRankings.length > 0 ? (
            <div className="rankings-table">
              <div className="table-header">
                <div className="col-rank">Rank</div>
                <div className="col-bakery">Bakery</div>
                <div className="col-review">Top Review</div>
                <div className="col-rating">Rating</div>
              </div>
              
              {productRankings.map((item) => (
                <div className={`table-row ${item.rank <= 3 ? `top-${item.rank}` : ''}`} key={item.rank}>
                  <div className="col-rank">
                    <span className="rank-number">{item.rank}</span>
                  </div>
                  <div className="col-bakery">
                    <Link to={`/bakery/${encodeURIComponent(formatBakeryNameForUrl(item.bakeryName))}`}>
                      <h3>{item.bakeryName}</h3>
                      <span className="bakery-address">{item.address}</span>
                    </Link>
                  </div>
                  <div className="col-review">
                    <p>{item.topReview}</p>
                  </div>
                  <div className="col-rating">
                    <div className="rating-display">
                      {renderRatingStars(item.rating)}
                      <span className="review-count">based on {item.reviewCount} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-rankings-message">
              <p>No rankings available for this product yet. Be the first to review it!</p>
              <button className="btn btn-primary">Write a Review</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRankings;
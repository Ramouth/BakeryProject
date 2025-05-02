// frontend/src/views/ProductRankings.jsx

import { Link } from 'react-router-dom';
import { useProductRankingsViewModel } from '../viewmodels/useProductRankingsViewModel';
import '../styles/product-rankings.css';

const ProductRankings = () => {
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

  // Format bakery name for URL
  const formatBakeryNameForUrl = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
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
      
      {/* Subcategory Navigation */}
      <div className="product-navigation">
        {loading && subcategories.length === 0 ? (
          <div className="loading-indicator">Loading products...</div>
        ) : subcategories.length === 0 ? (
          <div className="no-products-message">
            <p>No products found in this category.</p>
          </div>
        ) : (
          subcategories.map(item => (
            <button
              key={item.id}
              className={`product-nav-item ${selectedSubcategoryId === item.id ? 'active' : ''}`}
              onClick={() => handleSubcategorySelect(item.id)}
            >
              {item.name}
            </button>
          ))
        )}
      </div>

      {/* Product Rankings List */}
      {selectedSubcategoryId && (
        <div className="ranking-section">
          <div className="ranking-title">
            <h2>{subcategory ? subcategory.name : 'Loading...'}</h2>
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
                      <div className="rating-with-star">
                        <span className="rating-value">{item.rating}</span>
                        <span className="star">★</span>
                      </div>
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
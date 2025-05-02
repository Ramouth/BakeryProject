import React, { useState, useEffect } from 'react';
import '../styles/bakery-menu-tab.css';


const BakeryMenuTab = ({ bakeryProducts = [], bakeryName = "" }) => {
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Group products by category
  useEffect(() => {
    const groupedProducts = {};
    
    bakeryProducts.forEach(product => {
      const category = product.category?.name || 
                      (typeof product.category === 'string' ? product.category : 'Other');
      
      if (!groupedProducts[category]) {
        groupedProducts[category] = [];
      }
      
      groupedProducts[category].push(product);
    });
    
    setCategories(groupedProducts);
    
    // Set first category as active
    const categoryNames = Object.keys(groupedProducts);
    if (categoryNames.length > 0 && !activeCategory) {
      setActiveCategory(categoryNames[0]);
    }
  }, [bakeryProducts, activeCategory]);
  
  // Render cookie stars for ratings
  const renderCookieStars = (rating, size = 'small') => {
    if (!rating) return null;
    
    const displayRating = rating / 2;
    const fullCookies = Math.floor(displayRating);
    const hasHalfCookie = displayRating % 1 >= 0.5;
    const emptyCookies = 5 - fullCookies - (hasHalfCookie ? 1 : 0);
    
    const sizeClass = size === 'large' ? 'cookie-large' : 
                     size === 'small' ? 'cookie-small' : '';
    
    return (
      <div className={`cookie-display ${sizeClass}`}>
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
  
  // Get product rating
  const getProductRating = (product) => {
    let rating = 0;
    
    if (typeof product.rating === 'number') {
      rating = product.rating;
    } else if (typeof product.average_rating === 'number') {
      rating = product.average_rating;
    }
    
    return rating;
  };
  
  // Handle product click
  const handleProductClick = (productId) => {
    window.location.href = `/product/${productId}`;
  };
  
  return (
    <div className="menu-container">
      <h2 className="menu-title">Menu</h2>
      
      {Object.keys(categories).length === 0 ? (
        <p className="no-products-message">No menu items available for this bakery yet.</p>
      ) : (
        <div className="menu-layout">
          {/* Category Tabs */}
          <div className="category-sidebar">
            <div className="category-list">
              {Object.keys(categories).map(category => (
                <button
                  key={category}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category} ({categories[category].length})
                </button>
              ))}
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="products-container">
            {activeCategory && (
              <div>
                <h3 className="category-heading">{activeCategory}</h3>
                
                <div className="products-grid">
                  {categories[activeCategory].map(product => (
                    <div 
                      key={product.id}
                      className="product-card"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="product-image">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            <span>{bakeryName}</span>
                          </div>
                        )}
                        
                        {product.subcategory && (
                          <div className="product-badge">
                            {typeof product.subcategory === 'object' ? product.subcategory.name : product.subcategory}
                          </div>
                        )}
                      </div>
                      
                      <div className="product-details">
                        <h4 className="product-name">{product.name}</h4>
                        
                        {(getProductRating(product) > 0) && (
                          <div className="product-rating">
                            <span className="rating-value">
                              {(getProductRating(product) / 2).toFixed(1)}
                            </span>
                            {renderCookieStars(getProductRating(product))}
                          </div>
                        )}
                        
                        {product.description && (
                          <p className="product-description">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="product-footer">
                          <span className="product-price">
                            {product.price ? `${product.price} kr` : ''}
                          </span>
                          <span className="view-details-button">
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BakeryMenuTab;
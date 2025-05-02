// frontend/src/views/ProductCategorySelection.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductCategoryViewModel } from '../viewmodels/useProductCategoryViewModel';

const ProductCategorySelection = () => {
  const {
    categories,
    activeCategory,
    loading,
    error,
    handleMouseEnter,
    handleMouseLeave,
    navigateToSubcategory,
    getCategorySubcategories
  } = useProductCategoryViewModel();
  
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleCategoryClick = (categoryId, e) => {
    if (isMobile) {
      e.preventDefault();
      handleMouseEnter(categoryId === activeCategory ? null : categoryId);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId, e) => {
    e.preventDefault();
    navigateToSubcategory(categoryId, subcategoryId);
  };

  return (
    <div className="container">
      <div className="category-selection-header">
        <h1>Product Categories</h1>
        <p>Browse our product categories and discover the best-rated Danish products</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onMouseEnter={!isMobile ? () => handleMouseEnter(category.id) : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
              onClick={(e) => handleCategoryClick(category.id, e)}
            >
              <div className="category-content">
                <h2>{category.name}</h2>
                <p>{category.description}</p>
              </div>

              {/* Subcategory overlay */}
              <div className="subcategory-overlay" style={{ display: activeCategory === category.id ? undefined : 'none' }}>
                <h3>Select a type</h3>
                <ul className="subcategory-list">
                  {getCategorySubcategories(category.id).map((subcategory) => (
                    <li key={subcategory.id}>
                      <a 
                        href="#" 
                        className="subcategory-link"
                        onClick={(e) => handleSubcategoryClick(category.id, subcategory.id, e)}
                      >
                        {subcategory.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCategorySelection;
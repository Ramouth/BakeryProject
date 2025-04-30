import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCategories from '../models/ProductCategories';

const ProductCategorySelection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Load categories directly from ProductCategories class
  useEffect(() => {
    try {
      const allCategories = ProductCategories.getAllCategories() || [];
      console.log("Categories loaded:", allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const handleCategoryClick = (categoryId, e) => {
    if (isMobile) {
      e.preventDefault();
      setActiveCategory(activeCategory === categoryId ? null : categoryId);
    }
  };

  const navigateToSubcategory = (categoryId, subcategoryId, e) => {
    e.preventDefault();
    navigate(`/product-rankings/${categoryId}/${subcategoryId}`);
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
      ) : (
        <div className="category-grid">
          {Array.isArray(categories) && categories.map((category) => (
            <div 
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onMouseEnter={!isMobile ? () => handleMouseEnter(category.id) : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
              onClick={(e) => handleCategoryClick(category.id, e)}
            >
              <div 
                className="category-content" 
                style={{ 
                  backgroundImage: "url('/src/assets/bread.jpeg')", 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              >
                <h2>{category.name}</h2>
              </div>

              {/* Subcategory overlay (first level) */}
              <div className="subcategory-overlay" style={{ display: activeCategory === category.id ? undefined : 'none' }}>
                <h3>Select a type</h3>
                <ul className="subcategory-list">
                  {Array.isArray(category.subcategories) && category.subcategories.map((subcategory) => (
                    <li key={subcategory.id}>
                      <a 
                        href="#" 
                        className="subcategory-link"
                        onClick={(e) => navigateToSubcategory(category.id, subcategory.id, e)}
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
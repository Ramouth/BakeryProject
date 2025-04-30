// frontend/src/views/ProductCategorySelection.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProductCategories from '../hooks/useProductCategories';

const ProductCategorySelection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use our custom hook to access categories
  const { categories } = useProductCategories();

  useEffect(() => {
    if (categories.length > 0) {
      setLoading(false);
    }
  }, [categories]);

  const handleCategoryMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
  };

  const handleSubcategoryMouseEnter = (subcategoryId) => {
    setActiveSubcategory(subcategoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
  };

  const navigateToSubcategory = (categoryId, subcategoryId) => {
    navigate(`/product-rankings/${categoryId}/${subcategoryId}`);
  };

  const navigateToProduct = (categoryId, subcategoryId, productId) => {
    navigate(`/product/${productId}`);
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
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onMouseEnter={() => handleCategoryMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="category-content" style={{ backgroundImage: "url('/src/assets/bread.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <h2>{category.name}</h2>
                {category.description && <p className="category-description">{category.description}</p>}
              </div>

              {/* First-level overlay that shows subcategories */}
              {activeCategory === category.id && !activeSubcategory && (
                <div className="subcategory-overlay">
                  <h3>Select a type</h3>
                  <ul className="subcategory-list">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.id}>
                        <a 
                          href="#" 
                          className="subcategory-link"
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToSubcategory(category.id, subcategory.id);
                          }}
                          onMouseEnter={() => handleSubcategoryMouseEnter(subcategory.id)}
                        >
                          {subcategory.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Second-level overlay that shows products when a subcategory is hovered */}
              {activeCategory === category.id && activeSubcategory && (
                <div className="product-overlay">
                  <h3>
                    {category.subcategories.find(s => s.id === activeSubcategory)?.name}
                  </h3>
                  <ul className="product-list">
                    {category.subcategories
                      .find(s => s.id === activeSubcategory)
                      ?.products.map((product) => (
                        <li key={product.id}>
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              navigateToProduct(category.id, activeSubcategory, product.id);
                            }}
                          >
                            {product.name}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCategorySelection;
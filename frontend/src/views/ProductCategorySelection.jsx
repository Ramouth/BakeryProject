import { useProductCategoryViewModel } from '../viewmodels/useProductCategoryViewModel';

const ProductCategorySelection = () => {
  const {
    categories,
    activeCategory,
    loading,
    handleMouseEnter,
    handleMouseLeave,
    navigateToProduct
  } = useProductCategoryViewModel();

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
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="category-content" style={{ backgroundImage: "url('/src/assets/bread.jpeg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <h2>{category.name}</h2>
              </div>

              {/* Product overlay that appears on hover */}
              <div className="product-overlay">
                <ul className="product-list">
                  {category.products.map((product) => (
                    <li key={product.id}>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToProduct(category.id, product.id);
                        }}
                      >
                        {product.name}
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
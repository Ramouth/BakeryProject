import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCategorySelection = () => {
  const navigate = useNavigate();
  // State for tracking which category is being hovered
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mock data for categories and their products
  const [categories] = useState([
    {
      id: 'danish',
      name: 'Danish Products',
      products: [
        { id: 'kanelsnegl', name: 'Kanelsnegle' },
        { id: 'spandauer', name: 'Spandauer' },
        { id: 'tebirkes', name: 'Tebirkes' },
        { id: 'romsnegl', name: 'Romsnegl' }
      ]
    },
    {
      id: 'bread',
      name: 'Breads',
      products: [
        { id: 'rugbrod', name: 'Rugbrød' },
        { id: 'sourdough', name: 'Sourdough' },
        { id: 'franskbrod', name: 'Franskbrød' },
        { id: 'flutes', name: 'Flutes' }
      ]
    },
    {
      id: 'croissants',
      name: 'Croissants',
      products: [
        { id: 'classic-croissant', name: 'Classic Croissant' },
        { id: 'chocolate-croissant', name: 'Chocolate Croissant' },
        { id: 'almond-croissant', name: 'Almond Croissant' },
        { id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant' }
      ]
    },
    {
      id: 'cakes',
      name: 'Cakes & Tarts',
      products: [
        { id: 'hindbaersnitter', name: 'Hindbærsnitter' },
        { id: 'drommekage', name: 'Drømmekage' },
        { id: 'napoleon-hat', name: 'Napoleon\'s Hat' },
        { id: 'othellolagkage', name: 'Othellolagkage' }
      ]
    },
    {
      id: 'specialty',
      name: 'Specialty Items',
      products: [
        { id: 'cardamom-bun', name: 'Cardamom Bun' },
        { id: 'chokoladebolle', name: 'Chokoladebolle' },
        { id: 'wienerbrod', name: 'Wienerbrød' },
        { id: 'brunsviger', name: 'Brunsviger' }
      ]
    }
  ]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle mouse enter on category
  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  // Navigate to product ranking page
  const navigateToProduct = (categoryId, productId) => {
    if (productId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${categoryId}`);
    }
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
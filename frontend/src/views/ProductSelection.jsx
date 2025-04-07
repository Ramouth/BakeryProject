import { useState, useEffect } from 'react';
import { useReview } from '../store/ReviewContext';
import bakeryService from '../services/bakeryService'; // Import the bakery service

const ProductSelection = () => {
  const { selectedBakery, selectedProduct, setSelectedProduct, goToNextStep } = useReview();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customProductName, setCustomProductName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Fetch products from API based on selected bakery
  useEffect(() => {
    const fetchProducts = async () => {
      if (selectedBakery) {
        try {
          // Fetch products using the bakeryService.getBakeryProducts method
          const productsData = await bakeryService.getBakeryProducts(selectedBakery.id);
          setProducts(productsData);
          setLoading(false);
        } catch (err) {
          setError('Failed to load products. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [selectedBakery]); // Re-fetch products when the selected bakery changes

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowCustom(false);
  };

  // Handle "Other" option
  const handleOtherSelect = () => {
    setShowCustom(true);
    setSelectedProduct(null);
  };

  // Handle custom product submission
  const handleCustomProductSubmit = () => {
    if (customProductName.trim().length > 0) {
      setSelectedProduct({
        id: 'custom',
        name: 'Other',
        customName: customProductName,
        bakeryId: selectedBakery.id,
      });
    }
  };

  // Handle next step
  const handleNext = () => {
    if (selectedProduct) {
      goToNextStep('productRating');
    }
  };

  if (loading) {
    return <div className="container"><div className="card">Loading products...</div></div>;
  }

  if (error) {
    return <div className="container"><div className="card error-message">{error}</div></div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Choose a product</h2>
        <p>Selected bakery: {selectedBakery.name}</p>

        <div className="dropdown-list">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`dropdown-item ${selectedProduct && selectedProduct.id === product.id ? 'selected' : ''}`}
              onClick={() => handleProductSelect(product)}
            >
              {product.name}
            </div>
          ))}
          <div 
            className={`dropdown-item ${showCustom ? 'selected' : ''}`}
            onClick={handleOtherSelect}
          >
            Other
          </div>
        </div>

        {showCustom && (
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter product name"
              value={customProductName}
              onChange={(e) => setCustomProductName(e.target.value)}
            />
            <button 
              className="btn"
              onClick={handleCustomProductSubmit}
              disabled={customProductName.trim().length === 0}
            >
              add
            </button>
          </div>
        )}

        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('bakerySelection')}
          >
            back
          </button>
          <button 
            className="btn"
            onClick={() => {}}
            style={{ visibility: 'hidden' }}
          >
            skip
          </button>
          <button 
            className="btn"
            onClick={handleNext}
            disabled={!selectedProduct}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;

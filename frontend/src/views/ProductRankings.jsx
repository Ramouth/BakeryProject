import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import '../styles/product-rankings.css';

const useProductRankingsViewModel = () => {
  const { categoryId, productId } = useParams();
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [bakeries, setBakeries] = useState({});

  // Predefined categories
  const productCategories = {
    'danish': { name: 'Danish Products', filter: 'danish' },
    'bread': { name: 'Breads', filter: 'bread' },
    'viennoiserie': { name: 'Viennoiserie', filter: 'viennoiserie' },
    'cakes': { name: 'Cakes & Tarts', filter: 'cakes' },
    'specialty': { name: 'Specialty Items', filter: 'specialty' }
  };

  // Default product categories if none is selected
  const defaultCategories = [
    { id: 'danish', name: 'Danish Products' },
    { id: 'bread', name: 'Breads' },
    { id: 'viennoiserie', name: 'Viennoiserie' },
    { id: 'cakes', name: 'Cakes & Tarts' },
    { id: 'specialty', name: 'Specialty Items' }
  ];

  // Fetch all products with caching
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products', true); // Use caching (60 seconds)
      const products = response.products || [];
      setAllProducts(products);
      
      // Organize products by category
      organizeProductsByCategory(products, categoryId);
      
      // Fetch all bakeries for product rankings with caching
      await fetchBakeries();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch bakeries with caching
  const fetchBakeries = async () => {
    try {
      const response = await apiClient.get('/bakeries', true); // Use caching
      const bakeryMap = {};
      
      (response.bakeries || []).forEach(bakery => {
        bakeryMap[bakery.id] = bakery;
      });
      
      setBakeries(bakeryMap);
    } catch (error) {
      console.error('Error fetching bakeries:', error);
    }
  };

  // Get reviews for a product with caching
  const fetchProductReviews = async (productId) => {
    try {
      const response = await apiClient.get(`/productreviews/product/${productId}`, true); // Use caching
      return response.productReviews || [];
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  };

  // Organize products by category
  const organizeProductsByCategory = (products, category) => {
    // If category provided, filter products by that category
    if (category && productCategories[category]) {
      const categoryFilter = productCategories[category].filter;
      const categoryProducts = products.filter(
        product => product.category && product.category.toLowerCase().includes(categoryFilter)
      );
      
      // Group by name to create product types
      const productTypeMap = {};
      categoryProducts.forEach(product => {
        const normalizedName = normalizeProductName(product.name);
        if (!productTypeMap[normalizedName]) {
          productTypeMap[normalizedName] = {
            id: normalizedName,
            name: product.name,
            products: []
          };
        }
        productTypeMap[normalizedName].products.push(product);
      });
      
      setProductTypes(Object.values(productTypeMap));
      
      // If productId is provided, find and select that product
      if (productId) {
        setSelectedProduct(productId);
        generateProductRankings(productId, Object.values(productTypeMap));
      } 
      // Otherwise select the first product type
      else if (Object.values(productTypeMap).length > 0) {
        const firstProductType = Object.values(productTypeMap)[0];
        setSelectedProduct(firstProductType.id);
        generateProductRankings(firstProductType.id, Object.values(productTypeMap));
      }
    } 
    // If no category, create default product types from sample products
    else {
      // Find one product from each major category to feature
      const featuredProducts = [];
      
      // Try to find one product for each default category
      defaultCategories.forEach(category => {
        const matchingProduct = products.find(
          product => product.category && product.category.toLowerCase().includes(category.id)
        );
        
        if (matchingProduct) {
          featuredProducts.push({
            id: normalizeProductName(matchingProduct.name),
            name: matchingProduct.name,
            products: [matchingProduct]
          });
        }
      });
      
      // If we have less than 5 featured products, add more popular products
      if (featuredProducts.length < 5) {
        const popularProducts = products
          .filter(product => {
            // Check if this product's name is already in featuredProducts
            return !featuredProducts.some(fp => 
              normalizeProductName(fp.name) === normalizeProductName(product.name)
            );
          })
          .slice(0, 5 - featuredProducts.length);
          
        popularProducts.forEach(product => {
          featuredProducts.push({
            id: normalizeProductName(product.name),
            name: product.name,
            products: [product]
          });
        });
      }
      
      setProductTypes(featuredProducts);
      
      // Select the first product if available
      if (featuredProducts.length > 0) {
        const firstProductType = featuredProducts[0];
        setSelectedProduct(firstProductType.id);
        generateProductRankings(firstProductType.id, featuredProducts);
      }
    }
  };

  // Normalize product name for use as ID
  const normalizeProductName = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  // Generate rankings for a selected product type
  const generateProductRankings = async (productTypeId, productTypes) => {
    setLoading(true);
    
    // Find the product type object
    const productType = productTypes.find(pt => pt.id === productTypeId);
    
    if (!productType) {
      setProductRankings([]);
      setLoading(false);
      return;
    }
    
    // Get all products with this name/type
    const products = productType.products;
    
    // For each product, fetch reviews
    const productsWithReviews = await Promise.all(
      products.map(async product => {
        const reviews = await fetchProductReviews(product.id);
        
        // Calculate average rating
        let avgRating = 0;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, review) => acc + review.overallRating, 0);
          avgRating = sum / reviews.length;
        }
        
        // Find best review
        let topReview = null;
        if (reviews.length > 0) {
          topReview = reviews.reduce((best, current) => {
            return (current.overallRating > best.overallRating) ? current : best;
          }, reviews[0]);
        }
        
        return {
          ...product,
          avgRating: avgRating / 2, // Convert to 5-star scale
          reviewCount: reviews.length,
          topReview: topReview
        };
      })
    );
    
    // Sort by average rating
    const sortedProducts = productsWithReviews
      .filter(product => product.reviewCount > 0) // Only include products with reviews
      .sort((a, b) => b.avgRating - a.avgRating);
    
    // Format rankings
    const rankings = sortedProducts.map((product, index) => {
      const bakery = bakeries[product.bakeryId] || {};
      
      return {
        rank: index + 1,
        productId: product.id,
        bakeryId: product.bakeryId,
        bakeryName: bakery.name || 'Unknown Bakery',
        address: formatBakeryAddress(bakery),
        topReview: product.topReview ? product.topReview.review : 'No reviews yet',
        rating: product.avgRating.toFixed(1),
        reviewCount: product.reviewCount,
        image: product.imageUrl
      };
    });
    
    setProductRankings(rankings);
    setLoading(false);
  };

  // Format bakery address
  const formatBakeryAddress = (bakery) => {
    if (!bakery) return '';
    
    const addressParts = [];
    if (bakery.streetName) addressParts.push(bakery.streetName);
    if (bakery.streetNumber) addressParts.push(bakery.streetNumber);
    
    let line1 = addressParts.join(' ');
    
    const line2Parts = [];
    if (bakery.zipCode) line2Parts.push(bakery.zipCode);
    
    let line2 = line2Parts.join(' ');
    
    if (line1 && line2) {
      return `${line1}\n${line2}`;
    } else if (line1) {
      return line1;
    } else if (line2) {
      return line2;
    } else {
      return 'Address not available';
    }
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    generateProductRankings(productId, productTypes);
    
    // Update URL to reflect the current selection
    if (categoryId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${productId}`);
    }
  };

  // Initial data fetch with caching
  useEffect(() => {
    fetchAllProducts();
  }, [categoryId]);

  return {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    error,
    handleProductSelect,
    categoryId
  };
};

// View component
const ProductRankings = () => {
  const {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    error,
    handleProductSelect,
    categoryId
  } = useProductRankingsViewModel();

  // Get the name of the currently selected product
  const getSelectedProductName = () => {
    if (!selectedProduct || !productTypes.length) return '';
    const found = productTypes.find(p => p.id === selectedProduct);
    return found ? found.name : '';
  };

  // Get category name from ID
  const getCategoryName = () => {
    if (!categoryId) return 'All Categories';
    
    const categoryNames = {
      'danish': 'Danish Products',
      'bread': 'Breads',
      'viennoiserie': 'Viennoiserie',
      'cakes': 'Cakes & Tarts',
      'specialty': 'Specialty Items'
    };
    
    return categoryNames[categoryId] || 'Products';
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
                    <Link to={`/bakery/${item.bakeryId}`}>
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
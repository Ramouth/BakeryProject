import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/product-rankings.css';

const useProductRankingsViewModel = () => {
  const { categoryId, productId } = useParams();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for product categories
  const mockProductTypes = {
    'danish': [
      { id: 'kanelsnegl', name: 'Kanelsnegle' },
      { id: 'spandauer', name: 'Spandauer' },
      { id: 'tebirkes', name: 'Tebirkes' },
      { id: 'romsnegl', name: 'Romsnegl' }
    ],
    'bread': [
      { id: 'rugbrod', name: 'Rugbrød' },
      { id: 'sourdough', name: 'Sourdough' },
      { id: 'franskbrod', name: 'Franskbrød' },
      { id: 'flutes', name: 'Flutes' }
    ],
    'croissants': [
      { id: 'classic-croissant', name: 'Classic Croissant' },
      { id: 'chocolate-croissant', name: 'Chocolate Croissant' },
      { id: 'almond-croissant', name: 'Almond Croissant' },
      { id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant' }
    ],
    'cakes': [
      { id: 'hindbaersnitter', name: 'Hindbærsnitter' },
      { id: 'drommekage', name: 'Drømmekage' },
      { id: 'napoleon-hat', name: 'Napoleon\'s Hat' },
      { id: 'othellolagkage', name: 'Othellolagkage' }
    ],
    'specialty': [
      { id: 'cardamom-bun', name: 'Cardamom Bun' },
      { id: 'chokoladebolle', name: 'Chokoladebolle' },
      { id: 'wienerbrod', name: 'Wienerbrød' },
      { id: 'brunsviger', name: 'Brunsviger' }
    ]
  };

  // Default product types if no category is selected
  const defaultProductTypes = [
    { id: 'kanelsnegl', name: 'Kanelsnegle' },
    { id: 'classic-croissant', name: 'Classic Croissant' },
    { id: 'rugbrod', name: 'Rugbrød' },
    { id: 'cardamom-bun', name: 'Cardamom Bun' },
    { id: 'tebirkes', name: 'Tebirkes' },
    { id: 'chokoladebolle', name: 'Chokoladebolle' },
  ];

  // Mock data for product rankings by type
  const mockRankingsByProduct = {
    'kanelsnegl': [
      {
        rank: 1,
        bakeryName: "Lagkagehuset",
        bakeryId: 3,
        address: "Torvegade 45\n1400 København K",
        topReview: "The best cinnamon roll I've had in Copenhagen. Perfect balance of spice and sweetness.",
        rating: 4.9,
        reviewCount: 312,
        image: "kanelsnegl-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Sankt Peders Bageri",
        bakeryId: 7,
        address: "Sankt Peders Stræde 29\n1453 København K",
        topReview: "The 'Onsdagssnegl' is worth the wait! Rich cinnamon filling and perfect texture.",
        rating: 4.8,
        reviewCount: 267,
        image: "kanelsnegl-2.jpg"
      },
      {
        rank: 3,
        bakeryName: "Andersen Bakery",
        bakeryId: 4,
        address: "Thorvaldsensvej 2\n1871 Frederiksberg",
        topReview: "Artisanal quality in every bite. Their cinnamon rolls have the perfect dough-to-filling ratio.",
        rating: 4.7,
        reviewCount: 178,
        image: "kanelsnegl-3.jpg"
      },
      {
        rank: 4,
        bakeryName: "Meyers Bageri",
        bakeryId: 5,
        address: "Jægersborggade 9\n2200 København N",
        topReview: "Their organic approach makes a difference. Delicious cinnamon roll with subtle complexity.",
        rating: 4.5,
        reviewCount: 142,
        image: "kanelsnegl-4.jpg"
      },
      {
        rank: 5,
        bakeryName: "Hart Bageri",
        bakeryId: 2,
        address: "Gl. Kongevej 109\n1850 Frederiksberg",
        topReview: "Sourdough-based cinnamon roll with unique depth of flavor. A standout in the city.",
        rating: 4.5,
        reviewCount: 98,
        image: "kanelsnegl-5.jpg"
      }
    ],
    'spandauer': [
      {
        rank: 1,
        bakeryName: "Andersen Bakery",
        bakeryId: 4,
        address: "Thorvaldsensvej 2\n1871 Frederiksberg",
        topReview: "Perfect Spandauer with creamy vanilla filling and crisp pastry. Simply the best.",
        rating: 4.9,
        reviewCount: 156,
        image: "spandauer-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Lagkagehuset",
        bakeryId: 3,
        address: "Torvegade 45\n1400 København K",
        topReview: "Rich custard filling and perfectly laminated dough make this a standout.",
        rating: 4.7,
        reviewCount: 187,
        image: "spandauer-2.jpg"
      }
    ],
    'rugbrod': [
      {
        rank: 1,
        bakeryName: "Meyers Bageri",
        bakeryId: 5,
        address: "Jægersborggade 9\n2200 København N",
        topReview: "Traditional Danish rye with perfect density and flavor balance. Worth every kroner.",
        rating: 4.8,
        reviewCount: 156,
        image: "rugbrod-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Hart Bageri",
        bakeryId: 2,
        address: "Gl. Kongevej 109\n1850 Frederiksberg",
        topReview: "Exceptional sourdough rye with beautiful crust and moist interior.",
        rating: 4.7,
        reviewCount: 132,
        image: "rugbrod-2.jpg"
      }
    ],
    'cardamom-bun': [
      {
        rank: 1,
        bakeryName: "Juno The Bakery",
        bakeryId: 1,
        address: "Århusgade 48\n2100 København Ø",
        topReview: "The signature cardamom bun is life-changing. Perfect balance of spice and sweetness.",
        rating: 4.9,
        reviewCount: 218,
        image: "cardamom-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Hart Bageri",
        bakeryId: 2,
        address: "Gl. Kongevej 109\n1850 Frederiksberg",
        topReview: "Incredible interpretation with complex layers of flavor. A must-try.",
        rating: 4.6,
        reviewCount: 124,
        image: "cardamom-2.jpg"
      }
    ],
    'chokoladebolle': [
      {
        rank: 1,
        bakeryName: "Buka Bakery",
        bakeryId: 8,
        address: "Jagtvej 59\n2200 København N",
        topReview: "Rich chocolate roll with perfect texture. The chocolate quality is exceptional.",
        rating: 4.7,
        reviewCount: 87,
        image: "chokoladeboller-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Andersen Bakery",
        bakeryId: 4,
        address: "Thorvaldsensvej 2\n1871 Frederiksberg",
        topReview: "Deep chocolate flavor with a perfect texture. Not too sweet, just right.",
        rating: 4.6,
        reviewCount: 92,
        image: "chokoladeboller-2.jpg"
      }
    ]
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setProductRankings(mockRankingsByProduct[productId] || []);
  };

  // Set initial product types and selected product based on URL params
  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      // If we have a categoryId, filter product types by category
      if (categoryId && mockProductTypes[categoryId]) {
        setProductTypes(mockProductTypes[categoryId]);
        
        // If we also have a productId, set it as selected
        if (productId && mockRankingsByProduct[productId]) {
          setSelectedProduct(productId);
          setProductRankings(mockRankingsByProduct[productId]);
        } 
        // Otherwise, select first product in category
        else if (mockProductTypes[categoryId].length > 0) {
          const firstProduct = mockProductTypes[categoryId][0].id;
          setSelectedProduct(firstProduct);
          setProductRankings(mockRankingsByProduct[firstProduct] || []);
        }
      } 
      // If no category, use default product types
      else {
        setProductTypes(defaultProductTypes);
        
        // If we have a productId directly, use it
        if (productId && mockRankingsByProduct[productId]) {
          setSelectedProduct(productId);
          setProductRankings(mockRankingsByProduct[productId]);
        } 
        // Otherwise, select first default product
        else if (defaultProductTypes.length > 0) {
          const firstProduct = defaultProductTypes[0].id;
          setSelectedProduct(firstProduct);
          setProductRankings(mockRankingsByProduct[firstProduct] || []);
        }
      }
      
      setLoading(false);
    }, 500);
  }, [categoryId, productId]);

  return {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
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
      'danish': 'Danish Pastries',
      'bread': 'Breads',
      'croissants': 'Croissants',
      'cakes': 'Cakes & Tarts',
      'specialty': 'Specialty Items'
    };
    
    return categoryNames[categoryId] || 'Products';
  };

  return (
    <div className="container">
      <div className="product-rankings-header">
        <h1>Product Rankings: {getCategoryName()}</h1>
        <p>Compare the best places to get popular Danish pastries</p>
        
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
        {loading ? (
          <div className="loading-indicator">Loading products...</div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRankings;
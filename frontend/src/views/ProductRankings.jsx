import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/product-rankings.css';

// MVVM pattern - ViewModel logic
const useProductRankingsViewModel = () => {
  // State for the product rankings
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRankings, setProductRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for product categories
  const mockProductTypes = [
    { id: 'kanelsnegl', name: 'Kanelsnegle' },
    { id: 'croissant', name: 'Croissant' },
    { id: 'rugbrod', name: 'Rugbrød' },
    { id: 'tebirkes', name: 'Tebirkes' },
    { id: 'cardamom', name: 'Cardamom Bun' },
    { id: 'chokoladeboller', name: 'Chokoladeboller' },
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
      },
      {
        rank: 6,
        bakeryName: "Bageriet Brød",
        bakeryId: 6,
        address: "Anker Heegaards Gade 2\n1572 København V",
        topReview: "Traditional Danish kanelsnegl done right. Great texture and balanced sweetness.",
        rating: 4.4,
        reviewCount: 76,
        image: "kanelsnegl-6.jpg"
      },
      {
        rank: 7,
        bakeryName: "Buka Bakery",
        bakeryId: 8,
        address: "Jagtvej 59\n2200 København N",
        topReview: "Innovative take with cardamom hints. A modern twist that works beautifully.",
        rating: 4.3,
        reviewCount: 65,
        image: "kanelsnegl-7.jpg"
      },
      {
        rank: 8,
        bakeryName: "Alice Copenhagen",
        bakeryId: 9,
        address: "Galionsvej 37\n1437 København K",
        topReview: "A French-inspired take on the Danish classic. Lighter and more delicate than most.",
        rating: 4.2,
        reviewCount: 52,
        image: "kanelsnegl-8.jpg"
      },
      {
        rank: 9,
        bakeryName: "Mirabelle",
        bakeryId: 10,
        address: "Guldbergsgade 29\n2200 København N",
        topReview: "Organic ingredients shine in this less-sweet but satisfying kanelsnegl. Worth trying.",
        rating: 4.1,
        reviewCount: 48,
        image: "kanelsnegl-9.jpg"
      },
      {
        rank: 10,
        bakeryName: "Juno The Bakery",
        bakeryId: 1,
        address: "Århusgade 48\n2100 København Ø",
        topReview: "While they're famous for cardamom buns, their kanelsnegle are also creative and flavorful.",
        rating: 4.0,
        reviewCount: 39,
        image: "kanelsnegl-10.jpg"
      }
    ],
    'croissant': [
      {
        rank: 1,
        bakeryName: "Hart Bageri",
        bakeryId: 2,
        zipCode: "1850",
        description: "Perfect flaky layers with rich buttery flavor",
        rating: 4.9,
        reviewCount: 192,
        price: "45 kr",
        image: "croissant-1.jpg"
      },
      {
        rank: 2,
        bakeryName: "Alice Copenhagen",
        bakeryId: 9,
        zipCode: "1437",
        description: "Authentic French technique with perfect texture",
        rating: 4.8,
        reviewCount: 165,
        price: "48 kr",
        image: "croissant-2.jpg"
      },
      // Additional entries would be here
    ],
    'rugbrod': [
      {
        rank: 1,
        bakeryName: "Meyers Bageri",
        bakeryId: 5,
        zipCode: "2200",
        description: "Traditional Danish rye with perfect density",
        rating: 4.8,
        reviewCount: 156,
        price: "65 kr",
        image: "rugbrod-1.jpg"
      },
      // Additional entries would be here
    ],
    'tebirkes': [
      {
        rank: 1,
        bakeryName: "Andersen Bakery",
        bakeryId: 4,
        zipCode: "1871",
        description: "Flaky tebirkes with generous poppy seeds",
        rating: 4.8,
        reviewCount: 143,
        price: "32 kr",
        image: "tebirkes-1.jpg"
      },
      // Additional entries would be here
    ],
    'cardamom': [
      {
        rank: 1,
        bakeryName: "Juno The Bakery",
        bakeryId: 1,
        zipCode: "2100",
        description: "Signature cardamom bun with perfect balance",
        rating: 4.9,
        reviewCount: 218,
        price: "42 kr",
        image: "cardamom-1.jpg"
      },
      // Additional entries would be here
    ],
    'chokoladeboller': [
      {
        rank: 1,
        bakeryName: "Buka Bakery",
        bakeryId: 8,
        zipCode: "2200",
        description: "Rich chocolate roll with perfect texture",
        rating: 4.7,
        reviewCount: 87,
        price: "40 kr",
        image: "chokoladeboller-1.jpg"
      },
      // Additional entries would be here
    ]
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    setProductRankings(mockRankingsByProduct[productId] || []);
  };

  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setProductTypes(mockProductTypes);
      // Set default selected product to first in list
      if (mockProductTypes.length > 0) {
        const defaultProduct = mockProductTypes[0].id;
        setSelectedProduct(defaultProduct);
        setProductRankings(mockRankingsByProduct[defaultProduct] || []);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    handleProductSelect
  };
};

// View component
const ProductRankings = () => {
  const {
    productTypes,
    selectedProduct,
    productRankings,
    loading,
    handleProductSelect
  } = useProductRankingsViewModel();

  // Get the name of the currently selected product
  const getSelectedProductName = () => {
    if (!selectedProduct || !productTypes.length) return '';
    const found = productTypes.find(p => p.id === selectedProduct);
    return found ? found.name : '';
  };

  return (
    <div className="container">
      <div className="product-rankings-header">
        <h1>Product Rankings</h1>
        <p>Compare the best places to get popular Danish pastries</p>
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
          ) : (
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
                      <span className="review-count">based on {item.reviewCount} user reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRankings;
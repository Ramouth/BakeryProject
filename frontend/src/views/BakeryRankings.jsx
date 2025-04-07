import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchDropdown from '../components/SearchDropdown';
import '../styles/bakery-rankings.css';

// MVVM pattern - ViewModel logic
const useBakeryRankingsViewModel = () => {
  // State for the bakery rankings
  const [bakeries, setBakeries] = useState([]);
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Mock data for bakery rankings
  const mockBakeries = [
    {
      id: 1,
      name: "Juno The Bakery",
      location: "Århusgade 48, 2100 København Ø",
      zipCode: "2100",
      description: "Famous for their cardamom buns and sourdough bread",
      rating: 4.9,
      reviewCount: 342,
      topItem: "Cardamom Bun",
      image: "juno.jpg"
    },
    {
      id: 2,
      name: "Hart Bageri",
      location: "Gl. Kongevej 109, 1850 Frederiksberg",
      zipCode: "1850",
      description: "Amazing sourdough bread and Danish products",
      rating: 4.8,
      reviewCount: 287,
      topItem: "Sourdough Bread",
      image: "hart.jpg"
    },
    {
      id: 3,
      name: "Lagkagehuest Torvegade",
      location: "Torvegade 45, 1400 København K",
      zipCode: "1400",
      description: "High-quality Danish products and cakes",
      rating: 4.7,
      reviewCount: 458,
      topItem: "Kanelsnegl",
      image: "lagkagehuset.jpg"
    },
    {
      id: 4,
      name: "Andersen Bakery Thorvaldsensvej",
      location: "Thorvaldsensvej 2, 1871 Frederiksberg",
      zipCode: "1871",
      description: "Authentic Danish products with a modern twist",
      rating: 4.7,
      reviewCount: 178,
      topItem: "Tebirkes",
      image: "andersen.jpg"
    },
    {
      id: 5,
      name: "Meyers Bageri",
      location: "Jægersborggade 9, 2200 København N",
      zipCode: "2200",
      description: "Organic artisanal bakery with focus on sustainability",
      rating: 4.6,
      reviewCount: 196,
      topItem: "Rugbrød",
      image: "meyers.jpg"
    },
    {
      id: 6,
      name: "Bageriet Brød",
      location: "Anker Heegaards Gade 2, 1572 København V",
      zipCode: "1572",
      description: "Small artisan bakery with excellent bread and products",
      rating: 4.5,
      reviewCount: 124,
      topItem: "Croissant",
      image: "brod.jpg"
    },
    {
      id: 7,
      name: "Sankt Peders Bageri",
      location: "Sankt Peders Stræde 29, 1453 København K",
      zipCode: "1453",
      description: "Historic bakery famous for 'Onsdagssnegle' (Wednesday cinnamon rolls)",
      rating: 4.5,
      reviewCount: 267,
      topItem: "Onsdagssnegl",
      image: "sankt-peders.jpg"
    },
    {
      id: 8,
      name: "Buka Bakery",
      location: "Jagtvej 59, 2200 København N",
      zipCode: "2200",
      description: "Modern bakery with a focus on sourdough and seasonal ingredients",
      rating: 4.4,
      reviewCount: 98,
      topItem: "Chocolate Croissant",
      image: "buka.jpg"
    },
    {
      id: 9,
      name: "Alice Copenhagen",
      location: "Galionsvej 37, 1437 København K",
      zipCode: "1437",
      description: "French-inspired bakery with exceptional viennoiserie",
      rating: 4.3,
      reviewCount: 87,
      topItem: "Pain au Chocolat",
      image: "alice.jpg"
    },
    {
      id: 10,
      name: "Mirabelle",
      location: "Guldbergsgade 29, 2200 København N",
      zipCode: "2200",
      description: "Organic bakery and restaurant with focus on local ingredients",
      rating: 4.2,
      reviewCount: 156,
      topItem: "Sourdough Croissant",
      image: "mirabelle.jpg"
    }
  ];

  // Handle search submission
  const handleSearch = (searchParams) => {
    const { type, zipCode, rating } = searchParams;
    
    // Filter bakeries based on search parameters
    let filtered = [...mockBakeries];
    
    if (zipCode) {
      filtered = filtered.filter(bakery => bakery.zipCode === zipCode);
    }
    
    if (rating) {
      const ratingValue = parseInt(rating);
      filtered = filtered.filter(bakery => bakery.rating >= ratingValue);
    }
    
    setFilteredBakeries(filtered);
  };

  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setBakeries(mockBakeries);
      setFilteredBakeries(mockBakeries);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    bakeries: filteredBakeries,
    loading,
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedRating,
    setSelectedRating,
    handleSearch
  };
};

// View component
const BakeryRankings = () => {
  const {
    bakeries,
    loading,
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedRating,
    setSelectedRating,
    handleSearch
  } = useBakeryRankingsViewModel();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch({
      type: searchType,
      zipCode: selectedZipCode,
      rating: selectedRating
    });
  };

  return (
    <div className="container">
      <div className="rankings-header">
        <h1>Top Bakeries in Copenhagen</h1>
        <p>Discover the best bakeries based on user reviews and ratings</p>
      </div>
      
      {/* Search Component */}
      <div className="search-container">
        <form onSubmit={handleSearchSubmit} className="search-dropdown-form">
          <div className="search-type-selector">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-dropdown"
            >
              <option value="bakeries">Find Bakeries</option>
              <option value="products">Find Products</option>
              <option value="reviews">Browse Reviews</option>
            </select>
          </div>
          
          <div className="search-filters">
            {searchType === 'bakeries' && (
              <select 
                value={selectedZipCode} 
                onChange={(e) => setSelectedZipCode(e.target.value)}
                className="search-dropdown"
              >
                <option value="">All Copenhagen</option>
                <option value="1050">1050 - Inner City</option>
                <option value="1400">1400 - København K</option>
                <option value="1437">1437 - København K</option>
                <option value="1453">1453 - København K</option>
                <option value="1500">1500 - Vesterbro</option>
                <option value="1572">1572 - København V</option>
                <option value="1850">1850 - Frederiksberg</option>
                <option value="1871">1871 - Frederiksberg</option>
                <option value="2000">2000 - Frederiksberg</option>
                <option value="2100">2100 - Østerbro</option>
                <option value="2200">2200 - Nørrebro</option>
                <option value="2300">2300 - Amager</option>
              </select>
            )}
            
            <select 
              value={selectedRating} 
              onChange={(e) => setSelectedRating(e.target.value)}
              className="search-dropdown"
            >
              <option value="">All Ratings</option>
              <option value="5">5+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
          </div>
          
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      {/* Bakery Rankings List */}
      <div className="bakery-rankings">
        {loading ? (
          <div className="loading">Loading bakeries...</div>
        ) : (
          <div className="bakery-list">
            {bakeries.map((bakery, index) => (
              <div className="bakery-card" key={bakery.id}>
                <div className="bakery-rank">{index + 1}</div>
                <div className="bakery-image">
                  <div className="placeholder-image">
                    {bakery.name}
                    {bakery.rating >= 4.7 && (
                      <div className="top-review-badge">TOP REVIEW</div>
                    )}
                  </div>
                </div>
                <div className="bakery-details">
                  <h3>{bakery.name}</h3>
                  <p className="bakery-location">{bakery.location}</p>
                  <p className="bakery-description">{bakery.description}</p>
                  <div className="bakery-meta">
                    <div className="bakery-rating">
                      <span className="rating-value">{bakery.rating}</span>
                      <span className="stars">★★★★★</span>
                      <span className="review-count">({bakery.reviewCount} reviews)</span>
                    </div>
                    <div className="top-item">
                      <strong>Must try:</strong> {bakery.topItem}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BakeryRankings;
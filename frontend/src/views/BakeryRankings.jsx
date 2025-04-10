import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import SearchDropdown from '../components/SearchDropdown';
import '../styles/bakery-rankings.css';

// MVVM pattern - ViewModel logic
const useBakeryRankingsViewModel = () => {
  // State for the bakery rankings
  const [bakeries, setBakeries] = useState([]);
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  // Fetch bakeries from API with caching
  const fetchBakeries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use apiClient with default caching (60 seconds)
      const response = await apiClient.get('/bakeries', true);
      setBakeries(response.bakeries);
      setFilteredBakeries(response.bakeries);
    } catch (error) {
      console.error('Error fetching bakeries:', error);
      setError('Failed to load bakeries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = async (searchParams) => {
    const { type, zipCode, rating } = searchParams;
    
    setLoading(true);
    setError(null);
    
    try {
      if (zipCode || rating) {
        // For specific filters, we can use the search endpoint if available
        if (zipCode && !rating) {
          // If we have a dedicated endpoint for zip code search
          try {
            // Using a dynamic URL with parameters to ensure proper caching
            const response = await apiClient.get(`/bakeries/search?q=${zipCode}`, true);
            setFilteredBakeries(response.bakeries || []);
          } catch (error) {
            // Fallback to client-side filtering
            const filtered = bakeries.filter(bakery => bakery.zipCode === zipCode);
            setFilteredBakeries(filtered);
          }
        } else {
          // Filter bakeries client-side for complex filters
          let filtered = [...bakeries];
          
          if (zipCode) {
            filtered = filtered.filter(bakery => bakery.zipCode === zipCode);
          }
          
          if (rating) {
            const ratingValue = parseFloat(rating);
            filtered = filtered.filter(bakery => {
              const avgRating = bakery.average_rating || 0;
              return avgRating >= ratingValue;
            });
          }
          
          setFilteredBakeries(filtered);
        }
      } else if (type === 'bakeries' && searchType === 'bakeries') {
        // If no filters and type is bakeries, fetch all bakeries with caching
        await fetchBakeries();
      }
    } catch (error) {
      console.error('Error during search:', error);
      setError('Search failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial component mount with caching
  useEffect(() => {
    fetchBakeries();
  }, []);

  // Re-fetch when search type changes
  useEffect(() => {
    if (searchType === 'bakeries') {
      fetchBakeries();
    }
  }, [searchType]);

  return {
    bakeries: filteredBakeries,
    loading,
    error,
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
  // Component code remains the same
  const {
    bakeries,
    loading,
    error,
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedRating,
    setSelectedRating,
    handleSearch
  } = useBakeryRankingsViewModel();

  const handleSearchSubmit = (searchParams) => {
    handleSearch(searchParams);
  };

  // Search options for dropdown
  const searchTypes = [
    { value: 'bakeries', label: 'Find Bakeries' },
    { value: 'products', label: 'Find Products' }
  ];

  const filterOptions = {
    bakeries: [
      {
        name: 'zipCode',
        options: [
          { value: '', label: 'All Postal Codes' },
          { value: '1050', label: '1050 - Inner City' },
          { value: '1400', label: '1400 - København K' },
          { value: '1437', label: '1437 - København K' },
          { value: '1453', label: '1453 - København K' },
          { value: '1500', label: '1500 - Vesterbro' },
          { value: '1572', label: '1572 - København V' },
          { value: '1850', label: '1850 - Frederiksberg' },
          { value: '1871', label: '1871 - Frederiksberg' },
          { value: '2000', label: '2000 - Frederiksberg' },
          { value: '2100', label: '2100 - Østerbro' },
          { value: '2200', label: '2200 - Nørrebro' },
          { value: '2300', label: '2300 - Amager' }
        ]
      },
      {
        name: 'rating',
        options: [
          { value: '', label: 'All Ratings' },
          { value: '5', label: '5+ Stars' },
          { value: '4.5', label: '4.5+ Stars' },
          { value: '4', label: '4+ Stars' },
          { value: '3.5', label: '3.5+ Stars' },
          { value: '3', label: '3+ Stars' }
        ]
      }
    ],
    products: [
      {
        name: 'category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'bread', label: 'Bread' },
          { value: 'danish', label: 'Danish Pastry' },
          { value: 'cake', label: 'Cakes' },
          { value: 'viennoiserie', label: 'Viennoiserie' }
        ]
      },
      {
        name: 'rating',
        options: [
          { value: '', label: 'All Ratings' },
          { value: '5', label: '5+ Stars' },
          { value: '4.5', label: '4.5+ Stars' },
          { value: '4', label: '4+ Stars' },
          { value: '3.5', label: '3.5+ Stars' },
          { value: '3', label: '3+ Stars' }
        ]
      }
    ]
  };

  // Helper function to format address
  const formatAddress = (bakery) => {
    const addressParts = [];
    if (bakery.streetName) addressParts.push(bakery.streetName);
    if (bakery.streetNumber) addressParts.push(bakery.streetNumber);
    if (bakery.zipCode) addressParts.push(bakery.zipCode);
    
    return addressParts.join(' ');
  };

  // Helper function to get average rating or 0
  const getBakeryRating = (bakery) => {
    return bakery.average_rating || bakery.ratings?.overall || 0;
  };

  // Helper function to get review count
  const getReviewCount = (bakery) => {
    return bakery.review_count || 0;
  };

  return (
    <div className="container">
      <div className="rankings-header">
        <h1>Top Bakeries in Copenhagen</h1>
        <p>Discover the best bakeries based on user reviews and ratings</p>
      </div>
      
      {/* Search Component */}
      <SearchDropdown 
        onSearch={handleSearchSubmit}
        searchTypes={searchTypes}
        filterOptions={filterOptions}
      />

      {/* Bakery Rankings List */}
      <div className="bakery-rankings">
        {loading ? (
          <div className="loading">Loading bakeries...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : bakeries.length === 0 ? (
          <div className="no-results">No bakeries found matching your criteria.</div>
        ) : (
          <div className="bakery-list">
            {bakeries.map((bakery, index) => (
              <Link to={`/bakery/${bakery.id}`} className="bakery-card" key={bakery.id}>
                <div className="bakery-rank">{index + 1}</div>
                <div className="bakery-image">
                  <div className="placeholder-image">
                    {bakery.name}
                    {getBakeryRating(bakery) >= 4.7 && (
                      <div className="top-review-badge">TOP REVIEW</div>
                    )}
                  </div>
                </div>
                <div className="bakery-details">
                  <h3>{bakery.name}</h3>
                  <p className="bakery-location">{formatAddress(bakery)}</p>
                  <p className="bakery-description">
                    {bakery.description || "A wonderful bakery in Copenhagen offering delicious products."}
                  </p>
                  <div className="bakery-meta">
                    <div className="bakery-rating">
                      <span className="rating-value">{getBakeryRating(bakery).toFixed(1)}</span>
                      <span className="stars">★★★★★</span>
                      <span className="review-count">({getReviewCount(bakery)} reviews)</span>
                    </div>
                    {bakery.topProduct && (
                      <div className="top-item">
                        <strong>Must try:</strong> {bakery.topProduct}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BakeryRankings;
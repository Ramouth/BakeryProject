// src/components/ReviewModal.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import RatingBar from './RatingComponent';
import { useNotification } from '../store/NotificationContext';

const ReviewModal = ({ isOpen, onClose }) => {
  const { showSuccess, showError } = useNotification();
  
  // State for form inputs and UI control
  const [reviewType, setReviewType] = useState('bakery'); // 'bakery' or 'product'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Review form data
  const [overallRating, setOverallRating] = useState(0);
  const [ratings, setRatings] = useState({
    // Bakery ratings
    service: 0,
    price: 0,
    atmosphere: 0,
    location: 0,
    
    // Product ratings
    taste: 0,
    presentation: 0
  });
  const [comments, setComments] = useState('');
  
  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setReviewType('bakery');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedItem(null);
    setHasSearched(false);
    setOverallRating(0);
    setRatings({
      service: 0,
      price: 0,
      atmosphere: 0,
      location: 0,
      taste: 0,
      presentation: 0
    });
    setComments('');
  };

  // Handle bakery/product search
  const handleSearch = () => {
    if (searchTerm.trim().length < 2) {
      showError("Please enter at least 2 characters to search");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    // Mock API call to search bakeries or products
    setTimeout(() => {
      let mockResults = [];
      
      if (reviewType === 'bakery') {
        // These would come from your actual API
        mockResults = [
          { id: 1, name: "Juno The Bakery", location: "Århusgade 48, 2100 København Ø" },
          { id: 2, name: "Hart Bageri", location: "Gl. Kongevej 109, 1850 Frederiksberg" },
          { id: 3, name: "Lagkagehuset", location: "Torvegade 45, 1400 København K" }
        ];
      } else {
        mockResults = [
          { id: 1, name: "Kanelsnegl", bakery: "Lagkagehuset" },
          { id: 2, name: "Tebirkes", bakery: "Andersen Bakery" },
          { id: 3, name: "Cardamom Bun", bakery: "Juno The Bakery" }
        ];
      }
      
      // Filter results based on search term
      const filteredResults = mockResults.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 500);
  };

  // Handle rating changes
  const handleRatingChange = (field, value) => {
    if (field === 'overall') {
      setOverallRating(value);
    } else {
      setRatings({
        ...ratings,
        [field]: value
      });
    }
  };
  
  // Submit the review
  const handleSubmitReview = () => {
    if (!selectedItem) {
      showError(`Please select a ${reviewType} to review`);
      return;
    }
    
    if (overallRating === 0) {
      showError("Please provide an overall rating");
      return;
    }
    
    // In a real implementation, you would send this data to your API
    const reviewData = {
      type: reviewType,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      overallRating,
      ratings: reviewType === 'bakery' 
        ? {
            service: ratings.service,
            price: ratings.price,
            atmosphere: ratings.atmosphere,
            location: ratings.location
          }
        : {
            taste: ratings.taste,
            price: ratings.price,
            presentation: ratings.presentation
          },
      comments
    };
    
    console.log('Submitting review:', reviewData);
    
    // Mock successful submission
    setTimeout(() => {
      showSuccess(`Your ${reviewType} review has been submitted!`);
      onClose();
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Write a ${reviewType === 'bakery' ? 'Bakery' : 'Product'} Review`}>
      <div className="review-modal-content">
        {/* Review Type Selection */}
        <div className="review-type-selection">
          <div className="review-type-buttons">
            <button 
              className={`review-type-button ${reviewType === 'bakery' ? 'active' : ''}`}
              onClick={() => {
                setReviewType('bakery');
                setSelectedItem(null);
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              Review a Bakery
            </button>
            <button 
              className={`review-type-button ${reviewType === 'product' ? 'active' : ''}`}
              onClick={() => {
                setReviewType('product');
                setSelectedItem(null);
                setSearchResults([]);
                setHasSearched(false);
              }}
            >
              Review a Product
            </button>
          </div>
        </div>
        
        {/* Search Section */}
        <div className="search-section">
          <h3>Find a {reviewType === 'bakery' ? 'Bakery' : 'Product'}</h3>
          <div className="search-input-group">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Enter ${reviewType} name`}
              className="search-input"
            />
            <Button 
              onClick={handleSearch}
              disabled={searchTerm.trim().length < 2 || isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {isSearching ? (
            <div className="search-status">Searching...</div>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="search-status">No results found</div>
          ) : null}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(item => (
                <div 
                  key={item.id} 
                  className={`search-result-item ${selectedItem && selectedItem.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="result-item-name">{item.name}</div>
                  <div className="result-item-details">
                    {reviewType === 'bakery' ? item.location : `Bakery: ${item.bakery}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Rating Section - only shown when an item is selected */}
        {selectedItem && (
          <div className="rating-section">
            <h3>Rate {selectedItem.name}</h3>
            
            <div className="rating-container">
              <div className="rating-row">
                <div className="rating-label">Overall:</div>
                <RatingBar 
                  rating={overallRating} 
                  onChange={(value) => handleRatingChange('overall', value)} 
                  max={10}
                />
              </div>
              
              {reviewType === 'bakery' ? (
                // Bakery-specific ratings
                <>
                  <div className="rating-row">
                    <div className="rating-label">Service:</div>
                    <RatingBar 
                      rating={ratings.service} 
                      onChange={(value) => handleRatingChange('service', value)} 
                      max={10}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Price:</div>
                    <RatingBar 
                      rating={ratings.price} 
                      onChange={(value) => handleRatingChange('price', value)} 
                      max={10}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Atmosphere:</div>
                    <RatingBar 
                      rating={ratings.atmosphere} 
                      onChange={(value) => handleRatingChange('atmosphere', value)} 
                      max={10}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Location:</div>
                    <RatingBar 
                      rating={ratings.location} 
                      onChange={(value) => handleRatingChange('location', value)} 
                      max={10}
                    />
                  </div>
                </>
              ) : (
                // Product-specific ratings
                <>
                  <div className="rating-row">
                    <div className="rating-label">Taste:</div>
                    <RatingBar 
                      rating={ratings.taste} 
                      onChange={(value) => handleRatingChange('taste', value)} 
                      max={10}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Price:</div>
                    <RatingBar 
                      rating={ratings.price} 
                      onChange={(value) => handleRatingChange('price', value)} 
                      max={10}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Presentation:</div>
                    <RatingBar 
                      rating={ratings.presentation} 
                      onChange={(value) => handleRatingChange('presentation', value)} 
                      max={10}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="comments-section">
              <label htmlFor="comments">Comments (Optional):</label>
              <textarea
                id="comments"
                rows="3"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={`Share your thoughts about this ${reviewType}...`}
              />
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          
          {selectedItem && (
            <Button
              onClick={handleSubmitReview}
              disabled={overallRating === 0}
            >
              Submit Review
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
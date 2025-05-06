import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Button from './Button';
import CookieRating from './CookieRatingComponent';
import { useNotification } from '../store/NotificationContext';
import { useUser } from '../store/UserContext';
import apiClient from '../services/api';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  initialReviewType = 'bakery',
  initialSelectedItem = null
}) => {
  const { showSuccess, showError } = useNotification();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  // State for form inputs and UI control
  const [reviewType, setReviewType] = useState(initialReviewType);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Review form data - ratings now store values 1-10 even though display is 0.5-5
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
  
  // Check authentication when modal is requested to open
  useEffect(() => {
    if (isOpen && !currentUser) {
      // Close the modal
      onClose();
      // Redirect to login page
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          reviewIntent: true,
          reviewType: initialReviewType,
          itemId: initialSelectedItem?.id
        } 
      });
    }
  }, [isOpen, currentUser, navigate, onClose, initialReviewType, initialSelectedItem]);
  
  // Reset state when modal is opened or when initialSelectedItem changes
  useEffect(() => {
    if (isOpen && currentUser) {
      // Keep the initial review type if provided
      setReviewType(initialReviewType);
      
      // If an initial item is provided, use it
      if (initialSelectedItem) {
        setSelectedItem(initialSelectedItem);
        
        // Set the bakery name for search if it's a bakery
        if (initialReviewType === 'bakery' && initialSelectedItem.name) {
          setSearchTerm(initialSelectedItem.name);
        } 
        // Set the product name for search if it's a product
        else if (initialReviewType === 'product' && initialSelectedItem.name) {
          setSearchTerm(initialSelectedItem.name);
        }
      } else {
        // Reset everything if no initial item is provided
        resetForm();
      }
    }
  }, [isOpen, initialReviewType, initialSelectedItem, currentUser]);
  
  const resetForm = () => {
    setReviewType(initialReviewType || 'bakery');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedItem(initialSelectedItem || null);
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
    setIsSubmitting(false);
  };

  // Handle bakery/product search
  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) {
      showError("Please enter at least 2 characters to search");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let endpoint = '';
      if (reviewType === 'bakery') {
        endpoint = `/bakeries/search?q=${encodeURIComponent(searchTerm)}`;
      } else {
        endpoint = `/products/search?q=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await apiClient.get(endpoint);
      console.log('Search response:', response);
      
      // Handle response data based on the review type
      let results = [];
      if (reviewType === 'bakery') {
        results = response.bakeries || [];
      } else {
        // For products, we need additional information about their bakeries
        let products = response.products || [];
        
        // First, check if we have the expected data structure
        const needsBakeryDetails = products.some(p => p.bakeryId && (!p.bakery || !p.bakery.name));
        
        if (needsBakeryDetails) {
          // We need to fetch bakery details for each product
          const productsWithBakeries = await Promise.all(
            products.map(async (product) => {
              if (!product.bakery && product.bakeryId) {
                try {
                  // First, try to fetch bakery
                  const bakeryResponse = await apiClient.get(`/bakeries/${product.bakeryId}`);
                  
                  return {
                    ...product,
                    bakery: bakeryResponse
                  };
                } catch (err) {
                  console.error(`Error fetching bakery for product ${product.id}:`, err);
                  return product;
                }
              }
              return product;
            })
          );
          results = productsWithBakeries;
        } else {
          results = products;
        }
      }
      
      setSearchResults(results);
      
      // If we have an initialSelectedItem and it matches one of the search results, select it
      if (initialSelectedItem) {
        const matchingResult = results.find(result => result.id === initialSelectedItem.id);
        if (matchingResult) {
          setSelectedItem(matchingResult);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      showError(`Error searching for ${reviewType === 'bakery' ? 'bakeries' : 'products'}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle rating changes - value will already be 1-10 scale from CookieRating
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
const handleSubmitReview = async () => {
  if (!selectedItem) {
    showError(`Please select a ${reviewType} to review`);
    return;
  }
  
  if (overallRating === 0) {
    showError("Please provide an overall rating");
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Prepare review data based on review type
    let reviewData = {
      review: comments || `Review for ${selectedItem.name}`,
      overallRating: overallRating,
      userId: currentUser?.id || null // Use the user's ID if logged in, null otherwise
    };
    
    if (reviewType === 'bakery') {
      // Bakery review specific fields - explicitly set null for 0 ratings
      reviewData = {
        ...reviewData,
        serviceRating: ratings.service > 0 ? ratings.service : null,
        priceRating: ratings.price > 0 ? ratings.price : null, 
        atmosphereRating: ratings.atmosphere > 0 ? ratings.atmosphere : null,
        locationRating: ratings.location > 0 ? ratings.location : null,
        bakeryId: selectedItem.id
      };
      
      // Send to bakery reviews endpoint
      await apiClient.post('/bakeryreviews/create', reviewData);
    } else {
      // Product review specific fields - explicitly set null for 0 ratings
      reviewData = {
        ...reviewData,
        tasteRating: ratings.taste > 0 ? ratings.taste : null,
        priceRating: ratings.price > 0 ? ratings.price : null,
        presentationRating: ratings.presentation > 0 ? ratings.presentation : null,
        productId: selectedItem.id
      };
      
      // Send to product reviews endpoint
      await apiClient.post('/productreviews/create', reviewData);
    }
    
    showSuccess(`Your ${reviewType} review has been submitted!`);
    onClose();
  } catch (error) {
    console.error('Review submission error:', error);
    showError(`Failed to submit review: ${error.message || "Unknown error"}`);
  } finally {
    setIsSubmitting(false);
  }
};

  // Get bakery name with location
  const getBakeryName = (product) => {
    if (!product.bakery) return 'Unknown Bakery';
    return product.bakery.name || 'Unknown Bakery';
  };

  // Get bakery address for a product
  const getBakeryAddress = (product) => {
    if (!product.bakery) return null;
    
    const bakery = product.bakery;
    
    // Check if bakery has address information
    if (!bakery.streetName && !bakery.streetNumber && !bakery.zipCode) {
      return null;
    }
    
    // Construct the address string
    let address = '';
    if (bakery.streetName) {
      address += bakery.streetName;
      if (bakery.streetNumber) {
        address += ' ' + bakery.streetNumber;
      }
    }
    
    if (bakery.zipCode) {
      if (address.length > 0) {
        address += ', ';
      }
      address += bakery.zipCode;
    }
    
    return address;
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
        
        {/* Search Section - Only shown if no initialSelectedItem or if the user changed the review type */}
        {(!selectedItem || (initialSelectedItem && initialSelectedItem.id !== selectedItem?.id)) && (
          <div className="search-section">
            <h3>Find a {reviewType === 'bakery' ? 'Bakery' : 'Product'}</h3>
            <div className="search-input-group">
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Enter ${reviewType} name`}
                className="search-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
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
                      {reviewType === 'bakery' ? (
                        <>
                          {item.streetName && `${item.streetName} ${item.streetNumber || ''}`}
                          {item.zipCode && (item.streetName ? `, ${item.zipCode}` : item.zipCode)}
                        </>
                      ) : (
                        <>
                          <div className="bakery-name">Bakery: {getBakeryName(item)}</div>
                          {getBakeryAddress(item) && (
                            <div className="bakery-address">
                              {getBakeryAddress(item)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Rating Section - only shown when an item is selected */}
        {selectedItem && (
          <div className="rating-section">
            <h3>Rate {selectedItem.name}</h3>
            {reviewType === 'product' && selectedItem.bakery && (
              <p className="selected-bakery-info">
                Bakery: {getBakeryName(selectedItem)}
                {getBakeryAddress(selectedItem) && ` - ${getBakeryAddress(selectedItem)}`}
              </p>
            )}
            
            <div className="rating-container">
              <div className="rating-row">
                <div className="rating-label">Overall:</div>
                <CookieRating 
                  rating={overallRating} 
                  onChange={(value) => handleRatingChange('overall', value)}
                  max={5}
                />
              </div>
              
              {reviewType === 'bakery' ? (
                // Bakery-specific ratings
                <>
                  <div className="rating-row">
                    <div className="rating-label">Service:</div>
                    <CookieRating 
                      rating={ratings.service} 
                      onChange={(value) => handleRatingChange('service', value)} 
                      max={5}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Price:</div>
                    <CookieRating 
                      rating={ratings.price} 
                      onChange={(value) => handleRatingChange('price', value)} 
                      max={5}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Atmosphere:</div>
                    <CookieRating 
                      rating={ratings.atmosphere} 
                      onChange={(value) => handleRatingChange('atmosphere', value)} 
                      max={5}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Location:</div>
                    <CookieRating 
                      rating={ratings.location} 
                      onChange={(value) => handleRatingChange('location', value)} 
                      max={5}
                    />
                  </div>
                </>
              ) : (
                // Product-specific ratings
                <>
                  <div className="rating-row">
                    <div className="rating-label">Taste:</div>
                    <CookieRating 
                      rating={ratings.taste} 
                      onChange={(value) => handleRatingChange('taste', value)} 
                      max={5}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Price:</div>
                    <CookieRating 
                      rating={ratings.price} 
                      onChange={(value) => handleRatingChange('price', value)} 
                      max={5}
                    />
                  </div>
                  
                  <div className="rating-row">
                    <div className="rating-label">Presentation:</div>
                    <CookieRating 
                      rating={ratings.presentation} 
                      onChange={(value) => handleRatingChange('presentation', value)} 
                      max={5}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="comments-section">
              <label htmlFor="comments">Comments (Optional):</label>
              <div className="textarea-container">
                 <textarea
                   id="comments"
                   rows="3"
                   value={comments}
                   onChange={(e) => {
                     // Limit input to 1000 characters
                     if (e.target.value.length <= 280) {
                       setComments(e.target.value);
                     }
                   }}
                   maxLength={280}
                   placeholder={`Share your thoughts about this ${reviewType}...`}
                 />
                 <div className="character-count">
                   <span className={comments.length > 200 ? (comments.length > 250 ? "count-warning" : "count-notice") : ""}>
                     {comments.length}/280
                   </span>
                 </div>
               </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          
          {selectedItem && (
            <Button
              onClick={handleSubmitReview}
              disabled={overallRating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
// src/components/ReviewModal.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import RatingBar from './RatingComponent';
import { useNotification } from '../store/NotificationContext';
import { useUser } from '../store/UserContext';
import apiClient from '../services/api';

const ReviewModal = ({ isOpen, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const { currentUser } = useUser();
  
  // State for form inputs and UI control
  const [reviewType, setReviewType] = useState('bakery'); // 'bakery' or 'product'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        const products = response.products || [];
        
        // For products, we'll process them to include more complete bakery info
        const productsWithBakeryInfo = [];
        
        for (const product of products) {
          try {
            let updatedProduct = { ...product };
            
            // If product has a bakeryId but no bakery details, fetch them
            if (product.bakeryId && (!product.bakery || !product.bakery.streetName)) {
              console.log(`Fetching bakery details for product ${product.name} (bakeryId: ${product.bakeryId})`);
              const bakeryResponse = await apiClient.get(`/bakeries/${product.bakeryId}`);
              updatedProduct.bakery = bakeryResponse;
            }
            
            // Log the product details for debugging
            console.log('Processed product:', updatedProduct);
            
            productsWithBakeryInfo.push(updatedProduct);
          } catch (err) {
            console.error(`Error processing product ${product.id}:`, err);
            productsWithBakeryInfo.push(product); // Add product even if we couldn't get bakery details
          }
        }
        
        results = productsWithBakeryInfo;
      }
      
      console.log('Final search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      showError(`Error searching for ${reviewType === 'bakery' ? 'bakeries' : 'products'}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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
        userId: null // Always set userId to null for now
      };
      
      // Removed user ID assignment to ensure all reviews are anonymous
      // This can be re-enabled once user authentication is fully implemented
      
      if (reviewType === 'bakery') {
        // Bakery review specific fields
        reviewData = {
          ...reviewData,
          serviceRating: ratings.service || 5,
          priceRating: ratings.price || 5,
          atmosphereRating: ratings.atmosphere || 5,
          locationRating: ratings.location || 5,
          bakeryId: selectedItem.id
        };
        
        // Send to bakery reviews endpoint
        await apiClient.post('/bakeryreviews/create', reviewData);
      } else {
        // Product review specific fields
        reviewData = {
          ...reviewData,
          tasteRating: ratings.taste || 5,
          priceRating: ratings.price || 5,
          presentationRating: ratings.presentation || 5,
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
                        Bakery: {item.bakery?.name || 'Unknown'}
                        {/* Only show address if we have it */}
                        {getBakeryAddress(item) && (
                          <span className="bakery-address">
                            <br/>{getBakeryAddress(item)}
                          </span>
                        )}
                      </>
                    )}
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
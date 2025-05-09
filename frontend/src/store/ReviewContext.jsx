import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';
import { useUser } from './UserContext';

// Create context
const ReviewContext = createContext();

// Provider component
export const ReviewProvider = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  // State for the review flow
  const [selectedBakery, setSelectedBakery] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRatings, setProductRatings] = useState({
    overall: 0,  
    taste: 0,    
    price: 0,    
    presentation: 0, 
    comments: ''
  });
  
  const [bakeryRatings, setBakeryRatings] = useState({
    overall: 0,  
    service: 0,  
    price: 0,    
    atmosphere: 0, 
    location: 0,   
    selection: 0,  
    comments: ''
  });
  
  const [experienceRating, setExperienceRating] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation helper
  const goToNextStep = useCallback((step) => {
    switch (step) {
      case 'start':
        navigate('/');
        break;
      case 'bakerySelection':
        navigate('/bakery-selection');
        break;
      case 'productSelection':
        navigate('/product-selection');
        break;
      case 'productRating':
        navigate('/product-rating');
        break;
      case 'reviewOptions':
        navigate('/bakery-rating');
        break;
      case 'bakeryRating':
        navigate('/bakery-rating');
        break;
      case 'experienceRating':
        navigate('/thank-you');
        break;
      case 'thankYou':
        navigate('/thank-you');
        break;
      default:
        navigate('/');
    }
  }, [navigate]);
  
  // Reset all review data
  const resetReview = useCallback(() => {
    // Reset bakery selection
    setSelectedBakery(null);
    
    // Reset product selection
    setSelectedProduct(null);
    
    // Reset product ratings
    setProductRatings({
      overall: 0, 
      taste: 0,  
      price: 0,  
      presentation: 0, 
      comments: ''
    });
    
    // Reset bakery ratings
    setBakeryRatings({
      overall: 0, 
      service: 0, 
      price: 0,    
      atmosphere: 0, 
      location: 0,   
      selection: 0,  
      comments: ''
    });
    
    // Reset experience rating and state
    setExperienceRating(0);
    setIsSubmitting(false);
    setError(null);
    
    // Also clear from localStorage to prevent persisting between sessions
    try {
      localStorage.removeItem('reviewState');
    } catch (err) {
      console.error('Failed to clear review state from storage', err);
    }
  }, []);
  
  // Submit product review - Updated to support anonymous reviews
  const submitProductReview = useCallback(async () => {
    // Validate overall rating is greater than 0
    if (productRatings.overall <= 0) {
      setError('Please provide an overall rating');
      return Promise.reject(new Error('Overall rating must be greater than 0'));
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build review data - userId is now optional
      const reviewData = {
        review: productRatings.comments || "Great product!",
        overallRating: parseInt(productRatings.overall),
        tasteRating: parseInt(productRatings.taste),
        priceRating: parseInt(productRatings.price),
        presentationRating: parseInt(productRatings.presentation),
        productId: selectedProduct.id
      };
      
      // Only include userId if user is logged in
      if (currentUser && currentUser.id) {
        reviewData.userId = currentUser.id;
      }
      
      // Submit to API
      const response = await reviewService.createProductReview(reviewData);
      return response;
    } catch (error) {
      setError('Failed to submit product review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedProduct, productRatings, currentUser]);
  
  // Submit bakery review - Updated to support anonymous reviews
  const submitBakeryReview = useCallback(async () => {
    // Validate overall rating is greater than 0
    if (bakeryRatings.overall <= 0) {
      setError('Please provide an overall rating');
      return Promise.reject(new Error('Overall rating must be greater than 0'));
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build review data - userId is now optional
      const reviewData = {
        review: bakeryRatings.comments || "Great bakery!",
        overallRating: parseInt(bakeryRatings.overall),
        serviceRating: parseInt(bakeryRatings.service),
        priceRating: parseInt(bakeryRatings.price),
        atmosphereRating: parseInt(bakeryRatings.atmosphere),
        locationRating: parseInt(bakeryRatings.location),
        bakeryId: selectedBakery.id
      };
      
      // Only include userId if user is logged in
      if (currentUser && currentUser.id) {
        reviewData.userId = currentUser.id;
      }
      
      // Submit to API
      const response = await reviewService.createBakeryReview(reviewData);
      return response;
    } catch (error) {
      setError('Failed to submit bakery review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBakery, bakeryRatings, currentUser]);
  
  // Submit experience rating
  const submitExperienceRating = useCallback(async (feedback = "") => {
    // Validate overall rating is greater than 0
    if (experienceRating <= 0) {
      setError('Please provide an experience rating');
      return Promise.reject(new Error('Experience rating must be greater than 0'));
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.submitExperienceRating({
        rating: experienceRating,
        feedback
      });
      
      return response;
    } catch (error) {
      setError('Failed to submit experience rating: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [experienceRating]);
  
  // Exposed context value
  const value = {
    selectedBakery,
    setSelectedBakery,
    selectedProduct,
    setSelectedProduct,
    productRatings,
    setProductRatings,
    bakeryRatings,
    setBakeryRatings,
    experienceRating,
    setExperienceRating,
    isSubmitting,
    error,
    resetReview,
    submitProductReview,
    submitBakeryReview,
    submitExperienceRating,
    goToNextStep
  };
  
  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

// Custom hook for using the context
export const useReview = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

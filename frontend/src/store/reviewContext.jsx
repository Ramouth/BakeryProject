import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services';
import { useUser } from './UserContext';

// Create context
const ReviewContext = createContext();

// Provider component
export const ReviewProvider = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  // State for the review flow
  const [selectedBakery, setSelectedBakery] = useState(null);
  const [selectedPastry, setSelectedPastry] = useState(null);
  const [pastryRatings, setPastryRatings] = useState({
    overall: 5,
    taste: 5,
    price: 5, 
    presentation: 5,
    comments: ''
  });
  
  const [bakeryRatings, setBakeryRatings] = useState({
    overall: 5,
    service: 5,
    price: 5,
    atmosphere: 5,
    location: 5,
    selection: 5,
    comments: ''
  });
  
  const [experienceRating, setExperienceRating] = useState(5);
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
      case 'pastrySelection':
        navigate('/pastry-selection');
        break;
      case 'pastryRating':
        navigate('/pastry-rating');
        break;
      case 'reviewOptions':
        navigate('/bakery-rating');
        break;
      case 'bakeryRating':
        navigate('/bakery-rating');
        break;
      case 'experienceRating':
        // This would be implemented in a real app
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
    setSelectedBakery(null);
    setSelectedPastry(null);
    setPastryRatings({
      overall: 5,
      taste: 5,
      price: 5, 
      presentation: 5,
      comments: ''
    });
    setBakeryRatings({
      overall: 5,
      service: 5,
      price: 5,
      atmosphere: 5,
      location: 5,
      selection: 5,
      comments: ''
    });
    setExperienceRating(5);
    setError(null);
  }, []);
  
  // Submit pastry review - Updated to support anonymous reviews
  const submitPastryReview = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build review data - contactId is now optional
      const reviewData = {
        review: pastryRatings.comments || "Great pastry!",
        overallRating: parseInt(pastryRatings.overall),
        tasteRating: parseInt(pastryRatings.taste),
        priceRating: parseInt(pastryRatings.price),
        presentationRating: parseInt(pastryRatings.presentation),
        pastryId: selectedPastry.id
      };
      
      // Only include contactId if user is logged in
      if (currentUser && currentUser.id) {
        reviewData.contactId = currentUser.id;
      }
      
      // Submit to API
      const response = await reviewService.createPastryReview(reviewData);
      return response;
    } catch (error) {
      setError('Failed to submit pastry review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPastry, pastryRatings, currentUser]);
  
  // Submit bakery review - Updated to support anonymous reviews
  const submitBakeryReview = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Build review data - contactId is now optional
      const reviewData = {
        review: bakeryRatings.comments || "Great bakery!",
        overallRating: parseInt(bakeryRatings.overall),
        serviceRating: parseInt(bakeryRatings.service),
        priceRating: parseInt(bakeryRatings.price),
        atmosphereRating: parseInt(bakeryRatings.atmosphere),
        locationRating: parseInt(bakeryRatings.location),
        bakeryId: selectedBakery.id
      };
      
      // Only include contactId if user is logged in
      if (currentUser && currentUser.id) {
        reviewData.contactId = currentUser.id;
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
    selectedPastry,
    setSelectedPastry,
    pastryRatings,
    setPastryRatings,
    bakeryRatings,
    setBakeryRatings,
    experienceRating,
    setExperienceRating,
    isSubmitting,
    error,
    resetReview,
    submitPastryReview,
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
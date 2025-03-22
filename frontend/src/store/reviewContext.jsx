import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../services';

// Create context
const ReviewContext = createContext();

// Provider component
export const ReviewProvider = ({ children }) => {
  const navigate = useNavigate();
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
  
  // Navigation helper to move between steps
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
  
  // Submit pastry review
  const submitPastryReview = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.createPastryReview({
        bakeryId: selectedBakery.id,
        pastryId: selectedPastry.id === 'custom' ? null : selectedPastry.id,
        pastryName: selectedPastry.name === 'Other' ? selectedPastry.customName : selectedPastry.name,
        overallRating: pastryRatings.overall,
        tasteRating: pastryRatings.taste,
        priceRating: pastryRatings.price,
        presentationRating: pastryRatings.presentation,
        review: pastryRatings.comments
      });
      
      return response;
    } catch (error) {
      setError('Failed to submit pastry review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBakery, selectedPastry, pastryRatings]);
  
  // Submit bakery review
  const submitBakeryReview = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.createBakeryReview({
        bakeryId: selectedBakery.id,
        overallRating: bakeryRatings.overall,
        serviceRating: bakeryRatings.service,
        priceRating: bakeryRatings.price,
        atmosphereRating: bakeryRatings.atmosphere,
        locationRating: bakeryRatings.location,
        selectionRating: bakeryRatings.selection,
        review: bakeryRatings.comments
      });
      
      return response;
    } catch (error) {
      setError('Failed to submit bakery review: ' + error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBakery, bakeryRatings]);
  
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
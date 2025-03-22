import { createContext, useContext, useState } from 'react';

// Create context
const ReviewContext = createContext();

// Provider component
export const ReviewProvider = ({ children }) => {
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
  
  const [currentStep, setCurrentStep] = useState('start');
  const [experienceRating, setExperienceRating] = useState(5);
  
  // Reset all review data
  const resetReview = () => {
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
    setCurrentStep('start');
    setExperienceRating(5);
  };
  
  // Submit pastry review
  const submitPastryReview = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/pastry-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bakeryId: selectedBakery.id,
          pastryName: selectedPastry.name === 'Other' ? selectedPastry.customName : selectedPastry.name,
          overallRating: pastryRatings.overall,
          tasteRating: pastryRatings.taste,
          priceRating: pastryRatings.price,
          presentationRating: pastryRatings.presentation,
          comments: pastryRatings.comments
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit pastry review');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting pastry review:', error);
      throw error;
    }
  };
  
  // Submit bakery review
  const submitBakeryReview = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/bakery-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bakeryId: selectedBakery.id,
          overallRating: bakeryRatings.overall,
          serviceRating: bakeryRatings.service,
          priceRating: bakeryRatings.price,
          atmosphereRating: bakeryRatings.atmosphere,
          locationRating: bakeryRatings.location,
          selectionRating: bakeryRatings.selection,
          comments: bakeryRatings.comments
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit bakery review');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting bakery review:', error);
      throw error;
    }
  };
  
  // Submit experience rating
  const submitExperienceRating = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/experience-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: experienceRating
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit experience rating');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting experience rating:', error);
      throw error;
    }
  };
  
  // Handle navigation through the review process
  const goToNextStep = (step) => {
    setCurrentStep(step);
  };
  
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
    currentStep,
    setCurrentStep,
    experienceRating,
    setExperienceRating,
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
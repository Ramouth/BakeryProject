import { useState, useCallback, useMemo } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';

export const useBakeryRatingViewModel = () => {
  // Extract only what we need from context
  const { 
    selectedBakery, 
    bakeryRatings, 
    setBakeryRatings, 
    submitBakeryReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Optimize handleRatingChange to use a function updater pattern
  // This eliminates the dependency on bakeryRatings and reduces re-renders
  const handleRatingChange = useCallback((field, value) => {
    setBakeryRatings(prevRatings => ({
      ...prevRatings,
      [field]: value
    }));
  }, [setBakeryRatings]);
  
  // Similarly optimize the comments change handler
  const handleCommentsChange = useCallback((e) => {
    const newComment = e.target.value;
    setBakeryRatings(prevRatings => ({
      ...prevRatings,
      comments: newComment
    }));
  }, [setBakeryRatings]);
  
  // Memoize validation status
  const isOverallRatingValid = useMemo(() => 
    bakeryRatings && bakeryRatings.overall > 0, 
  [bakeryRatings?.overall]);
  
  // Optimize submit handler by reducing dependencies
  const handleSubmit = useCallback(async () => {
    if (!isOverallRatingValid) {
      showError("Please provide an overall rating");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitBakeryReview();
      showSuccess("Bakery review saved successfully!");
      goToNextStep('experienceRating');
    } catch (err) {
      const errorMessage = err.message || "Please try again";
      showError(`Failed to submit review: ${errorMessage}`);
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isOverallRatingValid,
    submitBakeryReview, 
    showSuccess, 
    showError, 
    goToNextStep
  ]);
  
  // Memoize the return object to prevent unnecessary re-renders of consumers
  return useMemo(() => ({
    selectedBakery,
    bakeryRatings,
    isSubmitting,
    isOverallRatingValid,
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  }), [
    selectedBakery,
    bakeryRatings,
    isSubmitting,
    isOverallRatingValid,
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  ]);
};
import { useState, useCallback } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';

export const useBakeryRatingViewModel = () => {
  const { 
    selectedBakery, 
    bakeryRatings, 
    setBakeryRatings, 
    submitBakeryReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingChange = useCallback((field, value) => {
    setBakeryRatings({
      ...bakeryRatings,
      [field]: value
    });
  }, [bakeryRatings, setBakeryRatings]);
  
  const handleCommentsChange = useCallback((e) => {
    setBakeryRatings({
      ...bakeryRatings,
      comments: e.target.value
    });
  }, [bakeryRatings, setBakeryRatings]);
  
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      if (bakeryRatings.overall <= 0) {
        showError("Please provide an overall rating");
        setIsSubmitting(false);
        return;
      }
      
      await submitBakeryReview();
      showSuccess("Bakery review saved successfully!");
      goToNextStep('experienceRating');
    } catch (err) {
      showError(`Failed to submit review: ${err.message || "Please try again"}`);
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [bakeryRatings.overall, submitBakeryReview, showSuccess, showError, goToNextStep]);
  
  return {
    selectedBakery,
    bakeryRatings,
    isSubmitting,
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  };
};
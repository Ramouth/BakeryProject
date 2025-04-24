import { useState, useCallback } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';

export const useProductRatingViewModel = () => {
  const { 
    selectedBakery, 
    selectedProduct, 
    productRatings, 
    setProductRatings, 
    submitProductReview,
    goToNextStep 
  } = useReview();
  
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingChange = useCallback((field, value) => {
    setProductRatings({
      ...productRatings,
      [field]: value
    });
  }, [productRatings, setProductRatings]);
  
  const handleCommentsChange = useCallback((e) => {
    setProductRatings({
      ...productRatings,
      comments: e.target.value
    });
  }, [productRatings, setProductRatings]);
  
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      if (productRatings.overall <= 0) {
        showError("Please provide an overall rating");
        setIsSubmitting(false);
        return;
      }
      
      await submitProductReview();
      showSuccess("Product review saved successfully!");
      goToNextStep('reviewOptions');
    } catch (err) {
      showError(`Failed to submit review: ${err.message || "Please try again"}`);
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [productRatings.overall, submitProductReview, showSuccess, showError, goToNextStep]);
  
  const getProductName = () => {
    return selectedProduct.name === 'Other' 
      ? selectedProduct.customName 
      : selectedProduct.name;
  };
  
  return {
    selectedBakery,
    productRatings,
    isSubmitting,
    productName: getProductName(),
    handleRatingChange,
    handleCommentsChange,
    handleSubmit,
    goToNextStep
  };
};
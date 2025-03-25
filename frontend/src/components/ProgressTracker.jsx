import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProgressBar from './ProgressBar';

// Define the steps for the progress bar
const reviewSteps = [
  { label: 'Start', path: '/' },
  { label: 'Bakery', path: '/bakery-selection' },
  { label: 'Pastry', path: '/pastry-selection' },
  { label: 'Rate Pastry', path: '/pastry-rating' },
  { label: 'Rate Bakery', path: '/bakery-rating' },
  { label: 'Done', path: '/thank-you' }
];

const ProgressTracker = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Update current step based on location
  useEffect(() => {
    const path = location.pathname;
    const stepIndex = reviewSteps.findIndex(step => step.path === path);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // If we're not on a review step (like admin or login), don't show progress
      setCurrentStep(0);
    }
  }, [location]);
  
  // Only show progress bar for review flow pages
  if (currentStep === 0) return null;
  
  return (
    <ProgressBar 
      currentStep={currentStep} 
      totalSteps={reviewSteps.length} 
      steps={reviewSteps}
    />
  );
};

export default ProgressTracker;
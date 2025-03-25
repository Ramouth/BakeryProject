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
  { label: 'Finish', path: '/thank-you' }
];

const ProgressTracker = () => {
  const location = useLocation();
  // Start with step 1 as default
  const [currentStep, setCurrentStep] = useState(1);
  
  // Update current step based on location
  useEffect(() => {
    const path = location.pathname;
    
    // Find which step corresponds to the current path
    const stepIndex = reviewSteps.findIndex(step => step.path === path);
    
    if (stepIndex !== -1) {
      // If we found a matching step, set it as current (add 1 because steps are 1-indexed)
      setCurrentStep(stepIndex + 1);
    } else {
      // For non-review paths like admin or login, set to 0 to hide the progress bar
      const isAdminOrLogin = path.includes('/admin') || path.includes('/login');
      if (isAdminOrLogin) {
        setCurrentStep(0);
      } else {
        // For any other paths, default to step 1
        setCurrentStep(1);
      }
    }
  }, [location.pathname]);
  
  // Don't render anything if we're on admin or login pages
  if (currentStep === 0) {
    return null;
  }
  
  // Otherwise, render the progress bar
  return (
    <ProgressBar 
      currentStep={currentStep}
      totalSteps={reviewSteps.length}
      steps={reviewSteps}
    />
  );
};

export default ProgressTracker;
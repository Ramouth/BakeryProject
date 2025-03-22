import { useEffect } from 'react';
import { useReview } from '../store/reviewContext';

const ThankYou = () => {
  const { resetReview, goToNextStep } = useReview();
  
  // Reset the review state after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      resetReview();
    }, 5000); // Reset after 5 seconds
    
    return () => clearTimeout(timer);
  }, [resetReview]);
  
  return (
    <div className="container">
      <div className="card">
        <h2>Thank You!</h2>
        <p>
          Thank you for taking the time to share your feedback. Your reviews 
          help us build a valuable resource for bakery lovers in Copenhagen 
          and Frederiksberg.
        </p>
        <p>
          We appreciate your contribution to our bakery community!
        </p>
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('start')}
          >
            Submit Another Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
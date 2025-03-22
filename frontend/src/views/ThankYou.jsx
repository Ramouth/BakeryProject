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
        <h2>Bakery Reviews</h2>
        <p>
          Your review is now saved.
        </p>
        <p>
          Please review another bakery or pastry!
        </p>
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('start')}
          >
            back
          </button>
          <button 
            className="btn"
            onClick={() => goToNextStep('bakerySelection')}
          >
            exit
          </button>
          <button 
            className="btn"
            onClick={() => goToNextStep('start')}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
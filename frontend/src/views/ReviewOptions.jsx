import { useReview } from '../store/reviewContext';

const ReviewOptions = () => {
  const { selectedBakery, goToNextStep } = useReview();
  
  return (
    <div className="container">
      <div className="card">
        <h2>Submit another pastry review</h2>
        <p>Thank you for your pastry review! What would you like to do next?</p>
        
        <div className="options-container">
          <button 
            className="btn"
            onClick={() => goToNextStep('pastrySelection')}
          >
            Review another pastry
          </button>
          
          <button 
            className="btn"
            onClick={() => goToNextStep('bakeryRating')}
          >
            Review the bakery ({selectedBakery.name})
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => goToNextStep('experienceRating')}
          >
            That is all
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewOptions;
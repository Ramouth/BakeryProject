import { useReview } from '../store/reviewContext';

const Start = () => {
  const { goToNextStep } = useReview();
  
  return (
    <div className="container">
      <div className="card">
        <h1>Bakery Reviews</h1>
        <p className="intro-text">
          Welcome to Bakery Reviews! This site is our project to curate the best 
          bakeries in Copenhagen and Frederiksberg.
        </p>
        <p>
          Right now, we're working on building a database of pastry and bakery reviews.
          Please consider giving us your thoughts on bakeries you've visited.
        </p>
        <p>
          You'll first be asked to select a bakery, then a pastry item, and provide
          ratings. You can then optionally review the bakery itself.
        </p>
        
        <div className="nav-buttons">
          <button 
            className="btn"
            onClick={() => goToNextStep('bakerySelection')}
          >
            Start Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Start;
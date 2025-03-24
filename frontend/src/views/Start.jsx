import { useReview } from '../store/ReviewContext';

const Start = () => {
  const { goToNextStep } = useReview();
  
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '35px' }}>Welcome to CrumbCompass</h1>
        <p className="intro-text" style={{ marginBottom: '35px' }}>
          This site is a student project from DTU 🎓, designed to help you discover the best bakeries in Copenhagen. Whether you're searching for the crispiest croissant 🥐 or the perfect sourdough 🍞, our platform makes it easy to find the right bakery for you!
        </p>
        <p>
          Right now, we're testing the site with friends and family, so your feedback is invaluable!💬✨ Give us a review ⭐ and let us know what you think! 🚀 
        </p>
        
        <div className="nav-buttons" style={{ justifyContent: 'center' }}>
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

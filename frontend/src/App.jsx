import { ReviewProvider, useReview } from './store/reviewContext';
import Start from './views/Start';
import BakerySelection from './views/BakerySelection';
import PastrySelection from './views/PastrySelection';
import PastryRating from './views/PastryRating';
import ReviewOptions from './views/ReviewOptions';
import BakeryRating from './views/BakeryRating';
import ExperienceRating from './views/ExperienceRating';
import ThankYou from './views/ThankYou';

// Import CSS
import './styles/global.css';

// Router component to handle the view transitions
const Router = () => {
  const { currentStep } = useReview();
  
  // Render the appropriate view based on current step
  switch (currentStep) {
    case 'start':
      return <Start />;
    case 'bakerySelection':
      return <BakerySelection />;
    case 'pastrySelection':
      return <PastrySelection />;
    case 'pastryRating':
      return <PastryRating />;
    case 'reviewOptions':
      return <ReviewOptions />;
    case 'bakeryRating':
      return <BakeryRating />;
    case 'experienceRating':
      return <ExperienceRating />;
    case 'thankYou':
      return <ThankYou />;
    default:
      return <Start />;
  }
};

// Main App component
function App() {
  return (
    <ReviewProvider>
      <div className="app">
        <header className="app-header">
          <h1>Bakery Reviews</h1>
          <p>Copenhagen + Frederiksberg</p>
        </header>
        <Router />
      </div>
    </ReviewProvider>
  );
}

export default App;
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './store/UserContext';
import { ReviewProvider } from './store/ReviewContext';
import NavBar from './components/NavBar';
import AuthGuard from './components/AuthGuard';
import ProgressBar from './components/ProgressBar';

// Lazy load views for code splitting and performance
const Start = lazy(() => import('./views/Start'));
const BakerySelection = lazy(() => import('./views/BakerySelection'));
const PastrySelection = lazy(() => import('./views/PastrySelection'));
const PastryRating = lazy(() => import('./views/PastryRating'));
const BakeryRating = lazy(() => import('./views/BakeryRating'));
const ThankYou = lazy(() => import('./views/ThankYou'));
const Admin = lazy(() => import('./views/Admin'));
const Login = lazy(() => import('./views/Login'));

// Import CSS
import './styles/main.css';

// Define the steps for the progress bar
const reviewSteps = [
  { label: 'Start', path: '/' },
  { label: 'Bakery', path: '/bakery-selection' },
  { label: 'Pastry', path: '/pastry-selection' },
  { label: 'Rate Pastry', path: '/pastry-rating' },
  { label: 'Rate Bakery', path: '/bakery-rating' },
  { label: 'Done', path: '/thank-you' }
];

// Loading component for Suspense fallback
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Progress tracker component
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

function App() {
  // Initialize theme on app load
  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Set light theme as default
      document.documentElement.setAttribute('data-theme', 'light');
      
      // Save preference
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <Router>
      <UserProvider>
        <ReviewProvider>
          <div className="app">
            <NavBar />
            <ProgressTracker />
            <main className="app-content">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Start />} />
                  <Route path="/bakery-selection" element={<BakerySelection />} />
                  <Route path="/pastry-selection" element={<PastrySelection />} />
                  <Route path="/pastry-rating" element={<PastryRating />} />
                  <Route path="/bakery-rating" element={<BakeryRating />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/admin/*" 
                    element={
                      <AuthGuard>
                        <Admin />
                      </AuthGuard>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>
          </div>
        </ReviewProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
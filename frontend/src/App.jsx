import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { UserProvider } from './store/UserContext';
import { ReviewProvider } from './store/ReviewContext';
import { NotificationProvider } from './store/NotificationContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AuthGuard from './components/AuthGuard';
import ProgressTracker from './components/ProgressTracker';
import BakeryProfile from './views/BakeryProfile';
import apiClient from './services/api';

// Lazy load views for code splitting and performance
const HomePage = lazy(() => import('./views/Homepage'));
const Start = lazy(() => import('./views/Start'));
const BakerySelection = lazy(() => import('./views/BakerySelection'));
const PastrySelection = lazy(() => import('./views/PastrySelection'));
const PastryRating = lazy(() => import('./views/PastryRating'));
const BakeryRating = lazy(() => import('./views/BakeryRating'));
const ThankYou = lazy(() => import('./views/ThankYou'));
const Admin = lazy(() => import('./views/Admin'));
const Login = lazy(() => import('./views/Login'));
const BakeryRankings = lazy(() => import('./views/BakeryRankings')); 
const ProductRankings = lazy(() => import('./views/ProductRankings'));
const ProductCategorySelection = lazy(() => import('./views/ProductCategorySelection'));
const UserProfile = lazy(() => import('./views/UserProfile'));

// Import CSS
import './styles/main.css';
import './styles/footer.css';
import './styles/homepage.css';
import './styles/header.css';
import './styles/product-category.css';
import './styles/profile.css';
import ProductProfile from './views/ProductProfile';

// Loading component for Suspense fallback
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Component to handle route changes and cache clearing
const RouteChangeHandler = () => {
  const navigate = useNavigate();
  
  // Custom navigation function that clears relevant cache
  const navigateWithCacheClear = (path) => {
    apiClient.clearCacheForCurrentRoute();
    navigate(path);
  };
  
  // Set up cache clearing on navigation
  useEffect(() => {
    apiClient.clearCacheOnNavigation();
  }, []);
  
  return null;
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
          <NotificationProvider>
            <div className="app">
              <NavBar />
              <RouteChangeHandler />
              
              <div className="content-section">
                <main className="app-content">
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/" element={<HomePage key="homepage-component" />} />
                      <Route path="/start" element={<Start />} />
                      <Route path="/bakery-selection" element={<BakerySelection />} />
                      <Route path="/pastry-selection" element={<PastrySelection />} />
                      <Route path="/pastry-rating" element={<PastryRating />} />
                      <Route path="/bakery-rating" element={<BakeryRating />} />
                      <Route path="/thank-you" element={<ThankYou />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/bakery-rankings" element={<BakeryRankings />} />
                      <Route path="/product-categories" element={<ProductCategorySelection />} />
                      <Route path="/product-rankings" element={<ProductRankings />} />
                      <Route path="/product-rankings/:categoryId" element={<ProductRankings />} />
                      <Route path="/product-rankings/:categoryId/:productId" element={<ProductRankings />} />
                      <Route path="/bakery/:bakeryId" element={<BakeryProfile />} />
                      <Route path="/product/:productId" element={<ProductProfile />} />
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
              
              <Footer />
            </div>
          </NotificationProvider>
        </ReviewProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
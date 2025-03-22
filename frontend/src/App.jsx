import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './store/UserContext';
import { ReviewProvider } from './store/reviewContext';
import NavBar from './components/NavBar';

// Lazy load views for code splitting and performance
const Start = lazy(() => import('./views/Start'));
const BakerySelection = lazy(() => import('./views/BakerySelection'));
const PastrySelection = lazy(() => import('./views/PastrySelection'));
const PastryRating = lazy(() => import('./views/PastryRating'));
const BakeryRating = lazy(() => import('./views/BakeryRating'));
const ThankYou = lazy(() => import('./views/ThankYou'));
const Admin = lazy(() => import('./views/Admin'));

// Import CSS
import './styles/global.css';

// Loading component for Suspense fallback
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <Router>
      <UserProvider>
        <ReviewProvider>
          <div className="app">
            <NavBar />
            <main className="app-content">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Start />} />
                  <Route path="/bakery-selection" element={<BakerySelection />} />
                  <Route path="/pastry-selection" element={<PastrySelection />} />
                  <Route path="/pastry-rating" element={<PastryRating />} />
                  <Route path="/bakery-rating" element={<BakeryRating />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/admin/*" element={<Admin />} />
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
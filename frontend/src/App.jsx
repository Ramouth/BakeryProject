import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './store/UserContext';
import { ReviewProvider } from './store/ReviewContext';
import { NotificationProvider } from './store/NotificationContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AuthGuard from './components/AuthGuard';
import BakeryProfile from './views/BakeryProfile';
import ProductProfile from './views/ProductProfile';
import Admin from './views/AdminDashboard';
import BookTab from './components/BookTab';

// Lazy load views for code splitting and performance
const HomePage = lazy(() => import('./views/Homepage'));
const ProductRating = lazy(() => import('./views/ProductRating'));
const BakeryRating = lazy(() => import('./views/BakeryRating'));
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
const Login = lazy(() => import('./views/Login'));
const SignUp = lazy(() => import('./views/SignUp'));
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

// Loading component for Suspense fallback
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
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
              <BookTab />

              <div className="content-section">
                <main className="app-content">
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product-rating" element={<ProductRating />} />
                      <Route path="/bakery-rating" element={<BakeryRating />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/bakery-rankings" element={<BakeryRankings />} />
                      <Route path="/product-categories" element={<ProductCategorySelection />} />
                      <Route path="/product-rankings" element={<ProductRankings />} />
                      <Route path="/product-rankings/:categoryId" element={<ProductRankings />} />
                      <Route path="/product-rankings/:categoryId/:productId" element={<ProductRankings />} />
                      <Route path="/bakery/:bakeryName" element={<BakeryProfile />} />
                      <Route path="/product/:productId" element={<ProductProfile />} />
                      <Route path="/admin-dashboard/*" element={<AuthGuard><Admin /></AuthGuard>} />
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

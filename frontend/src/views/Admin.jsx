import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import BakerySection from './admin/BakerySection';
import ProductSection from './admin/ProductSection';
import UserSection from './admin/UserSection';
import BakeryReviewSection from './admin/BakeryReviewSection';
import ProductReviewSection from './admin/ProductReviewSection';
import Button from '../components/Button';

// Admin dashboard home page
const AdminHome = () => (
  <div className="admin-home">
    <h2>Welcome to the Admin Dashboard</h2>
    <p>Select a section from the sidebar to manage your bakery data.</p>
    
    <div className="admin-stats">
      <div className="stat-card">
        <h3>25</h3>
        <p>Bakeries</p>
      </div>
      <div className="stat-card">
        <h3>84</h3>
        <p>Products</p>
      </div>
      <div className="stat-card">
        <h3>132</h3>
        <p>Reviews</p>
      </div>
      <div className="stat-card">
        <h3>56</h3>
        <p>Users</p>
      </div>
    </div>

    <div className="admin-recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-time">Today, 14:23</span>
          <span className="activity-text">New review for "Lagkagehuset"</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">Today, 10:45</span>
          <span className="activity-text">New bakery added: "Bageriet"</span>
        </div>
        <div className="activity-item">
          <span className="activity-time">Yesterday, 16:30</span>
          <span className="activity-text">New product: "Kanelsnegl" for Andersen Bakery</span>
        </div>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(!currentUser?.isAdmin);
  
  useEffect(() => {
    // Update warning state if user changes
    setShowWarning(!currentUser?.isAdmin);
  }, [currentUser]);
  
  const createMockAdminUser = () => {
    // Create mock admin user and refresh
    localStorage.setItem('currentUser', JSON.stringify({
      id: 'admin1',
      username: 'admin',
      email: 'admin@crumbcompass.com',
      isAdmin: true
    }));
    window.location.reload();
  };
  
  // Allow using admin panel even without proper admin status for this demo
  const proceedAnyway = () => {
    setShowWarning(false);
  };
  
  if (showWarning) {
    return (
      <div className="container">
        <div className="card">
          <h2>Mock Admin Access</h2>
          <p>This is a demo environment. You can proceed to the admin panel even without proper admin privileges.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <Button onClick={createMockAdminUser} variant="primary">
              Create Mock Admin User
            </Button>
            <Button onClick={proceedAnyway} variant="secondary">
              Proceed Anyway
            </Button>
            <Button onClick={() => navigate('/')} variant="link">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="logo-container">
          <div className="brand-name">CrumbCompass Admin</div>
          <div className="brand-subtitle">Bakery Management System</div>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <span>{currentUser?.username || 'Admin User'}</span>
          </div>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => navigate('/')}
          >
            Visit Site
          </Button>
          <Button 
            variant="link" 
            size="small"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
      
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav>
            <ul>
              <li>
                <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/bakeries" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bakeries
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
                  Products
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/bakery-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bakery Reviews
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/product-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Product Reviews
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/bakeries" element={<BakerySection />} />
            <Route path="/products" element={<ProductSection />} />
            <Route path="/users" element={<UserSection />} />
            <Route path="/bakery-reviews" element={<BakeryReviewSection />} />
            <Route path="/product-reviews" element={<ProductReviewSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
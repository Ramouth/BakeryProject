import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import BakerySection from './admin/BakerySection';
import PastrySection from './admin/PastrySection';
import UserSection from './admin/ContactSection';
import BakeryReviewSection from './admin/BakeryReviewSection';
import PastryReviewSection from './admin/PastryReviewSection';
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
        <p>Pastries</p>
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
          <span className="activity-text">New pastry: "Kanelsnegl" for Andersen Bakery</span>
        </div>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  
  // Redirect if not admin
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin panel.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-actions">
          <div className="user-info">
            <span>Admin User</span>
          </div>
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
                <NavLink to="/admin/pastries" className={({ isActive }) => isActive ? 'active' : ''}>
                  Pastries
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/contacts" className={({ isActive }) => isActive ? 'active' : ''}>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/bakery-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bakery Reviews
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/pastry-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Pastry Reviews
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/bakeries" element={<BakerySection />} />
            <Route path="/pastries" element={<PastrySection />} />
            <Route path="/contacts" element={<UserSection />} />
            <Route path="/bakery-reviews" element={<BakeryReviewSection />} />
            <Route path="/pastry-reviews" element={<PastryReviewSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
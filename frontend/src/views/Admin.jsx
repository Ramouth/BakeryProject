import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import BakerySection from '../views/BakerySection';
import PastrySection from '../views/PastrySection';
import ContactSection from '../views/admin/ContactSection';
import BakeryReviewSection from '../views/admin/BakeryReviewSection';
import PastryReviewSection from '../views/admin/PastryReviewSection';
import Button from '../components/Button';

// Admin dashboard home page
const AdminHome = () => (
  <div className="admin-home">
    <h2>Welcome to the Admin Dashboard</h2>
    <p>Select a section from the sidebar to manage your bakery data.</p>
  </div>
);

const Admin = () => {
  const { currentUser } = useUser();
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
      <h1>Admin Dashboard</h1>
      
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav>
            <ul>
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
                  Contacts
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
            <Route path="/contacts" element={<ContactSection />} />
            <Route path="/bakery-reviews" element={<BakeryReviewSection />} />
            <Route path="/pastry-reviews" element={<PastryReviewSection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
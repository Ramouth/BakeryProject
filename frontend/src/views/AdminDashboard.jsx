import { Routes, Route, NavLink } from 'react-router-dom';
import { useAdminDashboardViewModel } from '../viewmodels/useAdminDashboardViewModel';
import AdminBakeryView from './admin/AdminBakeryView';
import AdminProductView from './admin/AdminProductView';
import AdminUserView from './admin/AdminUserView';
import AdminBakeryReviewView from './admin/AdminBakeryReviewView';
import AdminProductReviewView from './admin/AdminProductReviewView';
import AdminCategoriesManager from '../components/admin/AdminCategoriesManager';
import Button from '../components/Button';


const AdminHome = ({ stats, recentActivity, loading, formatDate }) => {
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-home">
      <h2>Welcome to the Admin Dashboard</h2>
      <p>Select a section from the sidebar to manage your bakery data.</p>
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>{stats.bakeries}</h3>
          <p>Bakeries</p>
        </div>
        <div className="stat-card">
          <h3>{stats.products}</h3>
          <p>Products</p>
        </div>
        <div className="stat-card">
          <h3>{stats.reviews}</h3>
          <p>Reviews</p>
        </div>
        <div className="stat-card">
          <h3>{stats.users}</h3>
          <p>Users</p>
        </div>
      </div>

      <div className="admin-recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-time">{formatDate(activity.time)}</span>
              <span className="activity-text">{activity.text}</span>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="activity-item">
              <span className="activity-text">No recent activity</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const {
    currentUser,
    logout,
    navigate,
    showWarning,
    loading,
    stats,
    recentActivity,
    createMockAdminUser,
    proceedAnyway,
    formatDate
  } = useAdminDashboardViewModel();
  
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
                <NavLink to="/admin-dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/bakeries" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bakeries
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/products" className={({ isActive }) => isActive ? 'active' : ''}>
                  Products
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/users" className={({ isActive }) => isActive ? 'active' : ''}>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/bakery-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Bakery Reviews
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/product-reviews" className={({ isActive }) => isActive ? 'active' : ''}>
                  Product Reviews
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin-dashboard/product-categories" className={({ isActive }) => isActive ? 'active' : ''}>
                  Product Categories
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="admin-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <AdminHome 
                  stats={stats} 
                  recentActivity={recentActivity} 
                  loading={loading} 
                  formatDate={formatDate} 
                />
              } 
            />
            <Route path="bakeries" element={<AdminBakeryView />} />
            <Route path="products" element={<AdminProductView />} />
            <Route path="users" element={<AdminUserView />} />
            <Route path="bakery-reviews" element={<AdminBakeryReviewView />} />
            <Route path="product-reviews" element={<AdminProductReviewView />} />
            <Route path="product-categories" element={<AdminCategoriesManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
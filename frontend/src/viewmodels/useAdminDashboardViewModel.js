import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import apiClient from '../services/api';

export const useAdminDashboardViewModel = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(!currentUser?.isAdmin);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bakeries: 0,
    products: 0,
    reviews: 0,
    users: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    setShowWarning(!currentUser?.isAdmin);
  }, [currentUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (showWarning) return;
      
      try {
        const [bakeries, products, bakeryReviews, productReviews, users] = await Promise.all([
          apiClient.get('/bakeries', true),
          apiClient.get('/products', true),
          apiClient.get('/bakeryreviews', true),
          apiClient.get('/productreviews', true),
          apiClient.get('/users', true)
        ]);

        setStats({
          bakeries: bakeries.bakeries?.length || 0,
          products: products.products?.length || 0,
          reviews: (bakeryReviews.bakeryReviews?.length || 0) + (productReviews.productReviews?.length || 0),
          users: users.users?.length || 0
        });

        const recent = [
          ...(bakeryReviews.bakeryReviews || []).slice(0, 3).map(r => ({
            type: 'bakery_review',
            time: r.created_at,
            text: `New review for "${r.bakery_name || 'Unknown Bakery'}"`
          })),
          ...(productReviews.productReviews || []).slice(0, 3).map(r => ({
            type: 'product_review',
            time: r.created_at,
            text: `New review for "${r.product_name || 'Unknown Product'}"`
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        setRecentActivity(recent);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showWarning]);

  const createMockAdminUser = () => {
    localStorage.setItem('currentUser', JSON.stringify({
      id: 'admin1',
      username: 'admin',
      email: 'admin@crumbcompass.com',
      isAdmin: true
    }));
    window.location.reload();
  };

  const proceedAnyway = () => {
    setShowWarning(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return {
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
  };
};
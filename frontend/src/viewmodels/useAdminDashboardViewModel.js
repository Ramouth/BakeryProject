import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/UserContext';
import apiClient from '../services/api';

export const useAdminDashboardViewModel = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();

  // Track whether non-admin override has been acknowledged
  const [override, setOverride] = useState(false);
  const showWarning = useMemo(
    () => !currentUser?.isAdmin && !override,
    [currentUser, override]
  );

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ bakeries: 0, products: 0, reviews: 0, users: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data when admin access is granted
  useEffect(() => {
    if (showWarning) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoints = [
          { key: 'bakeries', path: '/bakeries' },
          { key: 'products', path: '/products' },
          { key: 'bakeryReviews', path: '/bakeryreviews' },
          { key: 'productReviews', path: '/productreviews' },
          { key: 'users', path: '/users' }
        ];

        const responses = await Promise.all(
          endpoints.map(({ path }) => apiClient.get(path, true))
        );

        if (cancelled) return;

        const [bakeries, products, bakeryReviews, productReviews, users] = responses;

        const bakeryMap = new Map(bakeries.bakeries?.map(b => [b.id, b.name]));
        const productMap = new Map(products.products?.map(p => [p.id, p.name]));

        setStats({
          bakeries: bakeries.bakeries?.length || 0,
          products: products.products?.length || 0,
          reviews: (bakeryReviews.bakeryReviews?.length || 0) + (productReviews.productReviews?.length || 0),
          users: users.users?.length || 0
        });

        const extractReviews = (list = [], type, map, idKey) =>
          list.slice(0, 3).map(r => ({
            type,
            time: r.created_at,
            text: `New review for \"${map.get(r[idKey]) || 'Unknown'}\"`
          }));

        const recent = [
          ...extractReviews(bakeryReviews.bakeryReviews, 'bakery_review', bakeryMap, 'bakeryId'),
          ...extractReviews(productReviews.productReviews, 'product_review', productMap, 'productId')
        ]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 5);

        setRecentActivity(recent);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [showWarning]);

  const proceedAnyway = () => setOverride(true);

  const createMockAdminUser = () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: 'admin1', username: 'admin', email: 'admin@crumbcompass.com', isAdmin: true })
    );
    window.location.reload();
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

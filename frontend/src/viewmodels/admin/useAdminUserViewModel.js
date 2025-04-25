import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/api';
import { useNotification } from '../../store/NotificationContext';

export const useAdminUserViewModel = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/users', true);
      setUsers(response.users || []);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      showError('Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreateModal = useCallback(() => {
    setCurrentUser(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentUser(null);
  }, []);

  const handleSaveUser = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      if (currentUser?.id) {
        // Update
        await apiClient.patch(`/users/update/${currentUser.id}`, userData, false);
        showSuccess('User updated successfully!');
      } else {
        // Create
        await apiClient.post('/users/create', userData, false);
        showSuccess('User created successfully!');
      }
      
      handleCloseModal();
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user.');
      showError(`Failed to save user: ${err.message}`);
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, handleCloseModal, fetchUsers, showSuccess, showError]);

  const handleDeleteUser = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/users/delete/${id}`, false);
      showSuccess('User deleted successfully!');
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
      showError(`Failed to delete user: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, showSuccess, showError]);

  return {
    users,
    isModalOpen,
    currentUser,
    isLoading,
    error,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveUser,
    handleDeleteUser
  };
};
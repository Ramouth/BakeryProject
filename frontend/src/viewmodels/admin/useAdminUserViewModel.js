import { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../../services/api';
import { useNotification } from '../../store/NotificationContext';

export const useAdminUserViewModel = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return users.filter(user => 
      user.username && user.username.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [users, searchTerm]);

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
        await apiClient.patch(`/users/update/${currentUser.id}`, userData);
        showSuccess('User updated successfully!');
      } else {
        // Create
        await apiClient.post('/users/create', userData);
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
    // No need for another confirmation here since we already confirmed in the list component
    setIsLoading(true);
    try {
      // Ensure id is properly defined before making the API call
      if (!id) {
        throw new Error('User ID is required for deletion');
      }
      
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
    searchTerm,
    setSearchTerm,
    filteredUsers,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveUser,
    handleDeleteUser
  };
};
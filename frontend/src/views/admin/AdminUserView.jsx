// src/views/admin/UserSection.jsx
import { useState, useEffect, useCallback } from "react";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import UserList from "../../components/admin/AdminUserList";
import UserForm from "../../components/admin/AdminUserModal";
import { userService } from "../../services";

const UserSection = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/users");
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Users API response:", data);
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const openCreateModal = () => {
    setCurrentUser({});
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Callback after form submission
  const handleFormSubmitComplete = async () => {
    closeModal();
    await fetchUsers();
  };

  return (
    <div className="section user-section">
      <div className="section-header">
        <h2>Manage Users</h2>
        <Button onClick={openCreateModal} disabled={isLoading}>Create New User</Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !users.length ? (
        <div className="loading">Loading users...</div>
      ) : (
        <UserList 
          users={users || []} 
          updateUser={openEditModal} 
          updateCallback={fetchUsers} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={currentUser.id ? "Edit User" : "Create User"}
      >
        <UserForm 
          existingUser={currentUser} 
          updateCallback={handleFormSubmitComplete} 
        />
      </Modal>
    </div>
  );
};

export default UserSection;
import { useAdminUserViewModel } from '../../viewmodels/useAdminUserViewModel';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import UserList from '../../components/admin/AdminUserList';
import UserForm from '../../components/admin/AdminUserModal';

const AdminUserView = () => {
  const {
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
  } = useAdminUserViewModel();

  return (
    <div className="section user-section">
      <div className="section-header">
        <h2>Manage Users</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Create New User
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !users.length ? (
        <div className="loading">Loading users...</div>
      ) : (
        <UserList 
          users={users} 
          updateUser={handleOpenEditModal} 
          updateCallback={handleDeleteUser} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentUser ? "Edit User" : "Create User"}
      >
        <UserForm 
          existingUser={currentUser} 
          updateCallback={handleSaveUser} 
        />
      </Modal>
    </div>
  );
};

export default AdminUserView;
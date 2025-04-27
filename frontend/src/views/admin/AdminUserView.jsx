import { useAdminUserViewModel } from '../../viewmodels/admin/useAdminUserViewModel';
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
    searchTerm,
    setSearchTerm,
    filteredUsers,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveUser,
    handleDeleteUser
  } = useAdminUserViewModel();

  return (
    <div className="section user-section">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2>Manage Users</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Create New User
        </Button>
      </div>

      {/* Search Input */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--accent-300)',
            borderRadius: 'var(--border-radius)',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !users.length ? (
        <div className="loading">Loading users...</div>
      ) : (
        <UserList 
          users={filteredUsers} 
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
import { useState, useEffect } from "react";
import BakeryReviewList from "../../components/admin/UserList";
import BakeryReviewForm from "../../components/admin/UserForm";

const UserSection = ({ updateCallback }) => {
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await fetch("http://127.0.0.1:5000/users");
    const data = await response.json();
    setUsers(data.users);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setCurrentUser({});
  };

  const openCreateUserModal = () => {
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user) => {
    setCurrentUser(user);
    setIsUserModalOpen(true);
  };

  const onUserUpdate = () => {
    closeUserModal();
    fetchUsers();
  };

  return (
    <div>
      <UserList users={users} updateUser={openEditUserModal} updateCallback={onUserUpdate} />
      <button onClick={openCreateUserModal}>Create New User</button>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeUserModal}>
              &times;
            </span>
            <UserForm existingUser={currentUser} updateCallback={onUserUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSection;

import { memo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const UserList = ({ users, updateUser, updateCallback }) => {
  // Ensure users is always an array to prevent mapping errors
  const safeUsers = Array.isArray(users) ? users : [];

  const onDelete = async (id) => {
    if (!id) {
      console.error("Missing user ID for deletion");
      return;
    }
  
    // Use only one confirmation dialog
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Call the updateCallback directly with the ID
        if (typeof updateCallback === 'function') {
          updateCallback(id);  // Pass the ID directly to the callback
        }
      } catch (error) {
        console.error("Error during user deletion:", error);
      }
    }
  };

  if (!safeUsers.length) {
    return <p className="no-data">No users found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.isAdmin ? "Yes" : "No"}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <div className="table-actions">
                  <button 
                    className="action-button edit"
                    onClick={() => updateUser(user)}
                    aria-label={`Edit ${user.username}`}
                  >
                    Edit
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => onDelete(user.id)}
                    aria-label={`Delete ${user.username}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      isAdmin: PropTypes.bool,
      created_at: PropTypes.string
    })
  ).isRequired,
  updateUser: PropTypes.func.isRequired,
  updateCallback: PropTypes.func.isRequired
};

// Use memo to prevent unnecessary re-renders
export default memo(UserList);
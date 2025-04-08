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

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const options = {
          method: "DELETE"
        };
        
        const response = await fetch(`http://127.0.0.1:5000/users/delete/${id}`, options);
        
        if (response.status === 200) {
          if (typeof updateCallback === 'function') {
            updateCallback();
          }
        } else {
          console.error("Failed to delete user:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (!safeUsers.length) {
    return <p className="no-data">No users found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table user-table">
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
              <td className="actions">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => updateUser(user)}
                  aria-label={`Edit ${user.username}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => onDelete(user.id)}
                  aria-label={`Delete ${user.username}`}
                >
                  Delete
                </Button>
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
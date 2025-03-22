import { createContext, useContext, useState, useEffect } from 'react';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  // State for the current user
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // On mount, check for user in local storage or get from API
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserFromStorage();
  }, []);
  
  // Set user and save to storage
  const setUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  };
  
  // Log out user
  const logout = () => {
    setUser(null);
  };
  
  // Exposed context value
  const value = {
    currentUser,
    isLoading,
    setUser,
    logout,
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
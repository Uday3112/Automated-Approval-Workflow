import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load available users and active session on mount
  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await api.getUsers();
        if (res.success && res.users) {
          setAvailableUsers(res.users);
          const savedUserId = localStorage.getItem('approval_app_user_id');
          const found = res.users.find(u => u.id === savedUserId);
          setCurrentUser(found || res.users[0]);
          if (!savedUserId && res.users[0]) {
            localStorage.setItem('approval_app_user_id', res.users[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to initialize user session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, []);

  const switchUser = (userOrId) => {
    const user = typeof userOrId === 'string' 
      ? availableUsers.find(u => u.id === userOrId) 
      : userOrId;

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('approval_app_user_id', user.id);
    }
  };

  const login = async (email, password, userId) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password, userId });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('approval_app_user_id', res.user.id);
        return res.user;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('approval_app_user_id');
    if (availableUsers.length > 0) {
      setCurrentUser(availableUsers[0]);
      localStorage.setItem('approval_app_user_id', availableUsers[0].id);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      availableUsers,
      switchUser,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

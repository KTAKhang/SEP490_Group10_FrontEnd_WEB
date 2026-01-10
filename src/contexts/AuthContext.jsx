import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        console.log('🔄 Auth initialized from localStorage');
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (authToken) {
      localStorage.setItem('token', authToken);
      console.log('🔑 Token stored:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
    }
    console.log('✅ User logged in:', userData?.user_name || userData?.email);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    console.log('👋 User logged out');
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
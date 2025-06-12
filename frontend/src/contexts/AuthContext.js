import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing token on app load
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('campus_copilot_token');
      const userData = localStorage.getItem('campus_copilot_user');
      
      if (token && userData) {
        // Verify token is still valid
        const response = await authAPI.verifyToken();
        if (response.data.success) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('campus_copilot_token');
          localStorage.removeItem('campus_copilot_user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('campus_copilot_token');
      localStorage.removeItem('campus_copilot_user');
    } finally {
      setLoading(false);
    }
  };
  const login = async (regNo, password) => {
    try {
      console.log('Attempting login with:', { regNo, apiUrl: process.env.REACT_APP_API_URL });
      const response = await authAPI.login(regNo, password);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('campus_copilot_token', token);
        localStorage.setItem('campus_copilot_user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('campus_copilot_token', token);
        localStorage.setItem('campus_copilot_user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_copilot_token');
    localStorage.removeItem('campus_copilot_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('campus_copilot_user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

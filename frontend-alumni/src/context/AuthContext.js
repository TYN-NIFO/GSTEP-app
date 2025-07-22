import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token with backend
      axios.get('http://localhost:5000/api/auth/me')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        })
        .catch(error => {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email, password: '***' }); // Debug log
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error details:', error.response?.data); // More detailed error logging
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering alumni with data:', userData);
      
      // Make sure all required fields are present
      if (!userData.name || !userData.email || !userData.password) {
        return {
          success: false,
          message: 'Name, email and password are required'
        };
      }
      
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Alumni registration response:', response.data);

      if (response.data.success) {
        // Don't auto-login after registration
        // Just return success without setting token/user
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Alumni registration error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};





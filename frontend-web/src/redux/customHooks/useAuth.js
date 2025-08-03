import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { login, logout, getCurrentUser, register, clearError } from '../features/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for existing token and get user data on mount
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleLogin = async (email, password) => {
    try {
      await dispatch(login({ email, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const handleRegister = async (userData) => {
    try {
      await dispatch(register(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    clearError: clearAuthError,
  };
}; 
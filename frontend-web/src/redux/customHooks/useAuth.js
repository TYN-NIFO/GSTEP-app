import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { login, logout, getCurrentUser, register, resendVerification, clearError } from '../features/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for existing token and get user data on mount
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await dispatch(register(userData)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleResendVerification = async (email) => {
    try {
      await dispatch(resendVerification(email)).unwrap();
    } catch (error) {
      throw error;
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
    resendVerification: handleResendVerification,
    clearError: clearAuthError,
  };
}; 
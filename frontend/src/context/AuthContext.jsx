import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api/authApi';

const AuthContext = createContext(null);

function readStoredUser() {
  const savedUser = localStorage.getItem('user');
  return savedUser ? JSON.parse(savedUser) : null;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken && nextUser) {
      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      persistSession(data.token, data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      persistSession(null, null);
      const errMsg = err.message || "Invalid email or password.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.register(userData);
      persistSession(data.token, data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      const errMsg = err.message || "Registration failed. Please try again.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    persistSession(null, null);
  };

  const isAuthenticated = Boolean(token && user?.id);
  const isAdmin = Boolean(isAuthenticated && user?.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        login,
        register,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

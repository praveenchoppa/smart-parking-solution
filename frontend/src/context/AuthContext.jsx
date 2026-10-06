import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/authApi';
import { apiClient } from '../services/api/apiClient';

const AuthContext = createContext(null);

function readStoredUser() {
  const savedUser = localStorage.getItem('user');
  if (!savedUser) {
    return null;
  }
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
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

  useEffect(() => {
    const validateStoredSession = async () => {
      const storedUser = readStoredUser();
      const storedToken = localStorage.getItem('token');
      if (!storedToken || !storedUser?.id) {
        persistSession(null, null);
        setInitializing(false);
        return;
      }

      try {
        const response = await apiClient.get(`/api/users/${storedUser.id}`);
        persistSession(storedToken, response.data);
      } catch {
        persistSession(null, null);
      } finally {
        setInitializing(false);
      }
    };

    validateStoredSession();
  }, []);

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
      const errMsg = err.message || 'Invalid email or password.';
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
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    persistSession(null, null);
  };

  const isAuthenticated = Boolean(token && user?.id);
  const isAdmin = Boolean(isAuthenticated && user?.role === 'ADMIN');

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-sm text-slate-500">
        Restoring session...
      </div>
    );
  }

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

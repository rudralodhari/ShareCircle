import { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount to check token

  // On mount, check if token exists and load user
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('sc-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        setUser(res.data.user);
      } catch {
        // Token invalid or expired
        localStorage.removeItem('sc-token');
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login with real API
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const { token, user: userData } = res.data;

      // Store token
      localStorage.setItem('sc-token', token);
      setUser(userData);
      setLoading(false);
      return { data: { user: userData } };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  // Register with real API
  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      const { token, user: userData } = res.data;

      // Store token
      localStorage.setItem('sc-token', token);
      setUser(userData);
      setLoading(false);
      return { data: { user: userData } };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sc-token');
    setUser(null);
  }, []);

  // Allow updating the local user (for profile edit)
  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

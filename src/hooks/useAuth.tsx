import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AdminUser } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; admin: AdminUser; token: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.authenticated && res.admin) {
        setAdmin(res.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.token) {
      localStorage.setItem('fot_admin_token', res.token);
    }
    setAdmin(res.admin);
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('fot_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

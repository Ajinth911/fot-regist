import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AttendeeUser, Attendee, Registration } from '../types';
import { api } from '../lib/api';

interface UserAuthContextType {
  user: AttendeeUser | null;
  tickets: Attendee[];
  registrations: Registration[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AttendeeUser | null>(null);
  const [tickets, setTickets] = useState<Attendee[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await api.getUserMe();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setTickets(data.tickets || []);
        setRegistrations(data.registrations || []);
      } else {
        setUser(null);
        setTickets([]);
        setRegistrations([]);
        localStorage.removeItem('fot_user_token');
      }
    } catch {
      setUser(null);
      setTickets([]);
      setRegistrations([]);
      localStorage.removeItem('fot_user_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.userLogin(credentials);
    if (res.token) {
      localStorage.setItem('fot_user_token', res.token);
    }
    setUser(res.user);
    await fetchCurrentUser();
  };

  const signup = async (payload: { name: string; email: string; phone?: string; password: string }) => {
    const res = await api.userSignUp(payload);
    if (res.token) {
      localStorage.setItem('fot_user_token', res.token);
    }
    setUser(res.user);
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await api.userLogout();
    } finally {
      localStorage.removeItem('fot_user_token');
      setUser(null);
      setTickets([]);
      setRegistrations([]);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        tickets,
        registrations,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export function useUserAuth(): UserAuthContextType {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickLoginAsRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('foodbridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (token) {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      localStorage.removeItem('foodbridge_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('foodbridge_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('foodbridge_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginAsRole = async (role: UserRole) => {
    const roleAccounts: Record<UserRole, { email: string; pass: string }> = {
      donor: { email: 'hotel@grandplaza.com', pass: 'Password123!' },
      ngo: { email: 'contact@hopehaven.org', pass: 'Password123!' },
      volunteer: { email: 'alex@volunteer.org', pass: 'Password123!' },
      admin: { email: 'sivaraj82006@gmail.com', pass: 'Password123!' },
    };
    const creds = roleAccounts[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLoginAsRole,
        refreshUser,
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


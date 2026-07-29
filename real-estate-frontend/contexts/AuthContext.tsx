'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('re_token');
    const storedUser = localStorage.getItem('re_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token: t, user: u } = data.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('re_token', t);
    localStorage.setItem('re_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    const { token: t, user: u } = data.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('re_token', t);
    localStorage.setItem('re_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('re_token');
    localStorage.removeItem('re_user');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('re_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

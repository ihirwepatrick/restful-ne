'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setTokens, clearTokens, getTokens } from '@/lib/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'INSPECTOR' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestRegistrationOtp: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'USER' | 'INSPECTOR';
  }) => Promise<void>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<void>;
  resendRegistrationOtp: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { accessToken } = getTokens();
    if (!accessToken) { setUser(null); setLoading(false); return; }
    try {
      const me = await api<User>('/api/auth/me');
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    localStorage.setItem('user', JSON.stringify(res.user));
  };

  const requestRegistrationOtp = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'USER' | 'INSPECTOR';
  }) => {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    localStorage.setItem('user', JSON.stringify(res.user));
  };

  const resendRegistrationOtp = async (email: string) => {
    await api('/api/auth/register/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, requestRegistrationOtp, verifyRegistrationOtp, resendRegistrationOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

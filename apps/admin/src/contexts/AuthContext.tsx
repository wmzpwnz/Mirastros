'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  const refreshUser = async () => {
    try {
      const userData = await adminApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
      adminApi.clearToken();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await adminApi.login(email, password);
    setUser(response.user);
  };

  const logout = async () => {
    await adminApi.logout();
    setUser(null);
    router.push('/auth/login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('accessToken') || localStorage.getItem('token')
          : null;

        if (token) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        adminApi.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/auth/login') {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, pathname, router]);

  // Redirect to dashboard if authenticated and on login page
  useEffect(() => {
    if (!loading && isAuthenticated && pathname === '/auth/login') {
      router.push('/');
    }
  }, [loading, isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

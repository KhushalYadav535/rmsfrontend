'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '../lib/api';
import { joinOutletRoom } from '../lib/socket';

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  gstin?: string;
  fssaiNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  currencySymbol: string;
  outlets: Outlet[];
}

interface AuthContextType {
  user: User | null;
  currentOutlet: Outlet | null;
  setCurrentOutlet: (outlet: Outlet) => void;
  isLoading: boolean;
  login: (credentials: { email?: string; password?: string; pinCode?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case 'CASHIER':
      return '/pos';
    case 'CAPTAIN':
      return '/tables';
    case 'CHEF':
      return '/kds';
    case 'INVENTORY_MANAGER':
      return '/inventory';
    case 'OWNER':
    case 'MANAGER':
    case 'SUPER_ADMIN':
    default:
      return '/dashboard';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOutlet, setCurrentOutletState] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentOutlet) {
      joinOutletRoom(currentOutlet.id);
    }
  }, [currentOutlet]);

  const isPublicRoute = (path: string | null) => {
    if (!path) return false;
    return (
      path === '/' ||
      path === '/login' ||
      path.startsWith('/super-admin') ||
      path.startsWith('/store') ||
      path.startsWith('/qr')
    );
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('rms_token');
    if (!token) {
      setIsLoading(false);
      if (!isPublicRoute(pathname)) router.push('/login');
      return;
    }

    const res = await fetchApi('/auth/me');
    if (res.success && res.user) {
      setUser(res.user);
      const savedOutletId = localStorage.getItem('rms_outlet_id');
      const matched = res.user.outlets.find((o: Outlet) => o.id === savedOutletId);
      const selected = matched || res.user.outlets[0] || null;
      setCurrentOutletState(selected);
    } else {
      localStorage.removeItem('rms_token');
      if (!isPublicRoute(pathname)) router.push('/login');
    }
    setIsLoading(false);
  };

  const setCurrentOutlet = (outlet: Outlet) => {
    setCurrentOutletState(outlet);
    localStorage.setItem('rms_outlet_id', outlet.id);
  };

  const login = async (credentials: { email?: string; password?: string; pinCode?: string }) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (res.success && res.token && res.user) {
      localStorage.setItem('rms_token', res.token);
      setUser(res.user);
      const defaultOutlet = res.user.outlets[0] || null;
      setCurrentOutletState(defaultOutlet);
      if (defaultOutlet) localStorage.setItem('rms_outlet_id', defaultOutlet.id);
      
      // Role-specific workspace redirection
      const destination = getDefaultRouteForRole(res.user.role);
      router.push(destination);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const logout = () => {
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_outlet_id');
    setUser(null);
    setCurrentOutletState(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOutlet,
        setCurrentOutlet,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

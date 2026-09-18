import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth, getDefaultRouteForRole } from '../context/AuthContext';
import * as apiModule from '../lib/api';

describe('AuthContext & Role-Based Routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('getDefaultRouteForRole()', () => {
    it('should route CASHIER to /pos', () => {
      expect(getDefaultRouteForRole('CASHIER')).toBe('/pos');
    });

    it('should route CAPTAIN to /tables', () => {
      expect(getDefaultRouteForRole('CAPTAIN')).toBe('/tables');
    });

    it('should route CHEF to /kds', () => {
      expect(getDefaultRouteForRole('CHEF')).toBe('/kds');
    });

    it('should route INVENTORY_MANAGER to /inventory', () => {
      expect(getDefaultRouteForRole('INVENTORY_MANAGER')).toBe('/inventory');
    });

    it('should route OWNER and MANAGER to /dashboard', () => {
      expect(getDefaultRouteForRole('OWNER')).toBe('/dashboard');
      expect(getDefaultRouteForRole('MANAGER')).toBe('/dashboard');
    });

    it('should route SUPER_ADMIN to /super-admin', () => {
      expect(getDefaultRouteForRole('SUPER_ADMIN')).toBe('/super-admin');
    });
  });

  describe('AuthProvider & useAuth', () => {
    it('throws error when useAuth is called outside AuthProvider', () => {
      // Suppress console.error in this test as React throws when context is missing
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
      spy.mockRestore();
    });

    it('allows successful login and stores token and outlet in localStorage', async () => {
      const mockUser = {
        id: 'u-1',
        name: 'Sunil Joshi',
        email: 'cashier@royalfeast.com',
        role: 'CASHIER',
        organizationId: 'org-1',
        organizationName: 'Royal Feast',
        currencySymbol: '₹',
        outlets: [
          {
            id: 'outlet-1',
            name: 'Cyber Hub Branch',
            code: 'CH-02',
            address: 'Gurugram',
            city: 'Gurugram',
            phone: '9811223344',
          },
        ],
      };

      vi.spyOn(apiModule, 'fetchApi').mockResolvedValue({
        success: true,
        token: 'valid-jwt-token',
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      let loginResult: any;
      await act(async () => {
        loginResult = await result.current.login({ email: 'cashier@royalfeast.com', password: 'cashier123' });
      });

      expect(loginResult.success).toBe(true);
      expect(localStorage.getItem('rms_token')).toBe('valid-jwt-token');
      expect(localStorage.getItem('rms_outlet_id')).toBe('outlet-1');
      expect(result.current.user?.name).toBe('Sunil Joshi');
      expect(result.current.currentOutlet?.name).toBe('Cyber Hub Branch');
    });

    it('logout clears localStorage and resets user state', async () => {
      localStorage.setItem('rms_token', 'active-token');
      localStorage.setItem('rms_outlet_id', 'outlet-1');

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      act(() => {
        result.current.logout();
      });

      expect(localStorage.getItem('rms_token')).toBeNull();
      expect(localStorage.getItem('rms_outlet_id')).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.currentOutlet).toBeNull();
    });
  });
});

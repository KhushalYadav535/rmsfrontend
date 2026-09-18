import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../app/login/page';
import { AuthProvider } from '../context/AuthContext';
import * as apiModule from '../lib/api';

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(<AuthProvider>{ui}</AuthProvider>);
  };

  it('renders branding header and tab buttons', () => {
    renderWithAuth(<LoginPage />);

    expect(screen.getByText('Royal Feast Restaurant OS')).toBeInTheDocument();
    expect(screen.getByText('Email & Password')).toBeInTheDocument();
    expect(screen.getByText('Quick POS PIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to terminal/i })).toBeInTheDocument();
  });

  it('switches between Email/Password and PIN tab modes', () => {
    renderWithAuth(<LoginPage />);

    // Initially in email mode
    expect(screen.getByPlaceholderText('name@restaurant.com')).toBeInTheDocument();

    // Click PIN tab
    const pinTab = screen.getByText('Quick POS PIN');
    fireEvent.click(pinTab);

    // Should now show 4-Digit Security PIN
    expect(screen.getByPlaceholderText('••••')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('name@restaurant.com')).not.toBeInTheDocument();
  });

  it('displays error message when credentials fail authentication', async () => {
    vi.spyOn(apiModule, 'fetchApi').mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });

    renderWithAuth(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in to terminal/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('populates credentials when quick demo role buttons are clicked', () => {
    renderWithAuth(<LoginPage />);

    const ownerButton = screen.getByText('Owner');
    fireEvent.click(ownerButton);

    const emailInput = screen.getByPlaceholderText('name@restaurant.com') as HTMLInputElement;
    expect(emailInput.value).toBe('owner@royalfeast.com');
  });

  it('populates super admin credentials when Super Admin quick button is clicked', () => {
    renderWithAuth(<LoginPage />);

    const superAdminButton = screen.getByText('Super Admin');
    fireEvent.click(superAdminButton);

    const emailInput = screen.getByPlaceholderText('name@restaurant.com') as HTMLInputElement;
    expect(emailInput.value).toBe('superadmin@rms.com');
  });
});

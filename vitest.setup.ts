import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Mock next/navigation
vi.mock('next/navigation', () => {
  const push = vi.fn();
  const replace = vi.fn();
  const back = vi.fn();
  const forward = vi.fn();
  const refresh = vi.fn();

  return {
    useRouter: () => ({
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
  };
});

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  return {
    io: vi.fn(() => mSocket),
    default: vi.fn(() => mSocket),
  };
});

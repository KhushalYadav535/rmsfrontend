import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchApi } from '../lib/api';

describe('Frontend API Client (fetchApi)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should include Authorization header when token exists in localStorage', async () => {
    localStorage.setItem('rms_token', 'mock-jwt-token-xyz');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    global.fetch = mockFetch;

    const res = await fetchApi('/test-endpoint');

    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers['Authorization']).toBe('Bearer mock-jwt-token-xyz');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should serialize object body to JSON string', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: '123' }),
    });
    global.fetch = mockFetch;

    const payload = { name: 'Paneer Tikka', price: 299 };
    await fetchApi('/menu/items', {
      method: 'POST',
      body: payload,
    });

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].body).toBe(JSON.stringify(payload));
  });

  it('should return error message when server responds with non-ok status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    const res = await fetchApi('/auth/login', { method: 'POST' });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid credentials');
  });

  it('should handle network fetch rejections gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const res = await fetchApi('/health');

    expect(res.success).toBe(false);
    expect(res.error).toBe('Connection refused');
  });
});

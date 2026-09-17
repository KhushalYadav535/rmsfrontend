const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FetchApiOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rms_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const body =
    options.body !== undefined && typeof options.body !== 'string' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      body,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP error ${res.status}` };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

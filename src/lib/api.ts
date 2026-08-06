// src/lib/api.ts
// Thin wrapper around fetch — every React Query hook goes through this.
// Centralizing here means auth headers, error handling, and the base URL
// only need to be right in one place.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

interface ApiError {
  message: string;
  status: number;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // sends the httpOnly JWT cookie your Express backend sets
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error: ApiError = {
      message: `Request failed: ${res.statusText}`,
      status: res.status,
    };
    try {
      const body = await res.json();
      error.message = body.message ?? error.message;
    } catch {
      // response wasn't JSON — keep default message
    }
    throw error;
  }

  return res.json() as Promise<T>;
}
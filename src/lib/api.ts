const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, token: string | undefined, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new ApiError(response.status, 'Authentication required. Please log in again.');
    }

    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  telegram: {
    createConnectToken: async (token: string, destination: 'direct' | 'group') => {
      return fetchWithAuth('/telegram/connect-token', token, {
        method: 'POST',
        body: JSON.stringify({ destination }),
      });
    },

    getStatus: async (token: string) => {
      return fetchWithAuth('/telegram/status', token, {
        method: 'GET',
      });
    },
  },

  notificationChannels: {
    getAll: async (token: string) => {
      return fetchWithAuth('/notification-channels', token, {
        method: 'GET',
      });
    },
  },
};

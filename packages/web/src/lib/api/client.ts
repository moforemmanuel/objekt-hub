const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiError {
  status: number;
  message: string;
  errors: string | Record<string, string[]>;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string | Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth token if provided or from localStorage
  const authToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
      errors: 'UnknownError',
    }));

    throw new ApiClientError(error.status, error.message, error.errors);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  // For multipart/form-data uploads
  upload: async <T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> => {
    const { token, ...fetchOptions } = options || {};

    const headers: Record<string, string> = {
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData - browser will set it with boundary

    const authToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        status: response.status,
        message: response.statusText,
        errors: 'UnknownError',
      }));

      throw new ApiClientError(error.status, error.message, error.errors);
    }

    return response.json();
  },
};

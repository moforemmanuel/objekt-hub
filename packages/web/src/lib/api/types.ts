// API Response wrapper
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// User
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
}

// Object
export interface ObjectItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdBy: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export interface CreateObjectRequest {
  title: string;
  description?: string;
  image: File;
}

export interface QueryObjectsParams {
  page?: number;
  limit?: number;
  search?: string;
}

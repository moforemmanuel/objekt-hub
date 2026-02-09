import { api } from './client';
import type { ApiResponse, User } from './types';

export const usersApi = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),

  updateProfile: (data: { username: string }) =>
    api.patch<ApiResponse<User>>('/users/profile', data),
};

import { api } from './client';
import type {
  ApiResponse,
  ObjectItem,
  PaginatedResponse,
  CreateObjectRequest,
  QueryObjectsParams,
} from './types';

export const objectsApi = {
  list: (params?: QueryObjectsParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    return api.get<PaginatedResponse<ObjectItem>>(
      `/objects${queryString ? `?${queryString}` : ''}`
    );
  },

  get: (id: string) => api.get<ApiResponse<ObjectItem>>(`/objects/${id}`),

  create: (data: CreateObjectRequest) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('image', data.image);

    return api.upload<ApiResponse<ObjectItem>>('/objects', formData);
  },

  delete: (id: string) =>
    api.delete<ApiResponse<{ id: string; message: string }>>(`/objects/${id}`),
};

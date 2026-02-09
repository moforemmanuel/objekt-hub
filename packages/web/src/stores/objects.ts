import { create } from 'zustand';
import type { ObjectItem, PaginationMeta } from '@/lib/api';

interface ObjectsState {
  objects: ObjectItem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setObjects: (objects: ObjectItem[], pagination: PaginationMeta) => void;
  addObject: (object: ObjectItem) => void;
  removeObject: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearObjects: () => void;
}

export const useObjectsStore = create<ObjectsState>((set) => ({
  objects: [],
  pagination: null,
  isLoading: false,
  error: null,
  setObjects: (objects, pagination) => set({ objects, pagination, error: null }),
  addObject: (object) =>
    set((state) => ({
      objects: [object, ...state.objects],
      pagination: state.pagination
        ? { ...state.pagination, total: state.pagination.total + 1 }
        : null,
    })),
  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      pagination: state.pagination
        ? { ...state.pagination, total: state.pagination.total - 1 }
        : null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearObjects: () => set({ objects: [], pagination: null, error: null }),
}));

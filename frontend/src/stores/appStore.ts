import { create } from 'zustand';
import type { Model, Generation } from '@/types';

interface AppStore {
  // Models
  models: Model[];
  selectedModel: Model | null;
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: Model | null) => void;

  // Generations
  currentGeneration: Generation | null;
  setCurrentGeneration: (generation: Generation | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Search/Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  modelFilter: string | null;
  setModelFilter: (filter: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  models: [],
  selectedModel: null,
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  currentGeneration: null,
  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now().toString(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  loading: false,
  setLoading: (loading) => set({ loading }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  modelFilter: null,
  setModelFilter: (filter) => set({ modelFilter: filter }),
}));

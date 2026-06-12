import { create } from 'zustand';
import type { Generation, GeneratedImage } from '@/types';

interface HistoryStore {
  generations: Generation[];
  setGenerations: (generations: Generation[]) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (generation: Generation) => void;
  removeGeneration: (id: string) => void;

  favorites: GeneratedImage[];
  setFavorites: (favorites: GeneratedImage[]) => void;
  toggleFavorite: (image: GeneratedImage) => void;

  // Filters
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;

  dateRange: { from: Date | null; to: Date | null };
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Pagination
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total: number;
  setTotal: (total: number) => void;

  // Computed
  filteredGenerations: () => Generation[];
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  generations: [],
  setGenerations: (generations) => set({ generations }),
  addGeneration: (generation) =>
    set((state) => ({
      generations: [generation, ...state.generations],
    })),
  updateGeneration: (generation) =>
    set((state) => ({
      generations: state.generations.map((g) => (g.id === generation.id ? generation : g)),
    })),
  removeGeneration: (id) =>
    set((state) => ({
      generations: state.generations.filter((g) => g.id !== id),
    })),

  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  toggleFavorite: (image) =>
    set((state) => {
      const exists = state.favorites.find((f) => f.id === image.id);
      return {
        favorites: exists
          ? state.favorites.filter((f) => f.id !== image.id)
          : [...state.favorites, image],
      };
    }),

  selectedModel: null,
  setSelectedModel: (model) => set({ selectedModel: model }),

  dateRange: { from: null, to: null },
  setDateRange: (range) => set({ dateRange: range }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  page: 1,
  setPage: (page) => set({ page }),
  pageSize: 50,
  setPageSize: (size) => set({ pageSize: size }),
  total: 0,
  setTotal: (total) => set({ total }),

  filteredGenerations: () => {
    const state = get();
    let filtered = state.generations;

    if (state.selectedModel) {
      filtered = filtered.filter((g) => g.model === state.selectedModel);
    }

    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.images.some((img) => img.prompt.toLowerCase().includes(term)) ||
          g.id.toLowerCase().includes(term)
      );
    }

    if (state.dateRange.from || state.dateRange.to) {
      filtered = filtered.filter((g) => {
        const genDate = new Date(g.createdAt);
        if (state.dateRange.from && genDate < state.dateRange.from) return false;
        if (state.dateRange.to && genDate > state.dateRange.to) return false;
        return true;
      });
    }

    return filtered;
  },
}));

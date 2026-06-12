import { create } from 'zustand';
export const useAppStore = create((set) => ({
    models: [],
    selectedModel: null,
    setModels: (models) => set({ models }),
    setSelectedModel: (model) => set({ selectedModel: model }),
    currentGeneration: null,
    setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toasts: [],
    addToast: (message, type) => set((state) => ({
        toasts: [...state.toasts, { id: Date.now().toString(), message, type }],
    })),
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
    })),
    loading: false,
    setLoading: (loading) => set({ loading }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    modelFilter: null,
    setModelFilter: (filter) => set({ modelFilter: filter }),
}));

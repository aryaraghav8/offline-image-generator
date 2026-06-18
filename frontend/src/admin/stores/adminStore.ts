import { create } from 'zustand';

interface AdminStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

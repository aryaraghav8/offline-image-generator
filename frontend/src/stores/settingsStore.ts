import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, ApiSettings, LocalSettings } from '@/types';

interface SettingsStore extends AppSettings {
  apiSettings: ApiSettings;
  localSettings: LocalSettings;

  updateSettings: (settings: Partial<AppSettings>) => void;
  updateApiSettings: (settings: Partial<ApiSettings>) => void;
  updateLocalSettings: (settings: Partial<LocalSettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  gridSize: 'md',
  defaultModel: 'FLUX',
  defaultWidth: 768,
  defaultHeight: 768,
  defaultSteps: 20,
  defaultCfgScale: 7.5,
  autoSavePrompts: true,
  notifications: {
    generationComplete: true,
    generationFailed: true,
    updates: false,
  },
};

const DEFAULT_API_SETTINGS: ApiSettings = {
  provider: 'local',
  baseUrl: 'http://localhost:5000',
};

const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  enabled: true,
  type: 'ollama',
  baseUrl: 'http://localhost',
  port: 11434,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      apiSettings: DEFAULT_API_SETTINGS,
      localSettings: DEFAULT_LOCAL_SETTINGS,

      updateSettings: (settings) => set({ ...settings }),

      updateApiSettings: (settings) =>
        set((state) => ({
          apiSettings: { ...state.apiSettings, ...settings },
        })),

      updateLocalSettings: (settings) =>
        set((state) => ({
          localSettings: { ...state.localSettings, ...settings },
        })),

      resetToDefaults: () =>
        set({
          ...DEFAULT_SETTINGS,
          apiSettings: DEFAULT_API_SETTINGS,
          localSettings: DEFAULT_LOCAL_SETTINGS,
        }),
    }),
    {
      name: 'settings-storage',
    }
  )
);

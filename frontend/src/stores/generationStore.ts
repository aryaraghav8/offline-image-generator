import { create } from 'zustand';
import type { GenerationParams } from '@/types';

interface GenerationStore {
  // Form state
  prompt: string;
  setPrompt: (prompt: string) => void;

  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;

  model: string;
  setModel: (model: string) => void;

  width: number;
  setWidth: (width: number) => void;

  height: number;
  setHeight: (height: number) => void;

  steps: number;
  setSteps: (steps: number) => void;

  cfgScale: number;
  setCfgScale: (scale: number) => void;

  seed: number | null;
  setSeed: (seed: number | null) => void;

  randomSeed: boolean;
  setRandomSeed: (random: boolean) => void;

  count: number;
  setCount: (count: number) => void;

  // Batch operations
  setParams: (params: Partial<GenerationParams>) => void;
  resetParams: () => void;
  getParams: () => GenerationParams;

  // Presets
  presets: Record<string, Partial<GenerationParams>>;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
}

const DEFAULT_PARAMS = {
  prompt: '',
  negativePrompt: '',
  model: 'flux',
  width: 1024,
  height: 1024,
  steps: 20,
  cfgScale: 7.5,
  seed: null,
  randomSeed: true,
  count: 1,
};

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  prompt: DEFAULT_PARAMS.prompt,
  setPrompt: (prompt) => set({ prompt }),

  negativePrompt: DEFAULT_PARAMS.negativePrompt,
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),

  model: DEFAULT_PARAMS.model,
  setModel: (model) => set({ model }),

  width: DEFAULT_PARAMS.width,
  setWidth: (width) => set({ width }),

  height: DEFAULT_PARAMS.height,
  setHeight: (height) => set({ height }),

  steps: DEFAULT_PARAMS.steps,
  setSteps: (steps) => set({ steps }),

  cfgScale: DEFAULT_PARAMS.cfgScale,
  setCfgScale: (cfgScale) => set({ cfgScale }),

  seed: DEFAULT_PARAMS.seed,
  setSeed: (seed) => set({ seed }),

  randomSeed: DEFAULT_PARAMS.randomSeed,
  setRandomSeed: (randomSeed) => set({ randomSeed }),

  count: DEFAULT_PARAMS.count,
  setCount: (count) => set({ count }),

  setParams: (params) => set(params),

  resetParams: () => set(DEFAULT_PARAMS),

  getParams: (): GenerationParams => {
    const state = get();
    return {
      prompt: state.prompt,
      negativePrompt: state.negativePrompt,
      model: state.model,
      width: state.width,
      height: state.height,
      steps: state.steps,
      cfgScale: state.cfgScale,
      seed: state.randomSeed ? undefined : state.seed || undefined,
      randomSeed: state.randomSeed,
      count: state.count,
    };
  },

  presets: {},
  savePreset: (name) => {
    const state = get();
    set({
      presets: {
        ...state.presets,
        [name]: {
          prompt: state.prompt,
          negativePrompt: state.negativePrompt,
          model: state.model,
          width: state.width,
          height: state.height,
          steps: state.steps,
          cfgScale: state.cfgScale,
        },
      },
    });
  },

  loadPreset: (name) => {
    const state = get();
    const preset = state.presets[name];
    if (preset) {
      set(preset);
    }
  },
}));

import { create } from 'zustand';
const DEFAULT_PARAMS = {
    prompt: '',
    negativePrompt: '',
    model: 'FLUX',
    width: 768,
    height: 768,
    steps: 20,
    cfgScale: 7.5,
    seed: null,
    randomSeed: true,
    count: 1,
};
export const useGenerationStore = create((set, get) => ({
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
    getParams: () => {
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

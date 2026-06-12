import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Image, Settings2, Wand2 } from 'lucide-react';

import { ImageGrid } from '@/components/gallery/ImageGrid';
import {
  ModelSelector,
  PromptEditor,
  GenerationSettings,
} from '@/components/features/FormComponents';

import { Button } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import { useGenerationStore } from '@/stores/generationStore';
import { apiClient } from '@/services/api';

import type { GeneratedImage } from '@/types';

import { MOCK_MODELS } from '@/utils';

export const GeneratePage = () => {
  const location = useLocation();

  const addToast = useAppStore((state) => state.addToast);
  const generation = useGenerationStore();

  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const state = location.state as { prompt?: string } | null;

    if (state?.prompt && !generation.prompt) {
      generation.setPrompt(state.prompt);
    }
  }, [generation, location.state]);

  const selectedModel =
    MOCK_MODELS.find((model) => model.id === generation.model) ??
    MOCK_MODELS[0];

  const handleGenerate = async () => {
    if (!generation.prompt.trim()) {
      addToast('Enter a prompt before generating', 'error');
      return;
    }

    try {
      setIsGenerating(true);

      const response = await apiClient.generateImage({
        prompt: generation.prompt,
        negativePrompt: generation.negativePrompt,
        model: generation.model,
        width: generation.width,
        height: generation.height,
        steps: generation.steps,
        cfgScale: generation.cfgScale,
        seed: generation.seed,
        randomSeed: generation.randomSeed,
        count: generation.count,
      });

      const image: GeneratedImage = {
        id: Date.now().toString(),
        url: response.imageUrl,
        prompt: generation.prompt,
        negativePrompt: generation.negativePrompt,
        model: generation.model,
        params: generation.getParams(),
        createdAt: new Date().toISOString(),
        generationTime: 0,
        isFavorite: false,
      };

      setResults((prev) => [image, ...prev]);

      addToast('Image generated successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    addToast('Prompt copied', 'success');
  };

  return (
    <div className="flex h-full min-h-0 flex-col xl:flex-row">
      <aside className="w-full flex-shrink-0 overflow-y-auto border-b border-dark-700 bg-dark-900 xl:w-96 xl:border-b-0 xl:border-r">
        <div className="space-y-6 p-5">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dark-500">
              Prompt
            </h2>

            <PromptEditor
              prompt={generation.prompt}
              negativePrompt={generation.negativePrompt}
              onPromptChange={generation.setPrompt}
              // onNegativePromptChange={generation.setNegativePrompt}
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
              <Image size={14} />
              Model
            </h2>

            <ModelSelector
              models={MOCK_MODELS}
              selectedModel={selectedModel}
              onSelect={(model) => generation.setModel(model.id)}
              compact
            />
          </section>

          {/* <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
              <Settings2 size={14} />
              Settings
            </h2>

            <GenerationSettings
              width={generation.width}
              onWidthChange={generation.setWidth}
              height={generation.height}
              onHeightChange={generation.setHeight}
              steps={generation.steps}
              onStepsChange={generation.setSteps}
              cfgScale={generation.cfgScale}
              onCfgScaleChange={generation.setCfgScale}
              seed={generation.seed}
              onSeedChange={generation.setSeed}
              randomSeed={generation.randomSeed}
              onRandomSeedChange={generation.setRandomSeed}
              count={generation.count}
              onCountChange={generation.setCount}
            />
          </section> */}

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="w-full"
          >
            <Wand2 size={16} />
            Generate
          </Button>
        </div>
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-white">
            Results
          </h1>

          <p className="mt-0.5 text-sm text-dark-500">
            Generated previews appear here
          </p>
        </div>

        <ImageGrid
          images={results}
          onCopyPrompt={copyPrompt}
          emptyMessage="No results yet"
        />
      </section>
    </div>
  );
};
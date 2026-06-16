import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Image, Wand2 } from 'lucide-react';

import { ImageGrid } from '@/components/gallery/ImageGrid';
import {
  ModelSelector,
  PromptEditor,
} from '@/components/features/FormComponents';

import { Button } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import { useGenerationStore } from '@/stores/generationStore';
import { apiClient } from '@/services/api';

import type { GeneratedImage } from '@/types';

export const GeneratePage = () => {
  const location = useLocation();

  const addToast = useAppStore((state) => state.addToast);

  const models = useAppStore((state) => state.models);
  const setModels = useAppStore((state) => state.setModels);

  const generation = useGenerationStore();

  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    const state = location.state as { prompt?: string } | null;

    if (state?.prompt && !generation.prompt) {
      generation.setPrompt(state.prompt);
    }
  }, [generation, location.state]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingModels(true);

        const data = await apiClient.getModels();

        setModels(data);

        if (!generation.model && data.length > 0) {
          generation.setModel(data[0].id);
        }
      } catch (error) {
        console.error(error);
        addToast('Failed to load models', 'error');
      } finally {
        setLoadingModels(false);
      }
    };

    void loadModels();
  }, [setModels, addToast]);

  const selectedModel =
    models.find((model) => model.id === generation.model) ??
    models[0];

  const handleGenerate = async () => {
    if (!generation.prompt.trim()) {
      addToast('Enter a prompt before generating', 'error');
      return;
    }

    if (!selectedModel) {
      addToast('No model selected', 'error');
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

      addToast(
        'Image generated successfully',
        'success'
      );

      generation.setPrompt('');
    } catch (error) {
      console.error(error);

      addToast(
        'Generation failed',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);

      addToast(
        'Prompt copied',
        'success'
      );
    } catch {
      addToast(
        'Failed to copy prompt',
        'error'
      );
    }
  };

  console.log('models', models);
  console.log('selectedModel', selectedModel);

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
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
              <Image size={14} />
              Model
            </h2>

            {loadingModels ? (
              <div className="rounded-lg border border-dark-700 bg-dark-800 p-4 text-sm text-dark-400">
                Loading models...
              </div>
            ) : (
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelect={(model) =>
                  generation.setModel(model.id)
                }
                compact
              />
            )}
          </section>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="w-full"
            disabled={
              isGenerating ||
              loadingModels ||
              models.length === 0
            }
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
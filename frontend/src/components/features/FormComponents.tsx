import React from 'react';
import type { Model, PromptTemplate } from '@/types';
import { Input, TextArea, Slider } from '@/components/ui/BaseComponents';
import { Card, CardHeader } from '@/components/ui/AdvancedComponents';
import { cn, MODEL_BADGES, PERFORMANCE_BADGES, validateImageDimensions } from '@/utils';
import { Check } from 'lucide-react';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model | null;
  onSelect: (model: Model) => void;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelect,
  compact,
}) => {
  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-dark-100">Model</label>
        <select
          value={selectedModel?.id || ''}
          onChange={(e) => {
            const model = models.find((m) => m.id === e.target.value);
            if (model) onSelect(model);
          }}
          className="input-base w-full"
        >
          <option value="">Select a model</option>
          {models.filter((m) => m.installed).map((model) => (
            <option key={model.id} value={model.id}>
              {model.displayName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-dark-100">Model</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.filter((m) => m.installed).map((model) => (
          <Card
            key={model.id}
            hover
            className={cn(
              'cursor-pointer border-2 transition-all',
              selectedModel?.id === model.id
                ? 'border-blue-600 bg-blue-900/20'
                : 'border-dark-700 hover:border-dark-600'
            )}
            onClick={() => onSelect(model)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-dark-100">{model.displayName}</h3>
                <p className="text-sm text-dark-400 mt-1">{model.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-dark-700 rounded">
                    {MODEL_BADGES[model.id]?.label || model.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-dark-700 rounded">
                    {PERFORMANCE_BADGES[model.performance]}
                  </span>
                </div>
              </div>
              {selectedModel?.id === model.id && (
                <Check className="text-blue-600" size={20} />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  negativePrompt?: string;
  onNegativePromptChange?: (prompt: string) => void;
  templates?: PromptTemplate[];
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  templates,
}) => {
  const [showTemplates, setShowTemplates] = React.useState(false);

  return (
    <Card>
      <CardHeader
        title="Prompt"
        description="Describe what you want to generate"
      />
      <div className="space-y-4">
        <TextArea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., A serene landscape with mountains and a lake at sunset..."
          maxLength={2000}
          showCharCount
          rows={4}
        />

        {onNegativePromptChange && (
          <TextArea
            value={negativePrompt || ''}
            onChange={(e) => onNegativePromptChange(e.target.value)}
            placeholder="What to avoid in the image..."
            maxLength={1000}
            rows={2}
          />
        )}

        {templates && templates.length > 0 && (
          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {showTemplates ? '▼' : '▶'} Prompt Templates
            </button>
            {showTemplates && (
              <div className="mt-2 space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onPromptChange(template.content);
                      setShowTemplates(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-dark-700 transition-colors text-sm"
                  >
                    <div className="font-medium text-dark-100">{template.name}</div>
                    <div className="text-dark-400 text-xs mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface GenerationSettingsProps {
  width: number;
  onWidthChange: (width: number) => void;
  height: number;
  onHeightChange: (height: number) => void;
  steps: number;
  onStepsChange: (steps: number) => void;
  cfgScale: number;
  onCfgScaleChange: (scale: number) => void;
  seed: number | null;
  onSeedChange: (seed: number | null) => void;
  randomSeed: boolean;
  onRandomSeedChange: (random: boolean) => void;
  count: number;
  onCountChange: (count: number) => void;
}

export const GenerationSettings: React.FC<GenerationSettingsProps> = ({
  width,
  onWidthChange,
  height,
  onHeightChange,
  steps,
  onStepsChange,
  cfgScale,
  onCfgScaleChange,
  seed,
  onSeedChange,
  randomSeed,
  onRandomSeedChange,
  count,
  onCountChange,
}) => {
  const dimensions = validateImageDimensions(width, height);

  return (
    <Card>
      <CardHeader title="Generation Settings" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-2">Width</label>
            <Input
              type="number"
              value={width}
              onChange={(e) => onWidthChange(parseInt(e.target.value, 10))}
              min={256}
              max={2048}
              step={64}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-2">Height</label>
            <Input
              type="number"
              value={height}
              onChange={(e) => onHeightChange(parseInt(e.target.value, 10))}
              min={256}
              max={2048}
              step={64}
            />
          </div>
        </div>
        {!dimensions.valid && (
          <p className="text-red-500 text-sm">{dimensions.error}</p>
        )}

        <Slider
          label="Steps"
          min={1}
          max={50}
          step={1}
          value={steps}
          onChange={(e) => onStepsChange(parseInt(e.target.value, 10))}
        />

        <Slider
          label="CFG Scale"
          min={1}
          max={20}
          step={0.5}
          value={cfgScale}
          onChange={(e) => onCfgScaleChange(parseFloat(e.target.value))}
        />

        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={randomSeed}
              onChange={(e) => onRandomSeedChange(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium text-dark-100">Random Seed</span>
          </label>
          {!randomSeed && (
            <Input
              type="number"
              value={seed || ''}
              onChange={(e) => onSeedChange(e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="Enter seed"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">Number of Images</label>
          <select
            value={count}
            onChange={(e) => onCountChange(parseInt(e.target.value, 10))}
            className="input-base w-full"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

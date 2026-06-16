import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Download, Heart, Info, X } from 'lucide-react';
import type { GeneratedImage } from '@/types';
import { ImageCard } from '@/components/gallery/ImageCard';
import { formatDate } from '@/utils';

interface ImageGridProps {
  images: GeneratedImage[];
  emptyMessage?: string;
  onFavorite?: (image: GeneratedImage) => void;
  onCopyPrompt?: (prompt: string) => void;
}

export const ImageGrid = ({ images, emptyMessage, onFavorite, onCopyPrompt }: ImageGridProps) => {
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const fullscreenIndex = images.findIndex((image) => image.id === fullscreenImage?.id);

  const navigate = useCallback(
    (direction: -1 | 1) => {
      const nextIndex = fullscreenIndex + direction;
      if (nextIndex >= 0 && nextIndex < images.length) {
        setFullscreenImage(images[nextIndex]);
      }
    },
    [fullscreenIndex, images]
  );

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-700 bg-dark-800">
          <Info size={24} className="text-dark-500" />
        </div>
        <p className="font-medium text-dark-300">{emptyMessage ?? 'No images yet'}</p>
        <p className="mt-1 text-sm text-dark-500">Generated images will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((image) => (
          <button key={image.id} type="button" className="gallery-item-item block w-full text-left" onClick={() => setFullscreenImage(image)}>
            <ImageCard image={image} />
          </button>
        ))}
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute right-5 top-5 z-10 rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {fullscreenIndex > 0 && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {fullscreenIndex < images.length - 1 && (
            <button
              type="button"
              onClick={() => navigate(1)}
              className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="flex max-h-screen w-full max-w-6xl flex-col gap-6 overflow-auto p-2 lg:flex-row lg:items-start">
            <div className="flex flex-1 items-center justify-center">
              <img src={fullscreenImage.url} alt={fullscreenImage.prompt} className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl" />
            </div>
            <aside className="w-full flex-shrink-0 space-y-5 rounded-2xl border border-dark-700 bg-dark-900 p-5 lg:w-80">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">Prompt</p>
                <p className="text-sm leading-relaxed text-dark-300">{fullscreenImage.prompt}</p>
              </div>
              {fullscreenImage.negativePrompt && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">Negative</p>
                  <p className="text-sm leading-relaxed text-dark-300">{fullscreenImage.negativePrompt}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Model', value: fullscreenImage.model },
                  { label: 'Size', value: `${fullscreenImage.params.width}x${fullscreenImage.params.height}` },
                  { label: 'Steps', value: String(fullscreenImage.params.steps) },
                  { label: 'CFG', value: String(fullscreenImage.params.cfgScale) },
                  { label: 'Time', value: `${fullscreenImage.generationTime}s` },
                  { label: 'Created', value: formatDate(fullscreenImage.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-dark-800 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-dark-500">{label}</p>
                    <p className="mt-0.5 truncate text-xs font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onCopyPrompt?.(fullscreenImage.prompt)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dark-700 bg-dark-800 py-2.5 text-sm font-medium text-dark-300 transition-colors hover:text-white"
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => onFavorite?.(fullscreenImage)}
                  className={`rounded-xl border p-2.5 transition-colors ${
                    fullscreenImage.isFavorite
                      ? 'border-red-500/40 bg-red-500/20 text-red-400'
                      : 'border-dark-700 bg-dark-800 text-dark-500 hover:text-red-400'
                  }`}
                >
                  <Heart size={16} fill={fullscreenImage.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => window.open(fullscreenImage.url, '_blank')}
                  className="rounded-xl border border-indigo-500/30 bg-indigo-500/20 p-2.5 text-indigo-400 transition-colors hover:bg-indigo-500/30"
                >
                  <Download size={16} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
};

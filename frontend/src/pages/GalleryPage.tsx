import { useState } from 'react';
import { Heart, Images } from 'lucide-react';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { useAppStore } from '@/stores/appStore';
import type { GeneratedImage } from '@/types';
import { MOCK_IMAGES } from '@/utils';

export const GalleryPage = () => {
  const [images, setImages] = useState(MOCK_IMAGES);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const addToast = useAppStore((state) => state.addToast);

  const displayed = showFavoritesOnly ? images.filter((image) => image.isFavorite) : images;

  const toggleFavorite = (target: GeneratedImage) => {
    setImages((current) => current.map((image) => (image.id === target.id ? { ...image, isFavorite: !image.isFavorite } : image)));
    addToast(target.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    addToast('Prompt copied', 'success');
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Images size={20} className="text-indigo-400" />
            Gallery
          </h1>
          <p className="mt-0.5 text-sm text-dark-500">{images.length} images</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
            showFavoritesOnly
              ? 'border-red-500/30 bg-red-500/15 text-red-400'
              : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600 hover:text-white'
          }`}
        >
          <Heart size={15} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          Favorites
        </button>
      </div>
      <ImageGrid
        images={displayed}
        onFavorite={toggleFavorite}
        onCopyPrompt={copyPrompt}
        emptyMessage={showFavoritesOnly ? 'No favorites yet' : 'No images yet'}
      />
    </div>
  );
};

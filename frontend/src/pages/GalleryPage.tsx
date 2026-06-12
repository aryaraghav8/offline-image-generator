import { useEffect, useState } from 'react';
import { Heart, Images } from 'lucide-react';

import { ImageGrid } from '@/components/gallery/ImageGrid';
import { useAppStore } from '@/stores/appStore';
import { apiClient } from '@/services/api';

import type { GeneratedImage } from '@/types';

export const GalleryPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const addToast = useAppStore((state) => state.addToast);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);

      const data = await apiClient.getImages();

      setImages(data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayed = showFavoritesOnly
    ? images.filter((image) => image.isFavorite)
    : images;

  const toggleFavorite = (target: GeneratedImage) => {
    setImages((current) =>
      current.map((image) =>
        image.id === target.id
          ? {
              ...image,
              isFavorite: !image.isFavorite,
            }
          : image
      )
    );

    addToast(
      target.isFavorite
        ? 'Removed from favorites'
        : 'Added to favorites',
      'success'
    );
  };

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    addToast('Prompt copied', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-dark-500">Loading images...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Images size={20} className="text-indigo-400" />
            Gallery
          </h1>

          <p className="mt-0.5 text-sm text-dark-500">
            {images.length} images
          </p>
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
          <Heart
            size={15}
            fill={showFavoritesOnly ? 'currentColor' : 'none'}
          />
          Favorites
        </button>
      </div>

      <ImageGrid
        images={displayed}
        onFavorite={toggleFavorite}
        onCopyPrompt={copyPrompt}
        emptyMessage={
          showFavoritesOnly
            ? 'No favorites yet'
            : 'No images yet'
        }
      />
    </div>
  );
};
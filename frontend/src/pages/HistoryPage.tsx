import { useEffect, useMemo, useState } from 'react';
import { Clock3, Search } from 'lucide-react';

import { ImageGrid } from '@/components/gallery/ImageGrid';
import { useAppStore } from '@/stores/appStore';
import { apiClient } from '@/services/api';

import type { GeneratedImage } from '@/types';

export const HistoryPage = () => {
  const addToast = useAppStore((state) => state.addToast);

  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const data = await apiClient.getImages();

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setImages(sorted);
    } catch (error) {
      console.error(error);
      addToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = useMemo(() => {
    if (!search.trim()) return images;

    const query = search.toLowerCase();

    return images.filter(
      (image) =>
        image.prompt.toLowerCase().includes(query) ||
        image.model.toLowerCase().includes(query)
    );
  }, [images, search]);

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    addToast('Prompt copied', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-dark-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock3 size={20} className="text-cyan-400" />
            History
          </h1>

          <p className="mt-0.5 text-sm text-dark-500">
            {filteredImages.length} generations
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter history..."
            className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 pl-9 pr-4 text-sm text-dark-300 placeholder:text-dark-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <ImageGrid
        images={filteredImages}
        onCopyPrompt={copyPrompt}
        emptyMessage="No history yet"
      />
    </div>
  );
};
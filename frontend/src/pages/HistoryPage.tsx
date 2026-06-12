import { Clock3, Search } from 'lucide-react';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { useAppStore } from '@/stores/appStore';
import { MOCK_IMAGES } from '@/utils';

export const HistoryPage = () => {
  const addToast = useAppStore((state) => state.addToast);

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    addToast('Prompt copied', 'success');
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock3 size={20} className="text-cyan-400" />
            History
          </h1>
          <p className="mt-0.5 text-sm text-dark-500">Recent generation sessions and prompts</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Filter history..."
            className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 pl-9 pr-4 text-sm text-dark-300 placeholder:text-dark-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>
      <ImageGrid images={MOCK_IMAGES} onCopyPrompt={copyPrompt} emptyMessage="No history yet" />
    </div>
  );
};

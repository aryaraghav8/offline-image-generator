import { Bell, Menu, Search, Wand2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your AI studio' },
  '/generate': { title: 'Generate', subtitle: 'Create images from text prompts' },
  '/gallery': { title: 'Gallery', subtitle: 'Browse your generated images' },
  '/history': { title: 'History', subtitle: 'Previous generations and sessions' },
  '/models': { title: 'Models', subtitle: 'Manage your AI models' },
  '/settings': { title: 'Settings', subtitle: 'Configure your workspace' },
};

export const Header = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'Lumina', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-dark-700 bg-dark-950/90 px-4 backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-base font-semibold leading-tight text-white">{pageInfo.title}</h1>
          <p className="text-xs leading-tight text-dark-500">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Search prompts, models..."
            className="w-full rounded-lg border border-dark-700 bg-dark-800 py-2 pl-9 pr-4 text-sm text-dark-300 transition-colors placeholder:text-dark-500 focus:border-indigo-500 focus:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-plasma hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium sm:flex"
          onClick={() => navigate('/generate')}
        >
          <Wand2 size={15} />
          <span>Generate</span>
        </button>
        <button type="button" className="relative rounded-lg p-2 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
};

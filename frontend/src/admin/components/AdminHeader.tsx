import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAdminStore } from '@/admin/stores/adminStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Operational overview' },
  '/admin/models': { title: 'Models', subtitle: 'Manage models available to end users' },
  '/admin/providers': { title: 'Providers', subtitle: 'Connections and credentials for generation backends' },
  '/admin/templates': { title: 'Templates', subtitle: 'Prompt templates available in the editor' },
  '/admin/storage': { title: 'Storage', subtitle: 'Disk usage and retention policy' },
  '/admin/system': { title: 'System', subtitle: 'Service health, resource usage, and logs' },
};

export const AdminHeader = () => {
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'Control Room', subtitle: '' };

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
        <div>
          <h1 className="text-base font-semibold leading-tight text-white">{pageInfo.title}</h1>
          <p className="text-xs leading-tight text-dark-500">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-dark-500">
        <span className="hidden rounded-full border border-dark-700 px-2.5 py-1 sm:inline">v1.4.2</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Production
        </span>
      </div>
    </header>
  );
};

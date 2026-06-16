import { NavLink } from 'react-router-dom';
import {
  ChevronRight,
  Cpu,
  Images,
  LayoutDashboard,
  Settings,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/generate', icon: Wand2, label: 'Generate' },
  { to: '/gallery', icon: Images, label: 'Gallery' },
  { to: '/models', icon: Cpu, label: 'Models' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-dark-700 bg-dark-900 transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-dark-700 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide text-white">Lumina</span>
              <span className="block text-xs leading-none text-dark-500">AI Studio</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-dark-500">Workspace</p>
          {NAV_ITEMS.slice(0, 4).map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'sidebar-item-active text-white' : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-dark-500 group-hover:text-dark-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-indigo-400 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}

          <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-dark-500">Configuration</p>
          {NAV_ITEMS.slice(4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'sidebar-item-active text-white' : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-dark-500 group-hover:text-dark-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-indigo-400 opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-dark-700 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-dark-800 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
              AI
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">AI Studio</p>
              <p className="text-xs text-dark-500">Local workspace</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-success" />
          </div>
        </div>
      </aside>
    </>
  );
};

import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Database,
  Gauge,
  LayoutDashboard,
  Plug,
  ShieldHalf,
  Sparkles,
  X,
} from 'lucide-react';
import { useAdminStore } from '@/admin/stores/adminStore';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/models', icon: Cpu, label: 'Models' },
  { to: '/admin/providers', icon: Plug, label: 'Providers' },
  { to: '/admin/templates', icon: Sparkles, label: 'Templates' },
  { to: '/admin/storage', icon: Database, label: 'Storage' },
  { to: '/admin/system', icon: Gauge, label: 'System' },
];

export const AdminSidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const navigate = useNavigate();

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
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-dark-700 bg-dark-950 transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-dark-700 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ember-500 to-ember-700">
              <ShieldHalf size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide text-white">Control Room</span>
              <span className="block text-xs leading-none text-dark-500">Lumina Admin</span>
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
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-dark-500">Operations</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'bg-ember-500/10 text-white ring-1 ring-inset ring-ember-500/30' : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-ember-400' : 'text-dark-500 group-hover:text-dark-300'} />
                  <span className="flex-1">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-dark-700 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-400 transition-colors hover:bg-dark-800 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to app
          </button>
        </div>
      </aside>
    </>
  );
};

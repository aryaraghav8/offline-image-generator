import { Outlet } from 'react-router-dom';
import { AdminHeader } from '@/admin/components/AdminHeader';
import { AdminSidebar } from '@/admin/components/AdminSidebar';
import { NotificationSystem } from '@/components/ui/NotificationSystem';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationSystem />
    </div>
  );
};

import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { GeneratePage } from '@/pages/GeneratePage';
import { ModelsPage } from '@/pages/ModelsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { AdminDashboardPage } from '@/admin/pages/AdminDashboardPage';
import { AdminModelsPage } from '@/admin/pages/AdminModelsPage';
import { AdminProvidersPage } from '@/admin/pages/AdminProvidersPage';
import { AdminTemplatesPage } from '@/admin/pages/AdminTemplatesPage';
import { AdminStoragePage } from '@/admin/pages/AdminStoragePage';
import { AdminSystemPage } from '@/admin/pages/AdminSystemPage';

export const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="models" element={<AdminModelsPage />} />
        <Route path="providers" element={<AdminProvidersPage />} />
        <Route path="templates" element={<AdminTemplatesPage />} />
        <Route path="storage" element={<AdminStoragePage />} />
        <Route path="system" element={<AdminSystemPage />} />
      </Route>
    </Routes>
  );
};

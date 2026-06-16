import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { GeneratePage } from '@/pages/GeneratePage';
import { ModelsPage } from '@/pages/ModelsPage';
import { SettingsPage } from '@/pages/SettingsPage';

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
    </Routes>
  );
};

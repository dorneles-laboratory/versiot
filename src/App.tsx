import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme/theme-provider';
import { Toaster } from './components/ui/toaster/toaster';
import { SerialProvider } from './context/SerialContext';
import { MarketingLayout } from './layouts/MarketingLayout/MarketingLayout';
import { CatalogLayout } from './layouts/CatalogLayout/CatalogLayout';
import { WorkspaceLayout } from './layouts/WorkspaceLayout/WorkspaceLayout';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { CatalogPage } from './pages/CatalogPage/CatalogPage';
import { WorkspacePage } from './pages/WorkspacePage/WorkspacePage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="versiot_theme">
      <BrowserRouter>
        <Routes>
          {/* 1. Landing Page (Vitrine / Marketing) */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* 2. Catálogo de Projetos (Dashboard / Filtros) */}
          <Route element={<CatalogLayout />}>
            <Route path="/projetos" element={<CatalogPage />} />
            <Route path="/404" element={<NotFoundPage />} />
          </Route>

          {/* 3. Workspace do Projeto (Imersão / Canvas 3D / Código / Hardware Serial) */}
          <Route
            element={
              <SerialProvider>
                <WorkspaceLayout />
              </SerialProvider>
            }
          >
            <Route path="/projetos/:slug" element={<WorkspacePage />} />
          </Route>

          {/* Fallback de rotas antigas ou inexistentes */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>

        {/* Notificações Toaster globais */}
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

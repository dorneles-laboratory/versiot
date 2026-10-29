import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../src/components/ui/theme/theme-provider';
import { SerialProvider } from '../src/context/SerialContext';
import { MarketingLayout } from '../src/layouts/MarketingLayout/MarketingLayout';
import { CatalogLayout } from '../src/layouts/CatalogLayout/CatalogLayout';
import { WorkspaceLayout } from '../src/layouts/WorkspaceLayout/WorkspaceLayout';
import { LandingPage } from '../src/pages/LandingPage/LandingPage';
import { CatalogPage } from '../src/pages/CatalogPage/CatalogPage';
import { WorkspacePage } from '../src/pages/WorkspacePage/WorkspacePage';
import '../src/i18n';

describe('App Routing & Layouts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Landing Page on route /', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Hardware Real, Simulação Virtual')).toBeInTheDocument();
    expect(screen.getAllByText('Explorar Catálogo').length).toBeGreaterThan(0);
    expect(screen.getByText('Do circuito à simulação em 3 passos simples')).toBeInTheDocument();
  });

  it('renders Catalog Page on route /projetos with search and filters', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <MemoryRouter initialEntries={['/projetos']}>
          <Routes>
            <Route element={<CatalogLayout />}>
              <Route path="/projetos" element={<CatalogPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Catálogo de Projetos IoT')).toBeInTheDocument();
    expect(screen.getByText('FlightScope')).toBeInTheDocument();
    expect(screen.getByText('SonarScope')).toBeInTheDocument();

    // Testa filtro textual de busca
    const searchInput = screen.getByPlaceholderText('Buscar por nome, sensor, microcontrolador ou categoria...');
    fireEvent.change(searchInput, { target: { value: 'Terrário' } });

    expect(screen.getByText('BioScope')).toBeInTheDocument();
    expect(screen.queryByText('FlightScope')).not.toBeInTheDocument();
  });

  it('renders Workspace Page with 4 tabs and allows tab navigation', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <MemoryRouter initialEntries={['/projetos/flightscope']}>
          <SerialProvider initialSlug="flightscope">
            <Routes>
              <Route element={<WorkspaceLayout />}>
                <Route path="/projetos/:slug" element={<WorkspacePage />} />
              </Route>
            </Routes>
          </SerialProvider>
        </MemoryRouter>
      </ThemeProvider>
    );

    // Topbar
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Conectar USB')).toBeInTheDocument();
    expect(screen.getByText('Simular')).toBeInTheDocument();

    // Tabs
    const tabVisualizer = screen.getByText('Visualizador Interativo');
    const tabWiring = screen.getByText('Esquema de Sensores');
    const tabCode = screen.getByText('Código & Firmware');
    const tabTerminal = screen.getByText('Console Serial');

    expect(tabVisualizer).toBeInTheDocument();
    expect(tabWiring).toBeInTheDocument();
    expect(tabCode).toBeInTheDocument();
    expect(tabTerminal).toBeInTheDocument();

    // Navega para a aba de Código
    fireEvent.click(tabCode);
    expect(screen.getByText('Firmware para o Microcontrolador — FlightScope')).toBeInTheDocument();
    expect(screen.getByText('Copiar Código')).toBeInTheDocument();

    // Navega para a aba de Esquema de Sensores
    fireEvent.click(tabWiring);
    expect(screen.getByText('Esquema de Fiação do Hardware — FlightScope')).toBeInTheDocument();
    expect(screen.getByText('Diagrama Esquemático')).toBeInTheDocument();

    // Navega para o Terminal Serial
    fireEvent.click(tabTerminal);
    expect(screen.getByText('Console Serial de Debug')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite um comando serial (ex: RESET, CALIB)...')).toBeInTheDocument();
  });
});

import React from 'react';
import { Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Cpu,
  ArrowLeft,
  ChevronDown,
  Usb,
  Play,
  Square,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';
import { useSerial } from '@/context/SerialContext';
import { ALL_PROJECTS } from '@/data/projects';
import styles from './WorkspaceLayout.module.css';

export const WorkspaceLayout: React.FC = () => {
  const { t } = useTranslation(['common', 'workspace']);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const {
    activeProject,
    setActiveSlug,
    isConnected,
    isSimulating,
    connectSerial,
    disconnectSerial,
    toggleSimulation,
  } = useSerial();

  // Sincroniza o projeto ativo com o slug da URL
  React.useEffect(() => {
    if (slug && slug !== activeProject.slug) {
      setActiveSlug(slug);
    }
  }, [slug, activeProject.slug, setActiveSlug]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSelectProject = (newSlug: string) => {
    setActiveSlug(newSlug);
    navigate(`/projetos/${newSlug}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.leftGroup}>
          <Link to="/" className={styles.logoLink} title={t('brand', { ns: 'common' })}>
            <div className={styles.logoIcon}>
              <Cpu size={16} />
            </div>
            <span>{t('brand', { ns: 'common' })}</span>
          </Link>

          <div className={styles.separator} />

          <Link to="/projetos" className={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>{t('topbar.backToCatalog', { ns: 'workspace' })}</span>
          </Link>

          <div className={styles.separator} />

          {/* Dropdown de Troca de Projeto */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={styles.projectDropdown}>
                <span>{activeProject.icon}</span>
                <span>{activeProject.shortName}</span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t('topbar.switchProject', { ns: 'workspace' })}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_PROJECTS.map((proj) => (
                <DropdownMenuItem
                  key={proj.slug}
                  onClick={() => handleSelectProject(proj.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: proj.slug === activeProject.slug ? 700 : 400,
                  }}
                >
                  <span>{proj.icon}</span>
                  <span>{proj.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Centro: Indicador de Conexão */}
        <div className={styles.centerGroup}>
          {isSimulating ? (
            <div className={`${styles.statusBadge} ${styles.statusSimulating}`}>
              <span className={styles.statusDot} />
              <span>{t('topbar.status.simulating', { ns: 'workspace' })}</span>
            </div>
          ) : isConnected ? (
            <div className={`${styles.statusBadge} ${styles.statusConnected}`}>
              <span className={styles.statusDot} />
              <span>{t('topbar.status.connected', { ns: 'workspace' })}</span>
            </div>
          ) : (
            <div className={`${styles.statusBadge} ${styles.statusDisconnected}`}>
              <span className={styles.statusDot} />
              <span>{t('topbar.status.disconnected', { ns: 'workspace' })}</span>
            </div>
          )}
        </div>

        {/* Direita: Ações de Hardware / Simulação e Tema */}
        <div className={styles.rightGroup}>
          {/* Botão de Hardware USB */}
          {isConnected ? (
            <Button variant="destructive" size="sm" onClick={disconnectSerial}>
              <Usb size={15} style={{ marginRight: '6px' }} />
              <span>{t('topbar.actions.disconnectUsb', { ns: 'workspace' })}</span>
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={connectSerial}>
              <Usb size={15} style={{ marginRight: '6px' }} />
              <span>{t('topbar.actions.connectUsb', { ns: 'workspace' })}</span>
            </Button>
          )}

          {/* Botão de Simulação */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSimulation}
            className={`${styles.btnSimulate} ${isSimulating ? styles.btnSimulateActive : ''}`}
          >
            {isSimulating ? (
              <>
                <Square size={14} style={{ marginRight: '6px' }} />
                <span>{t('topbar.actions.stopSimulate', { ns: 'workspace' })}</span>
              </>
            ) : (
              <>
                <Play size={14} style={{ marginRight: '6px' }} />
                <span>{t('topbar.actions.simulate', { ns: 'workspace' })}</span>
              </>
            )}
          </Button>

          {/* Alternar Tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t('theme.toggle', { ns: 'common' })}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
        </div>
      </header>

      <main className={styles.workspaceContent}>
        <Outlet />
      </main>
    </div>
  );
};

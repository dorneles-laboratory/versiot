import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gamepad2,
  FileCode,
  Terminal,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useSerial } from '@/context/SerialContext';
import { useTheme } from '@/hooks/useTheme';
import { getProjectBySlug } from '@/data/projects';
import { Scene3D } from '@/components/Scene3D/Scene3D';
import { FlightscopeTelemetrySection } from '@/components/FlightscopeTelemetry/FlightscopeTelemetrySection';
import { SonarVisualizer } from '@/components/Visualizers/SonarVisualizer/SonarVisualizer';
import { GardenVisualizer } from '@/components/Visualizers/GardenVisualizer/GardenVisualizer';
import { HomeVisualizer } from '@/components/Visualizers/HomeVisualizer/HomeVisualizer';
import { PulseVisualizer } from '@/components/Visualizers/PulseVisualizer/PulseVisualizer';
import { WiringView } from '@/components/WiringView/WiringView';
import { CodeView } from '@/components/CodeView/CodeView';
import { SerialTerminal } from '@/components/SerialTerminal/SerialTerminal';
import {
  TelemetryPoint,
  SonarPoint,
  GardenPoint,
  SmartHomePoint,
  PulsePoint,
} from '@/types/telemetry';
import styles from './WorkspacePage.module.css';

type WorkspaceTab = 'visualizer' | 'wiring' | 'code' | 'terminal';

export const WorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation(['workspace', 'common', 'projects']);
  const { theme } = useTheme();

  const {
    activeProject,
    telemetryData,
    telemetryHistory,
    serialLogs,
    baudRate,
    setBaudRate,
    sendRaw,
    clearSerialLogs,
    hasWebSerialSupport,
  } = useSerial();

  const [dismissNotice, setDismissNotice] = useState(false);

  // Tab da URL: default é 'visualizer'
  const activeTab = (searchParams.get('tab') || 'visualizer') as WorkspaceTab;

  const handleTabChange = (tab: WorkspaceTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'visualizer') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  };

  const project = getProjectBySlug(slug || '') || activeProject;

  if (!project) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>{t('notFound.title', { ns: 'workspace' })}</h2>
        <p>{t('notFound.description', { ns: 'workspace' })}</p>
        <Button asChild style={{ marginTop: '1rem' }}>
          <Link to="/projetos">{t('notFound.back', { ns: 'workspace' })}</Link>
        </Button>
      </div>
    );
  }

  // Pontos de telemetria com fallbacks seguros
  const flightPoint: TelemetryPoint = telemetryData.flightscope || {
    id: 0,
    time: '--:--:--',
    timestamp: Date.now(),
    Pitch: 0.0,
    Roll: 0.0,
    Radar_cm: 30.0,
    Nivel_Perigo: 0,
    Status: 'Aguardando Dados...',
  };

  const sonarPoint: SonarPoint = telemetryData.sonar || {
    id: 0,
    time: '--:--:--',
    timestamp: Date.now(),
    angle: 90,
    distance: 50.0,
    detected: false,
    dangerLevel: 0,
    status: 'Varredura Aguardando',
  };

  const gardenPoint: GardenPoint = telemetryData.garden || {
    id: 0,
    time: '--:--:--',
    timestamp: Date.now(),
    temperature: 24.0,
    humidity: 60.0,
    soilMoisture: 50,
    lightLevel: 500,
    pumpActive: false,
    status: 'Aguardando Sensores',
  };

  const homePoint: SmartHomePoint = telemetryData.smarthome || {
    id: 0,
    time: '--:--:--',
    timestamp: Date.now(),
    pirDetected: false,
    gasPpm: 120,
    gasAlert: false,
    lightLux: 450,
    temperature: 23.5,
    lampLivingRoom: false,
    lampKitchen: false,
    status: 'Sistema Pronto',
  };

  const pulsePoint: PulsePoint = telemetryData.pulse || {
    id: 0,
    time: '--:--:--',
    timestamp: Date.now(),
    bpm: 72,
    spo2: 98,
    hrv: 45,
    fingerDetected: false,
    stressLevel: 'Baixo',
    rawWaveform: 350,
    status: 'Posicione o Dedo',
  };

  return (
    <div className={styles.container}>
      {/* Alerta de Navegador Sem Suporte a Web Serial */}
      {!hasWebSerialSupport && !dismissNotice && (
        <div className={styles.noticeBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{t('unsupported.description', { ns: 'workspace' })}</span>
          </div>
          <button
            onClick={() => setDismissNotice(true)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header Local do Projeto */}
      <div className={styles.subHeader}>
        <div className={styles.projectInfo}>
          <div className={styles.projectIcon}>{project.icon}</div>
          <div className={styles.projectTitleGroup}>
            <h1 className={styles.projectName}>{project.name}</h1>
            <p className={styles.projectTagline}>{project.tagline}</p>
          </div>
        </div>

        <div className={styles.badgesGroup}>
          <span
            className={styles.pillBadge}
            style={{
              color: project.accentColor,
              borderColor: `${project.accentColor}55`,
              backgroundColor: `${project.accentColor}15`,
            }}
          >
            {project.badge}
          </span>
          <span className={styles.pillBadge}>{project.category}</span>
          <span className={styles.pillBadge}>
            {t('header.difficulty', { ns: 'workspace' })}: {project.difficulty}
          </span>
          <span className={styles.pillBadge}>
            {project.microcontrollers.join(' / ')}
          </span>
        </div>
      </div>

      {/* Navegação por Abas */}
      <nav className={styles.tabNavigation}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'visualizer' ? styles.tabActive : ''} ${activeTab === 'visualizer' ? styles.tabBtnActive : ''}`}
          onClick={() => handleTabChange('visualizer')}
        >
          <Gamepad2 size={16} />
          <span>{t('tabs.visualizer', { ns: 'workspace' })}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'wiring' ? styles.tabBtnActive : ''}`}
          onClick={() => handleTabChange('wiring')}
        >
          <Layers size={16} />
          <span>{t('tabs.wiring', { ns: 'workspace' })}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'code' ? styles.tabBtnActive : ''}`}
          onClick={() => handleTabChange('code')}
        >
          <FileCode size={16} />
          <span>{t('tabs.code', { ns: 'workspace' })}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'terminal' ? styles.tabBtnActive : ''}`}
          onClick={() => handleTabChange('terminal')}
        >
          <Terminal size={16} />
          <span>{t('tabs.terminal', { ns: 'workspace' })}</span>
        </button>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <div className={styles.tabContentArea}>
        {activeTab === 'visualizer' && (
          <div className={styles.visualizerWrapper}>
            {project.slug === 'flightscope' && (
              <>
                <div className={styles.scene3dContainer}>
                  <Scene3D
                    telemetry={flightPoint}
                    theme={theme === 'light' ? 'light' : 'dark'}
                  />
                </div>
                <FlightscopeTelemetrySection
                  latestPoint={flightPoint}
                  telemetryHistory={telemetryHistory}
                  theme={theme === 'light' ? 'light' : 'dark'}
                />
              </>
            )}

            {project.slug === 'sonar' && <SonarVisualizer telemetry={sonarPoint} />}
            {project.slug === 'garden' && <GardenVisualizer telemetry={gardenPoint} />}
            {project.slug === 'smarthome' && <HomeVisualizer telemetry={homePoint} />}
            {project.slug === 'pulse' && <PulseVisualizer telemetry={pulsePoint} />}
          </div>
        )}

        {activeTab === 'wiring' && <WiringView project={project} />}

        {activeTab === 'code' && <CodeView project={project} />}

        {activeTab === 'terminal' && (
          <SerialTerminal
            project={project}
            logs={serialLogs}
            baudRate={baudRate}
            onBaudRateChange={setBaudRate}
            onSendRaw={sendRaw}
            onClearLogs={clearSerialLogs}
          />
        )}
      </div>
    </div>
  );
};

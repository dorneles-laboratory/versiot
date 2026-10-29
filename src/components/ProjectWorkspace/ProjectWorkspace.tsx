import React from 'react';
import { IoTProject } from '../../types/project';
import {
  UniversalTelemetryData,
  TelemetryPoint,
  SonarPoint,
  GardenPoint,
  SmartHomePoint,
  PulsePoint,
} from '../../types/telemetry';
import { Scene3D } from '../Scene3D/Scene3D';
import { FlightscopeTelemetrySection } from '../FlightscopeTelemetry/FlightscopeTelemetrySection';
import { SonarVisualizer } from '../Visualizers/SonarVisualizer/SonarVisualizer';
import { GardenVisualizer } from '../Visualizers/GardenVisualizer/GardenVisualizer';
import { HomeVisualizer } from '../Visualizers/HomeVisualizer/HomeVisualizer';
import { PulseVisualizer } from '../Visualizers/PulseVisualizer/PulseVisualizer';
import { WiringView } from '../WiringView/WiringView';
import { CodeView } from '../CodeView/CodeView';
import { SerialTerminal, SerialLogEntry } from '../SerialTerminal/SerialTerminal';
import styles from './ProjectWorkspace.module.css';

interface ProjectWorkspaceProps {
  project: IoTProject;
  activeTab: 'visualizer' | 'wiring' | 'code' | 'terminal';
  setActiveTab: (tab: 'visualizer' | 'wiring' | 'code' | 'terminal') => void;
  telemetryData: UniversalTelemetryData;
  telemetryHistory: any[];
  theme: 'dark' | 'light';
  logs: SerialLogEntry[];
  baudRate: number;
  onBaudRateChange: (baud: number) => void;
  onSendRaw: (cmd: string) => void;
  onClearLogs: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  activeTab,
  setActiveTab,
  telemetryData,
  telemetryHistory,
  theme,
  logs,
  baudRate,
  onBaudRateChange,
  onSendRaw,
  onClearLogs,
}) => {
  // Ponto de telemetria ativo para o FlightScope
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

  // Ponto ativo para o Sonar
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

  // Ponto ativo para a Estufa/Terrário
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

  // Ponto ativo para a Casa Inteligente
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

  // Ponto ativo para o Monitor Biométrico
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
      {/* Sub-header do Projeto */}
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
          <span className={styles.pillBadge}>Dificuldade: {project.difficulty}</span>
        </div>
      </div>

      {/* Navegação de Abas do Projeto */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'visualizer' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('visualizer')}
        >
          <span>🎮</span> Visualizador Interativo
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'wiring' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('wiring')}
        >
          <span>🔌</span> Esquema de Sensores
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'code' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <span>💻</span> Código &amp; Firmware
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'terminal' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          <span>📟</span> Console Serial ({logs.length})
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className={styles.workspaceContent}>
        {activeTab === 'visualizer' && (
          <div className={styles.visualizerWrapper}>
            {project.id === 'flightscope' && (
              <>
                <Scene3D telemetry={flightPoint} theme={theme} />
                <FlightscopeTelemetrySection
                  latestPoint={flightPoint}
                  telemetryHistory={telemetryHistory}
                  theme={theme}
                />
              </>
            )}

            {project.id === 'sonar' && (
              <SonarVisualizer telemetry={sonarPoint} />
            )}

            {project.id === 'garden' && (
              <GardenVisualizer telemetry={gardenPoint} />
            )}

            {project.id === 'smarthome' && (
              <HomeVisualizer telemetry={homePoint} />
            )}

            {project.id === 'pulse' && (
              <PulseVisualizer telemetry={pulsePoint} />
            )}
          </div>
        )}

        {activeTab === 'wiring' && <WiringView project={project} />}

        {activeTab === 'code' && <CodeView project={project} />}

        {activeTab === 'terminal' && (
          <SerialTerminal
            project={project}
            logs={logs}
            baudRate={baudRate}
            onBaudRateChange={onBaudRateChange}
            onSendRaw={onSendRaw}
            onClearLogs={onClearLogs}
          />
        )}
      </div>
    </div>
  );
};

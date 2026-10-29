import React from 'react';
import { IoTProject } from '../../types/project';
import styles from './Navbar.module.css';

interface NavbarProps {
  projects: IoTProject[];
  currentProject: IoTProject | null;
  onSelectProject: (projectId: string) => void;
  onOpenCatalog: () => void;
  isConnected: boolean;
  isSimulating: boolean;
  onConnectSerial: () => void;
  onDisconnectSerial: () => void;
  onToggleSimulation: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onOpenCatalog,
  isConnected,
  isSimulating,
  onConnectSerial,
  onDisconnectSerial,
  onToggleSimulation,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className={styles.header}>
      {/* Logotipo e Marca VersIOT */}
      <div className={styles.brandArea} onClick={onOpenCatalog}>
        <div className={styles.logo}>
          <span className={styles.logoPulse} />
          <span className={styles.logoText}>VersIOT</span>
        </div>
        <span className={styles.tagline}>Central de Projetos IoT</span>
      </div>

      {/* Navegação Central: Galeria e Seletor Rápido */}
      <div className={styles.centerNav}>
        <button className={styles.btnCatalog} onClick={onOpenCatalog}>
          <span>📑</span>
          <span>Catálogo de Projetos</span>
        </button>

        <select
          className={styles.projectSelect}
          value={currentProject?.id || ''}
          onChange={(e) => {
            if (e.target.value) onSelectProject(e.target.value);
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.shortName}
            </option>
          ))}
        </select>
      </div>

      {/* Ações e Controles à Direita */}
      <div className={styles.actionsRight}>
        {/* Status da Conexão */}
        <div
          className={`${styles.statusPill} ${
            isConnected
              ? styles.statusConnected
              : isSimulating
              ? styles.statusSimulated
              : ''
          }`}
        >
          <span>
            {isConnected ? '🟢 USB Ativo' : isSimulating ? '🔵 Simulação' : '⚪ Desconectado'}
          </span>
        </div>

        {/* Botão de Conexão Serial USB */}
        {isConnected ? (
          <button
            className={`${styles.btnConnect} ${styles.btnDisconnect}`}
            onClick={onDisconnectSerial}
          >
            <span>🔌</span> Desconectar
          </button>
        ) : (
          <button className={styles.btnConnect} onClick={onConnectSerial}>
            <span>⚡</span> Conectar USB
          </button>
        )}

        {/* Botão de Simulação Procedural */}
        <button
          className={`${styles.btnSim} ${isSimulating ? styles.btnSimActive : ''}`}
          onClick={onToggleSimulation}
          title={isSimulating ? 'Pausar Simulação' : 'Iniciar Simulação de Dados'}
        >
          <span>{isSimulating ? '⏹️' : '▶️'}</span>
          <span>{isSimulating ? 'Parar Simulação' : 'Simular'}</span>
        </button>

        {/* Alternador de Tema Dark/Light */}
        <button
          className={styles.btnTheme}
          onClick={onToggleTheme}
          title="Alternar Tema Claro / Escuro"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
};

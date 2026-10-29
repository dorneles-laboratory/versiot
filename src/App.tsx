import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './App.module.css';
import { ALL_PROJECTS, getProjectById, DEFAULT_PROJECT_ID } from './data/projects';
import { IoTProject } from './types/project';
import {
  UniversalTelemetryData,
  TelemetryPoint,
} from './types/telemetry';
import { parseUniversalSerialLine, formatTelemetryTime } from './utils/parseSerial';
import {
  generateFlightscopeSimPoint,
  generateSonarSimPoint,
  generateGardenSimPoint,
  generateSmartHomeSimPoint,
  generatePulseSimPoint,
} from './utils/simulationGenerators';
import { Navbar } from './components/Navbar/Navbar';
import { ProjectCatalog } from './components/ProjectCatalog/ProjectCatalog';
import { ProjectWorkspace } from './components/ProjectWorkspace/ProjectWorkspace';
import { SerialLogEntry } from './components/SerialTerminal/SerialTerminal';

const MAX_POINTS = 30;
const MAX_LOGS = 120;

export const App: React.FC = () => {
  // Estado da visualização principal: 'catalog' (Galeria) ou 'project' (Espaço de Trabalho)
  const [currentView, setCurrentView] = useState<'catalog' | 'project'>('project');
  // Projeto IoT ativo selecionado
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  // Aba ativa dentro do projeto
  const [activeTab, setActiveTab] = useState<'visualizer' | 'wiring' | 'code' | 'terminal'>('visualizer');

  // Dados unificados de telemetria recebidos
  const [telemetryData, setTelemetryData] = useState<UniversalTelemetryData>({});
  // Histórico de telemetria para os gráficos do FlightScope
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);

  // Logs do terminal serial
  const [serialLogs, setSerialLogs] = useState<SerialLogEntry[]>([]);
  let logIdCounter = useRef(0);

  // Status da conexão USB Serial e Simulação
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [baudRate, setBaudRate] = useState<number>(115200);

  // Tema ativo: 'dark' ou 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('versiot_theme') || localStorage.getItem('flightscope_theme');
      return saved === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Mensagens de feedback e suporte à API
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasWebSerialSupport, setHasWebSerialSupport] = useState<boolean>(true);

  // Referências para o ciclo de vida da porta serial
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const keepReadingRef = useRef<boolean>(false);
  const simIntervalRef = useRef<number | null>(null);

  // Projeto atual selecionado
  const currentProject: IoTProject = getProjectById(activeProjectId) || ALL_PROJECTS[0];

  // Sincroniza baud rate padrão quando o projeto muda
  useEffect(() => {
    if (currentProject) {
      setBaudRate(currentProject.defaultBaud);
    }
  }, [activeProjectId, currentProject]);

  // Monitora suporte e eventos de desconexão de hardware USB
  useEffect(() => {
    if (typeof window === 'undefined' || !('serial' in navigator) || !navigator.serial) {
      setHasWebSerialSupport(false);
      return;
    }

    const handleDeviceDisconnect = (event: Event) => {
      const customEvent = event as Event & { port?: SerialPort };
      if (!portRef.current || (customEvent.port && customEvent.port === portRef.current)) {
        console.warn('Dispositivo USB desconectado fisicamente.');
        setErrorMessage('O dispositivo USB foi desconectado fisicamente da porta.');
        handleDisconnectSerial();
      }
    };

    const handleDeviceConnect = () => {
      console.info('Dispositivo USB detectado na porta.');
      setErrorMessage(null);
    };

    navigator.serial.addEventListener('disconnect', handleDeviceDisconnect);
    navigator.serial.addEventListener('connect', handleDeviceConnect);

    return () => {
      navigator.serial?.removeEventListener('disconnect', handleDeviceDisconnect);
      navigator.serial?.removeEventListener('connect', handleDeviceConnect);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((curr) => {
      const next = curr === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('versiot_theme', next);
      }
      return next;
    });
  };

  /**
   * Adiciona uma linha ao log do terminal serial
   */
  const addSerialLog = useCallback((text: string, type: 'rx' | 'tx' | 'sys' = 'rx') => {
    const timeStr = formatTelemetryTime(new Date());
    const newEntry: SerialLogEntry = {
      id: ++logIdCounter.current,
      time: timeStr,
      text,
      type,
    };
    setSerialLogs((prev) => {
      const updated = [...prev, newEntry];
      if (updated.length > MAX_LOGS) {
        return updated.slice(updated.length - MAX_LOGS);
      }
      return updated;
    });
  }, []);

  /**
   * Atualiza a telemetria com um novo pacote
   */
  const handleNewTelemetry = useCallback(
    (parsed: UniversalTelemetryData) => {
      setTelemetryData((prev) => ({
        ...prev,
        ...parsed,
      }));

      // Se for telemetria do FlightScope, atualiza o histórico do gráfico
      if (parsed.flightscope) {
        setTelemetryHistory((prev) => {
          const updated = [...prev, parsed.flightscope!];
          if (updated.length > MAX_POINTS) {
            return updated.slice(updated.length - MAX_POINTS);
          }
          return updated;
        });
      }
    },
    []
  );

  /**
   * Conectar via Web Serial API
   */
  const handleConnectSerial = async () => {
    setErrorMessage(null);

    if (!('serial' in navigator) || !navigator.serial) {
      setErrorMessage(
        'Seu navegador não suporta a Web Serial API. Utilize o Google Chrome ou Microsoft Edge.'
      );
      return;
    }

    if (portRef.current) {
      await handleDisconnectSerial();
    }

    try {
      if (isSimulating) {
        stopSimulation();
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });

      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);
      addSerialLog(`Porta serial aberta com sucesso em ${baudRate} bps.`, 'sys');

      if (!port.readable) {
        throw new Error('A porta serial selecionada não possui stream legível.');
      }

      const reader = port.readable.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder('utf-8');
      let lineBuffer = '';

      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          lineBuffer += decoder.decode(value, { stream: true });

          if (lineBuffer.length > 2048) {
            lineBuffer = lineBuffer.slice(-512);
          }

          const lines = lineBuffer.split(/\r?\n/);
          lineBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.trim()) {
              addSerialLog(line.trim(), 'rx');
              const parsed = parseUniversalSerialLine(line, activeProjectId);
              if (parsed) {
                handleNewTelemetry(parsed);
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotFoundError') {
        console.info('Seleção de porta cancelada pelo usuário.');
      } else if (error.name === 'NetworkError' || error.message.includes('open')) {
        setErrorMessage(
          'A porta serial já está aberta ou ocupada por outro programa. Feche a Arduino IDE e tente novamente.'
        );
      } else {
        setErrorMessage(`Falha na conexão serial: ${error.message}`);
      }
      await handleDisconnectSerial();
    }
  };

  /**
   * Desconecta a porta serial
   */
  const handleDisconnectSerial = async () => {
    keepReadingRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        /* ignorar se já cancelado */
      }
      try {
        readerRef.current.releaseLock();
      } catch {
        /* ignorar */
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        /* ignorar */
      }
      portRef.current = null;
    }

    setIsConnected(false);
    addSerialLog('Porta serial desconectada.', 'sys');
  };

  /**
   * Envia comando raw pela serial
   */
  const handleSendRaw = async (cmd: string) => {
    addSerialLog(cmd, 'tx');

    if (portRef.current && portRef.current.writable) {
      try {
        const encoder = new TextEncoder();
        const writer = portRef.current.writable.getWriter();
        await writer.write(encoder.encode(cmd + '\n'));
        writer.releaseLock();
      } catch (err) {
        console.error('Erro ao escrever na serial:', err);
        addSerialLog(`Erro no envio: ${(err as Error).message}`, 'sys');
      }
    } else {
      // Se não conectado, tenta simular o parse local do comando se for payload
      const parsed = parseUniversalSerialLine(cmd, activeProjectId);
      if (parsed) {
        handleNewTelemetry(parsed);
      }
    }
  };

  /**
   * Controle de Simulação Procedural
   */
  const startSimulation = () => {
    handleDisconnectSerial();
    setIsSimulating(true);
    addSerialLog(`Modo Simulação iniciado para [${currentProject.shortName}].`, 'sys');

    if (simIntervalRef.current) {
      window.clearInterval(simIntervalRef.current);
    }

    // Intervalo de acordo com o projeto
    const intervalMs = activeProjectId === 'flightscope' ? 80 : activeProjectId === 'pulse' ? 60 : 120;

    simIntervalRef.current = window.setInterval(() => {
      let simData: UniversalTelemetryData = {};
      let logText = '';

      if (activeProjectId === 'flightscope') {
        const p = generateFlightscopeSimPoint();
        simData = { flightscope: p };
        logText = `Pitch:${p.Pitch} | Roll:${p.Roll} | Radar_cm:${p.Radar_cm} | Nivel_Perigo:${p.Nivel_Perigo} | Status:${p.Status}`;
      } else if (activeProjectId === 'sonar') {
        const p = generateSonarSimPoint();
        simData = { sonar: p };
        logText = `Angle:${p.angle} | Distance:${p.distance} | Danger:${p.dangerLevel} | Status:${p.status}`;
      } else if (activeProjectId === 'garden') {
        const p = generateGardenSimPoint();
        simData = { garden: p };
        logText = `Temp:${p.temperature} | Humidity:${p.humidity} | Soil:${p.soilMoisture} | Light:${p.lightLevel} | Pump:${p.pumpActive ? 1 : 0} | Status:${p.status}`;
      } else if (activeProjectId === 'smarthome') {
        const p = generateSmartHomeSimPoint();
        simData = { smarthome: p };
        logText = `PIR:${p.pirDetected ? 1 : 0} | Gas:${p.gasPpm} | GasAlert:${p.gasAlert ? 1 : 0} | Lux:${p.lightLux} | Temp:${p.temperature} | Status:${p.status}`;
      } else if (activeProjectId === 'pulse') {
        const p = generatePulseSimPoint();
        simData = { pulse: p };
        logText = `BPM:${p.bpm} | SpO2:${p.spo2} | Wave:${p.rawWaveform} | Stress:${p.stressLevel} | Status:${p.status}`;
      }

      handleNewTelemetry(simData);
      if (logText) {
        addSerialLog(logText, 'rx');
      }
    }, intervalMs);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simIntervalRef.current) {
      window.clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    addSerialLog('Modo Simulação encerrado.', 'sys');
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  // Se trocar de projeto enquanto simula, reinicia o gerador correto
  useEffect(() => {
    if (isSimulating) {
      startSimulation();
    }
  }, [activeProjectId]);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) {
        window.clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('project');
    setActiveTab('visualizer');
  };

  return (
    <div
      className={`${styles.dashboard} ${
        theme === 'dark' ? styles.themeDark : styles.themeLight
      }`}
    >
      {/* Barra de Navegação Superior VersIOT */}
      <Navbar
        projects={ALL_PROJECTS}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onOpenCatalog={() => setCurrentView('catalog')}
        isConnected={isConnected}
        isSimulating={isSimulating}
        onConnectSerial={handleConnectSerial}
        onDisconnectSerial={handleDisconnectSerial}
        onToggleSimulation={toggleSimulation}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Alerta de Incompatibilidade de Navegador */}
      {!hasWebSerialSupport && (
        <div className={styles.browserWarning}>
          <strong>Aviso de Compatibilidade:</strong> Este navegador não suporta a Web Serial API.
          Para conectar placas microcontroladoras reais via cabo USB, recomendamos o{' '}
          <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>. Você ainda pode usar o{' '}
          <strong>Modo Simulação</strong> normalmente!
        </div>
      )}

      {/* Alerta de Erro de Comunicação */}
      {errorMessage && (
        <div className={styles.browserWarning} style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#fca5a5' }}>
          <strong>Atenção:</strong> {errorMessage}
        </div>
      )}

      {/* Visualização Condicional: Catálogo de Projetos ou Espaço de Trabalho do Projeto */}
      {currentView === 'catalog' ? (
        <ProjectCatalog
          projects={ALL_PROJECTS}
          onSelectProject={handleSelectProject}
        />
      ) : (
        <ProjectWorkspace
          project={currentProject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          telemetryData={telemetryData}
          telemetryHistory={telemetryHistory}
          theme={theme}
          logs={serialLogs}
          baudRate={baudRate}
          onBaudRateChange={setBaudRate}
          onSendRaw={handleSendRaw}
          onClearLogs={() => setSerialLogs([])}
        />
      )}

      {/* Rodapé VersIOT */}
      <footer className={styles.footer}>
        <div className={styles.footerMetrics}>
          <span>VersIOT v2.0 · Central Maker &amp; IoT</span>
          <span>Baud Rate: {baudRate} bps</span>
          <span>Status: {isConnected ? 'USB Conectado' : isSimulating ? 'Simulação Ativa' : 'Standby'}</span>
        </div>
        <div>
          <span>Desenvolvido com React 19, Three.js &amp; Web Serial API</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { UniversalTelemetryData, TelemetryPoint } from '../types/telemetry';
import { SerialLogEntry } from '../components/SerialTerminal/SerialTerminal';
import { IoTProject } from '../types/project';
import { ALL_PROJECTS, getProjectBySlug, DEFAULT_PROJECT_SLUG } from '../data/projects';
import { parseUniversalSerialLine, formatTelemetryTime } from '../utils/parseSerial';
import { useWebSerial } from '../hooks/useWebSerial';
import { useSimulation } from '../hooks/useSimulation';

const MAX_POINTS = 30;
const MAX_LOGS = 120;

export interface SerialContextValue {
  activeProject: IoTProject;
  activeSlug: string;
  setActiveSlug: (slug: string) => void;
  telemetryData: UniversalTelemetryData;
  telemetryHistory: TelemetryPoint[];
  serialLogs: SerialLogEntry[];
  clearSerialLogs: () => void;
  isConnected: boolean;
  isSimulating: boolean;
  baudRate: number;
  setBaudRate: (baud: number) => void;
  hasWebSerialSupport: boolean;
  connectSerial: () => Promise<boolean>;
  disconnectSerial: () => Promise<void>;
  toggleSimulation: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  sendRaw: (cmd: string) => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
}

const SerialContext = createContext<SerialContextValue | undefined>(undefined);

export const SerialProvider: React.FC<{ children: React.ReactNode; initialSlug?: string }> = ({
  children,
  initialSlug = DEFAULT_PROJECT_SLUG,
}) => {
  const [activeSlug, setActiveSlugState] = useState<string>(initialSlug);
  const activeProject = getProjectBySlug(activeSlug) || ALL_PROJECTS[0];

  const [telemetryData, setTelemetryData] = useState<UniversalTelemetryData>({});
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [serialLogs, setSerialLogs] = useState<SerialLogEntry[]>([]);
  const [baudRate, setBaudRate] = useState<number>(activeProject.defaultBaud);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logIdCounter = useRef<number>(0);

  // Sincroniza baud rate padrão quando o projeto muda
  useEffect(() => {
    setBaudRate(activeProject.defaultBaud);
  }, [activeProject.defaultBaud, activeSlug]);

  /**
   * Adiciona entrada ao terminal serial
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

  const clearSerialLogs = useCallback(() => {
    setSerialLogs([]);
  }, []);

  /**
   * Atualiza a telemetria com novo pacote
   */
  const handleNewTelemetry = useCallback((parsed: UniversalTelemetryData) => {
    setTelemetryData((prev) => ({
      ...prev,
      ...parsed,
    }));

    if (parsed.flightscope) {
      setTelemetryHistory((prev) => {
        const updated = [...prev, parsed.flightscope!];
        if (updated.length > MAX_POINTS) {
          return updated.slice(updated.length - MAX_POINTS);
        }
        return updated;
      });
    }
  }, []);

  /**
   * Processa linha recebida via hardware serial
   */
  const handleLineReceived = useCallback(
    (line: string) => {
      const parsed = parseUniversalSerialLine(line, activeSlug);
      if (parsed) {
        handleNewTelemetry(parsed);
      }
    },
    [activeSlug, handleNewTelemetry]
  );

  // Hook da Web Serial API
  const {
    isConnected,
    hasWebSerialSupport,
    connect: rawConnect,
    disconnect: rawDisconnect,
    send: rawSend,
  } = useWebSerial({
    baudRate,
    onLineReceived: handleLineReceived,
    onLog: addSerialLog,
    onError: setErrorMessage,
  });

  // Hook da Simulação Procedural
  const {
    isSimulating,
    startSimulation: rawStartSim,
    stopSimulation: rawStopSim,
    toggleSimulation: rawToggleSim,
  } = useSimulation({
    projectSlug: activeSlug,
    onTelemetryGenerated: handleNewTelemetry,
    onLog: addSerialLog,
  });

  const connectSerial = useCallback(async () => {
    if (isSimulating) {
      rawStopSim();
    }
    return await rawConnect();
  }, [isSimulating, rawConnect, rawStopSim]);

  const disconnectSerial = useCallback(async () => {
    await rawDisconnect();
  }, [rawDisconnect]);

  const startSimulation = useCallback(() => {
    if (isConnected) {
      rawDisconnect();
    }
    rawStartSim();
  }, [isConnected, rawDisconnect, rawStartSim]);

  const stopSimulation = useCallback(() => {
    rawStopSim();
  }, [rawStopSim]);

  const toggleSimulation = useCallback(() => {
    if (isConnected) {
      rawDisconnect();
    }
    rawToggleSim();
  }, [isConnected, rawDisconnect, rawToggleSim]);

  const sendRaw = useCallback(
    async (cmd: string) => {
      if (isConnected) {
        await rawSend(cmd);
      } else {
        addSerialLog(cmd, 'tx');
        const parsed = parseUniversalSerialLine(cmd, activeSlug);
        if (parsed) {
          handleNewTelemetry(parsed);
        }
      }
    },
    [activeSlug, addSerialLog, handleNewTelemetry, isConnected, rawSend]
  );

  const setActiveSlug = useCallback(
    (slug: string) => {
      if (slug === activeSlug) return;
      rawStopSim();
      setActiveSlugState(slug);
      setTelemetryData({});
      setTelemetryHistory([]);
      addSerialLog(`Projeto alternado para [${slug}].`, 'sys');
    },
    [activeSlug, addSerialLog, rawStopSim]
  );

  return (
    <SerialContext.Provider
      value={{
        activeProject,
        activeSlug,
        setActiveSlug,
        telemetryData,
        telemetryHistory,
        serialLogs,
        clearSerialLogs,
        isConnected,
        isSimulating,
        baudRate,
        setBaudRate,
        hasWebSerialSupport,
        connectSerial,
        disconnectSerial,
        toggleSimulation,
        startSimulation,
        stopSimulation,
        sendRaw,
        errorMessage,
        clearError: () => setErrorMessage(null),
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};

export const useSerial = () => {
  const context = useContext(SerialContext);
  if (!context) {
    throw new Error('useSerial deve ser usado dentro de um SerialProvider');
  }
  return context;
};

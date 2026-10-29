import { useState, useRef, useCallback, useEffect } from 'react';
import { UniversalTelemetryData } from '../types/telemetry';
import {
  generateFlightscopeSimPoint,
  generateSonarSimPoint,
  generateGardenSimPoint,
  generateSmartHomeSimPoint,
  generatePulseSimPoint,
} from '../utils/simulationGenerators';

export interface UseSimulationOptions {
  projectSlug: string;
  onTelemetryGenerated: (data: UniversalTelemetryData) => void;
  onLog: (text: string, type: 'rx' | 'tx' | 'sys') => void;
}

export function useSimulation({
  projectSlug,
  onTelemetryGenerated,
  onLog,
}: UseSimulationOptions) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    stopSimulation();
    setIsSimulating(true);
    onLog(`Modo Simulação iniciado para [${projectSlug}].`, 'sys');

    const intervalMs =
      projectSlug === 'flightscope'
        ? 80
        : projectSlug === 'pulse'
        ? 60
        : 120;

    intervalRef.current = window.setInterval(() => {
      let simData: UniversalTelemetryData = {};
      let logText = '';

      if (projectSlug === 'flightscope') {
        const p = generateFlightscopeSimPoint();
        simData = { flightscope: p };
        logText = `Pitch:${p.Pitch} | Roll:${p.Roll} | Radar_cm:${p.Radar_cm} | Nivel_Perigo:${p.Nivel_Perigo} | Status:${p.Status}`;
      } else if (projectSlug === 'sonar') {
        const p = generateSonarSimPoint();
        simData = { sonar: p };
        logText = `Angle:${p.angle} | Distance:${p.distance} | Danger:${p.dangerLevel} | Status:${p.status}`;
      } else if (projectSlug === 'garden') {
        const p = generateGardenSimPoint();
        simData = { garden: p };
        logText = `Temp:${p.temperature} | Humidity:${p.humidity} | Soil:${p.soilMoisture} | Light:${p.lightLevel} | Pump:${p.pumpActive ? 1 : 0} | Status:${p.status}`;
      } else if (projectSlug === 'smarthome') {
        const p = generateSmartHomeSimPoint();
        simData = { smarthome: p };
        logText = `PIR:${p.pirDetected ? 1 : 0} | Gas:${p.gasPpm} | GasAlert:${p.gasAlert ? 1 : 0} | Lux:${p.lightLux} | Temp:${p.temperature} | Status:${p.status}`;
      } else if (projectSlug === 'pulse') {
        const p = generatePulseSimPoint();
        simData = { pulse: p };
        logText = `BPM:${p.bpm} | SpO2:${p.spo2} | Wave:${p.rawWaveform} | Stress:${p.stressLevel} | Status:${p.status}`;
      }

      onTelemetryGenerated(simData);
      if (logText) {
        onLog(logText, 'rx');
      }
    }, intervalMs);
  }, [onLog, onTelemetryGenerated, projectSlug, stopSimulation]);

  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
      onLog('Simulação pausada.', 'sys');
    } else {
      startSimulation();
    }
  }, [isSimulating, onLog, startSimulation, stopSimulation]);

  // Limpa o timer de simulação ao desmontar ou trocar de projeto
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [projectSlug]);

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    toggleSimulation,
  };
}

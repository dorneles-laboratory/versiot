import {
  TelemetryPoint,
  SonarPoint,
  GardenPoint,
  SmartHomePoint,
  PulsePoint,
} from '../types/telemetry';

let simStep = 0;

export function formatSimTime(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  const ms = Math.floor(date.getMilliseconds() / 100);
  return `${h}:${m}:${s}.${ms}`;
}

/**
 * Gerador de telemetria simulada para o FlightScope (Aeroespacial)
 */
export function generateFlightscopeSimPoint(): TelemetryPoint {
  simStep++;
  const now = new Date();
  const t = simStep * 0.08;

  // Manobra suave de voo: ondas senoidais combinadas
  const pitch = Math.sin(t * 0.7) * 18.0 + Math.cos(t * 1.5) * 4.0;
  const roll = Math.sin(t * 0.5) * 35.0 + Math.cos(t * 1.2) * 8.0;

  // Radar simula relevo de solo ondulado aproximando e afastando
  const radar = 28.0 + Math.sin(t * 0.4) * 16.0 + Math.sin(t * 1.8) * 5.0;
  const clampedRadar = Math.max(8.0, Math.min(55.0, radar));

  let danger = 0;
  let status = 'Voo Estabilizado';
  if (clampedRadar < 15.0) {
    danger = 2;
    status = 'ALERTA TERRENO CRITICO!';
  } else if (clampedRadar < 25.0) {
    danger = 1;
    status = 'Aproximacao de Relevo';
  }

  return {
    id: simStep,
    time: formatSimTime(now),
    timestamp: now.getTime(),
    Pitch: parseFloat(pitch.toFixed(1)),
    Roll: parseFloat(roll.toFixed(1)),
    Radar_cm: parseFloat(clampedRadar.toFixed(1)),
    Nivel_Perigo: danger,
    Status: status,
  };
}

/**
 * Gerador de telemetria simulada para o SonarScope (Radar 180°)
 */
let sonarAngle = 15;
let sonarDir = 1;
export function generateSonarSimPoint(): SonarPoint {
  simStep++;
  const now = new Date();

  // Movimenta o ângulo de 15 a 165
  sonarAngle += sonarDir * 3;
  if (sonarAngle >= 165) {
    sonarAngle = 165;
    sonarDir = -1;
  } else if (sonarAngle <= 15) {
    sonarAngle = 15;
    sonarDir = 1;
  }

  // Simula 2 obstáculos em posições fixas no espaço:
  // Obstáculo 1 em 45° (~22 cm)
  // Obstáculo 2 em 120° (~35 cm)
  let dist = 85.0 + Math.sin(simStep * 0.2) * 8.0; // Fundo limpo distante

  const diffObj1 = Math.abs(sonarAngle - 45);
  const diffObj2 = Math.abs(sonarAngle - 120);

  if (diffObj1 < 12) {
    dist = 18.0 + diffObj1 * 0.8 + (Math.random() * 2 - 1);
  } else if (diffObj2 < 14) {
    dist = 32.0 + diffObj2 * 0.9 + (Math.random() * 2 - 1);
  }

  const danger = dist < 20 ? 2 : dist < 35 ? 1 : 0;
  const status = danger === 2 ? 'ALVO CRITICO' : danger === 1 ? 'Alvo Detectado' : 'Varredura Normal';

  return {
    id: simStep,
    time: formatSimTime(now),
    timestamp: now.getTime(),
    angle: sonarAngle,
    distance: parseFloat(dist.toFixed(1)),
    detected: dist < 50,
    dangerLevel: danger,
    status,
  };
}

/**
 * Gerador de telemetria simulada para o BioScope (Estufa/Terrário)
 */
export function generateGardenSimPoint(): GardenPoint {
  simStep++;
  const now = new Date();
  const t = simStep * 0.05;

  // Ciclo de luz e temperatura simulados
  const light = Math.floor(550 + Math.sin(t * 0.5) * 350 + Math.random() * 20);
  const temp = 24.5 + Math.sin(t * 0.3) * 4.5 + Math.random() * 0.4;
  const humidity = 62.0 + Math.cos(t * 0.4) * 15.0 + Math.random() * 1.5;
  const soil = Math.floor(52 + Math.sin(t * 0.2) * 20 + Math.random() * 3);

  const pumpActive = soil < 35;
  const status = pumpActive ? 'Irrigando Solo Seco' : temp > 30 ? 'Ventilacao Ativada' : 'Clima Ideal';

  return {
    id: simStep,
    time: formatSimTime(now),
    timestamp: now.getTime(),
    temperature: parseFloat(temp.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    soilMoisture: Math.max(10, Math.min(95, soil)),
    lightLevel: Math.max(50, Math.min(1000, light)),
    pumpActive,
    status,
  };
}

/**
 * Gerador de telemetria simulada para o HomeScope (Casa Inteligente)
 */
export function generateSmartHomeSimPoint(): SmartHomePoint {
  simStep++;
  const now = new Date();

  // Simula presença intermitente
  const pirDetected = (Math.sin(simStep * 0.1) > 0.3);
  const gasAlert = (Math.sin(simStep * 0.04) > 0.85); // Alerta raro para demonstração
  const gasPpm = gasAlert ? Math.floor(450 + Math.random() * 200) : Math.floor(90 + Math.random() * 40);
  const lightLux = Math.floor(450 + Math.sin(simStep * 0.05) * 300);
  const temp = parseFloat((23.2 + Math.sin(simStep * 0.02) * 1.8).toFixed(1));

  const status = gasAlert
    ? 'ALERTA DE FUMACA/GAS!'
    : pirDetected
    ? 'Presenca Detectada na Sala'
    : 'Ambiente Seguro';

  return {
    id: simStep,
    time: formatSimTime(now),
    timestamp: now.getTime(),
    pirDetected,
    gasPpm,
    gasAlert,
    lightLux,
    temperature: temp,
    lampLivingRoom: pirDetected,
    lampKitchen: gasAlert || !pirDetected && (lightLux < 300),
    status,
  };
}

/**
 * Gerador de telemetria simulada para o PulseScope (Cyberpunk Biometric)
 */
let ecgPhase = 0;
export function generatePulseSimPoint(): PulsePoint {
  simStep++;
  const now = new Date();

  // BPM oscila suavemente entre 68 e 84 bpm
  const bpm = Math.floor(74 + Math.sin(simStep * 0.04) * 8);
  const spo2 = Math.min(99, Math.max(96, Math.floor(98 + (Math.random() > 0.8 ? -1 : 0))));
  const hrv = Math.floor(45 + Math.sin(simStep * 0.05) * 15);

  // Simula forma de onda ECG (P, Q, R, S, T)
  ecgPhase = (ecgPhase + 1) % 20;
  let wave = 300; // Linha isoelétrica base
  if (ecgPhase === 4) wave = 360; // Onda P
  else if (ecgPhase === 7) wave = 200; // Onda Q
  else if (ecgPhase === 8) wave = 950; // Pico R
  else if (ecgPhase === 9) wave = 120; // Onda S
  else if (ecgPhase === 13) wave = 420; // Onda T
  else wave = 300 + Math.floor(Math.random() * 20 - 10);

  const stressLevel = bpm > 90 ? 'Alto' : bpm > 78 ? 'Moderado' : 'Baixo';
  const status = 'Sinais Vitais Estaveis';

  return {
    id: simStep,
    time: formatSimTime(now),
    timestamp: now.getTime(),
    bpm,
    spo2,
    hrv,
    fingerDetected: true,
    stressLevel,
    rawWaveform: wave,
    status,
  };
}

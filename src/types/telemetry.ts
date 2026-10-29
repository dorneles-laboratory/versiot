// Telemetria do Projeto FlightScope (Compatibilidade direta)
export interface TelemetryPoint {
  id: number;
  time: string;
  timestamp: number;
  Pitch: number;
  Roll: number;
  Radar_cm: number;
  Nivel_Perigo: number;
  Status: string;
}

// Telemetria do Projeto Radar Sonar 180°
export interface SonarPoint {
  id: number;
  time: string;
  timestamp: number;
  angle: number;       // 0 a 180 graus
  distance: number;    // distância em cm (0 a 100+)
  detected: boolean;   // true se há obstáculo próximo
  dangerLevel: number; // 0: seguro, 1: atenção, 2: perigo
  status: string;
}

// Telemetria do Projeto Estufa / Terrário
export interface GardenPoint {
  id: number;
  time: string;
  timestamp: number;
  temperature: number; // °C
  humidity: number;    // % umidade do ar
  soilMoisture: number;// % umidade do solo (0-100)
  lightLevel: number;  // 0-1000 lux ou %
  pumpActive: boolean; // status irrigação
  status: string;
}

// Telemetria do Projeto Casa Inteligente
export interface SmartHomePoint {
  id: number;
  time: string;
  timestamp: number;
  pirDetected: boolean;// presença detectada
  gasPpm: number;      // PPM de gás/fumaça
  gasAlert: boolean;   // alerta de vazamento/fumaça
  lightLux: number;    // luminosidade externa
  temperature: number; // °C interna
  lampLivingRoom: boolean;
  lampKitchen: boolean;
  status: string;
}

// Telemetria do Projeto Monitor Biométrico
export interface PulsePoint {
  id: number;
  time: string;
  timestamp: number;
  bpm: number;         // Batimentos por minuto (ex: 72)
  spo2: number;        // Saturação de Oxigênio % (ex: 98)
  hrv: number;         // Variabilidade cardíaca em ms
  fingerDetected: boolean;
  stressLevel: 'Baixo' | 'Moderado' | 'Alto';
  rawWaveform: number; // Valor analógico instantâneo para traçado de ECG (0-1023)
  status: string;
}

// Tipo unificado de telemetria
export type UniversalTelemetryData = {
  flightscope?: TelemetryPoint;
  sonar?: SonarPoint;
  garden?: GardenPoint;
  smarthome?: SmartHomePoint;
  pulse?: PulsePoint;
  rawString?: string;
};

export type DangerCategory = 'safe' | 'alert' | 'critical';

export interface ParseResult {
  success: boolean;
  data?: UniversalTelemetryData;
  raw: string;
  error?: string;
}

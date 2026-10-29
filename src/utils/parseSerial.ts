import type {
  TelemetryPoint,
  SonarPoint,
  GardenPoint,
  SmartHomePoint,
  PulsePoint,
  UniversalTelemetryData,
} from '../types/telemetry';

let pointCounter = 0;

export function formatTelemetryTime(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  const ms = Math.floor(date.getMilliseconds() / 100);
  return `${h}:${m}:${s}.${ms}`;
}

/**
 * Utilitário para quebrar uma string no formato "Chave:Valor | Chave2:Valor" em um dicionário
 */
export function parseKeyValuePairs(line: string): Record<string, string> {
  const result: Record<string, string> = {};
  // Suporta separadores por pipe (|) ou vírgula (,)
  const parts = line.split(/[|,]/);
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx !== -1) {
      const key = part.slice(0, colonIdx).trim().toLowerCase();
      const val = part.slice(colonIdx + 1).trim();
      if (key && val) {
        result[key] = val;
      }
    }
  }
  return result;
}

/**
 * Parser universal para a linha recebida da porta serial
 */
export function parseUniversalSerialLine(
  line: string,
  projectId: string
): UniversalTelemetryData | null {
  const cleanLine = line.trim();
  if (!cleanLine) return null;

  const now = new Date();
  const timeStr = formatTelemetryTime(now);
  const timestamp = now.getTime();
  pointCounter++;

  // Tentativa 1: Parse JSON se começar com '{'
  if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
    try {
      const json = JSON.parse(cleanLine);
      return parseFromDict(json, projectId, pointCounter, timeStr, timestamp, cleanLine);
    } catch {
      // Ignora erro de JSON e tenta key-value
    }
  }

  // Tentativa 2: Parse Key-Value (Pipe ou Vírgula)
  const dict = parseKeyValuePairs(cleanLine);
  if (Object.keys(dict).length > 0) {
    return parseFromDict(dict, projectId, pointCounter, timeStr, timestamp, cleanLine);
  }

  return { rawString: cleanLine };
}

function parseFromDict(
  rawDict: Record<string, any>,
  projectId: string,
  id: number,
  time: string,
  timestamp: number,
  rawLine: string
): UniversalTelemetryData {
  // Converte chaves para minúsculo para busca insensível a maiúsculas
  const d: Record<string, any> = {};
  for (const k of Object.keys(rawDict)) {
    d[k.toLowerCase()] = rawDict[k];
  }

  if (projectId === 'flightscope') {
    const pitch = parseFloat(d['pitch'] ?? d['p'] ?? 0);
    const roll = parseFloat(d['roll'] ?? d['r'] ?? 0);
    const radar = parseFloat(d['radar_cm'] ?? d['radar'] ?? d['distance'] ?? 30);
    const danger = parseInt(d['nivel_perigo'] ?? d['danger'] ?? 0, 10);
    const status = String(d['status'] ?? 'Voo Normal');

    const point: TelemetryPoint = {
      id,
      time,
      timestamp,
      Pitch: Number.isFinite(pitch) ? Math.max(-180, Math.min(180, pitch)) : 0,
      Roll: Number.isFinite(roll) ? Math.max(-180, Math.min(180, roll)) : 0,
      Radar_cm: Number.isFinite(radar) ? Math.max(0, Math.min(150, radar)) : 30,
      Nivel_Perigo: Number.isFinite(danger) ? Math.max(0, Math.min(2, danger)) : 0,
      Status: status,
    };
    return { flightscope: point, rawString: rawLine };
  }

  if (projectId === 'sonar') {
    const angle = parseInt(d['angle'] ?? d['ang'] ?? d['grau'] ?? 90, 10);
    const distance = parseFloat(d['distance'] ?? d['dist'] ?? d['distancia'] ?? 50);
    const danger = parseInt(d['danger'] ?? (distance < 20 ? 2 : distance < 40 ? 1 : 0), 10);
    const status = String(d['status'] ?? (danger === 2 ? 'ALVO CRITICO' : danger === 1 ? 'Alvo Detectado' : 'Varredura'));

    const point: SonarPoint = {
      id,
      time,
      timestamp,
      angle: Math.max(0, Math.min(180, angle)),
      distance: Number.isFinite(distance) ? Math.max(0, Math.min(200, distance)) : 100,
      detected: distance < 60,
      dangerLevel: danger,
      status,
    };
    return { sonar: point, rawString: rawLine };
  }

  if (projectId === 'garden') {
    const temp = parseFloat(d['temp'] ?? d['temperature'] ?? 24);
    const hum = parseFloat(d['humidity'] ?? d['hum'] ?? 60);
    const soil = parseInt(d['soil'] ?? d['soilmoisture'] ?? d['umidade_solo'] ?? 50, 10);
    const light = parseInt(d['light'] ?? d['lightlevel'] ?? d['lux'] ?? 500, 10);
    const pump = parseInt(d['pump'] ?? d['bomba'] ?? 0, 10) === 1;
    const status = String(d['status'] ?? (pump ? 'Irrigando' : 'Clima Ideal'));

    const point: GardenPoint = {
      id,
      time,
      timestamp,
      temperature: Number.isFinite(temp) ? temp : 24,
      humidity: Number.isFinite(hum) ? hum : 60,
      soilMoisture: Number.isFinite(soil) ? Math.max(0, Math.min(100, soil)) : 50,
      lightLevel: Number.isFinite(light) ? Math.max(0, Math.min(1000, light)) : 500,
      pumpActive: pump,
      status,
    };
    return { garden: point, rawString: rawLine };
  }

  if (projectId === 'smarthome') {
    const pir = parseInt(d['pir'] ?? d['presence'] ?? 0, 10) === 1;
    const gas = parseInt(d['gas'] ?? d['gaspmp'] ?? d['fumaca'] ?? 100, 10);
    const gasAlert = parseInt(d['gasalert'] ?? (gas > 350 ? 1 : 0), 10) === 1;
    const lux = parseInt(d['lux'] ?? d['light'] ?? 400, 10);
    const temp = parseFloat(d['temp'] ?? 23.5);
    const lamp = parseInt(d['lampsala'] ?? (pir ? 1 : 0), 10) === 1;
    const status = String(d['status'] ?? (gasAlert ? 'ALERTA DE FUMACA!' : pir ? 'Presenca Detectada' : 'Seguro'));

    const point: SmartHomePoint = {
      id,
      time,
      timestamp,
      pirDetected: pir,
      gasPpm: gas,
      gasAlert,
      lightLux: lux,
      temperature: temp,
      lampLivingRoom: lamp,
      lampKitchen: gasAlert,
      status,
    };
    return { smarthome: point, rawString: rawLine };
  }

  if (projectId === 'pulse') {
    const bpm = parseInt(d['bpm'] ?? d['heartrate'] ?? 72, 10);
    const spo2 = parseInt(d['spo2'] ?? d['oxigenio'] ?? 98, 10);
    const wave = parseInt(d['wave'] ?? d['raw'] ?? d['ecg'] ?? 400, 10);
    const stress = String(d['stress'] ?? (bpm > 95 ? 'Alto' : bpm > 80 ? 'Moderado' : 'Baixo')) as any;
    const status = String(d['status'] ?? 'Sinais Vitais Estaveis');

    const point: PulsePoint = {
      id,
      time,
      timestamp,
      bpm: Math.max(0, Math.min(220, bpm)),
      spo2: Math.max(0, Math.min(100, spo2)),
      hrv: 45,
      fingerDetected: bpm > 0,
      stressLevel: stress,
      rawWaveform: Math.max(0, Math.min(1023, wave)),
      status,
    };
    return { pulse: point, rawString: rawLine };
  }

  return { rawString: rawLine };
}

// Mantido para compatibilidade com FlightScope original
export function parseSerialLine(line: string): TelemetryPoint | null {
  const res = parseUniversalSerialLine(line, 'flightscope');
  return res?.flightscope ?? null;
}

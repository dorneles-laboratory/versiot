export type ProjectCategory =
  | 'Aeroespacial'
  | 'Robótica & Radar'
  | 'Ambiente & Estufa'
  | 'Domótica & Automação'
  | 'Saúde & Biometria';

export type ProjectDifficulty = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface ProjectComponent {
  name: string;
  quantity: number;
  description: string;
  role: string;
}

export interface PinConnection {
  pinMicro: string;
  pinSensor: string;
  sensor: string;
  wireColor: string;
  notes?: string;
}

export interface FirmwareInfo {
  filename: string;
  language: 'cpp';
  code: string;
  libraries: { name: string; author?: string; installGuide: string }[];
  instructions: string;
  notes?: string;
}

export interface TelemetryFieldConfig {
  key: string;
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
  icon?: string;
}

export interface IoTProject {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  badge: string;
  accentColor: string;
  defaultBaud: number;
  components: ProjectComponent[];
  pinout: PinConnection[];
  circuitWarnings: string[];
  firmware: FirmwareInfo;
  telemetryFields: TelemetryFieldConfig[];
  samplePayload: string;
  payloadFormatDescription: string;
}

export type ProjectCategoryKey =
  | 'aerospace'
  | 'robotics'
  | 'climate'
  | 'automation'
  | 'health';

export type ProjectDifficultyKey = 'beginner' | 'intermediate' | 'advanced';

export type MicrocontrollerType = 'ESP32' | 'Arduino' | 'Raspberry Pi';

export type ProjectCategory =
  | 'Aeroespacial'
  | 'Robótica & Radar'
  | 'Ambiente & Clima'
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
  slug: string;
  id?: string; // backwards compatibility alias for slug
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  category: ProjectCategory;
  categoryKey: ProjectCategoryKey;
  difficulty: ProjectDifficulty;
  difficultyKey: ProjectDifficultyKey;
  microcontrollers: MicrocontrollerType[];
  featured: boolean;
  thumbnail?: string;
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

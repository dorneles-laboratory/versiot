import { IoTProject } from '../../types/project';

export const smarthomeProject: IoTProject = {
  slug: 'smarthome',
  id: 'smarthome',
  name: 'HomeScope — Casa Inteligente 3D Interativa',
  shortName: 'HomeScope',
  tagline: 'Maquete isométrica 3D com automação residencial, detecção de presença e alarme de gás.',
  description:
    'Uma central de automação residencial futurista (Smart Home). Utiliza sensor infravermelho de movimento (PIR HC-SR501), sensor eletroquímico de gás/fumaça (MQ-2) e fotorresistor crepuscular (LDR). Na maquete 3D isométrica, as luzes da sala e cômodos acendem dinamicamente quando alguém entra, luzes externas ligam ao anoitecer e um alarme visual pulsante com efeito de fumaça é disparado se houver vazamento de gás ou fumaça.',
  icon: '🏠',
  category: 'Domótica & Automação',
  categoryKey: 'automation',
  difficulty: 'Intermediário',
  difficultyKey: 'intermediate',
  microcontrollers: ['ESP32', 'Arduino'],
  featured: true,
  badge: 'Isométrico 3D',
  accentColor: '#8b5cf6',
  defaultBaud: 115200,
  components: [
    {
      name: 'Arduino Uno / Nano ou ESP32',
      quantity: 1,
      role: 'Hub de Automação',
      description: 'Processa sensores de segurança, gás e automação de iluminação.',
    },
    {
      name: 'Sensor de Presença PIR HC-SR501',
      quantity: 1,
      role: 'Detecção de ocupação humana',
      description: 'Sensor piroelétrico que detecta radiação infravermelha do corpo humano.',
    },
    {
      name: 'Sensor de Fumaça e Gás Inflamável MQ-2',
      quantity: 1,
      role: 'Alarme contra incêndio e gás',
      description: 'Mede concentração de GLP, propano, metano e partículas de fumaça em PPM.',
    },
    {
      name: 'Fotorresistor LDR 5mm + Resistor 10kΩ',
      quantity: 1,
      role: 'Sensor crepuscular',
      description: 'Detecta se é dia ou noite para automação das lâmpadas da fachada.',
    },
    {
      name: 'LEDs Indicadores (Branco, Vermelho e Verde)',
      quantity: 3,
      role: 'Atuadores visuais',
      description: 'Simulam as lâmpadas dos cômodos e sinalizador de emergência.',
    },
  ],
  pinout: [
    {
      pinMicro: '5V',
      pinSensor: 'VCC',
      sensor: 'PIR HC-SR501',
      wireColor: '#ff4444',
      notes: 'Alimentação do PIR.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'PIR HC-SR501',
      wireColor: '#333333',
      notes: 'Terra comum.',
    },
    {
      pinMicro: 'Pino Digital 2',
      pinSensor: 'OUT',
      sensor: 'PIR HC-SR501',
      wireColor: '#8b5cf6',
      notes: 'Sinal digital HIGH quando movimento detectado.',
    },
    {
      pinMicro: '5V',
      pinSensor: 'VCC',
      sensor: 'MQ-2 Gás',
      wireColor: '#ff4444',
      notes: 'Requer 5V estáveis para o filamento de aquecimento interno.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'MQ-2 Gás',
      wireColor: '#333333',
      notes: 'Terra.',
    },
    {
      pinMicro: 'A0 (Analógico)',
      pinSensor: 'AOUT',
      sensor: 'MQ-2 Gás',
      wireColor: '#ef4444',
      notes: 'Tensão proporcional à concentração de gás/fumaça.',
    },
    {
      pinMicro: 'A1 (Analógico)',
      pinSensor: 'Divisor LDR',
      sensor: 'LDR Crepuscular',
      wireColor: '#f59e0b',
      notes: 'Luminosidade ambiente externa.',
    },
    {
      pinMicro: 'Pino Digital 8',
      pinSensor: 'Anodo (+) via 220Ω',
      sensor: 'LED Sala de Estar',
      wireColor: '#38bdf8',
      notes: 'Lâmpada inteligente simulada.',
    },
  ],
  circuitWarnings: [
    'O sensor de gás MQ-2 possui um aquecedor interno e aquece consideravelmente durante o uso normal; isso é esperado e não significa curto-circuito.',
    'Aguarde cerca de 1 a 2 minutos após ligar o sensor MQ-2 para que o filamento atinja a temperatura correta de sensibilidade antes de calibrar a leitura.',
    'O sensor PIR HC-SR501 necessita de cerca de 30 a 60 segundos após ligado para estabilizar o infravermelho ambiente.',
  ],
  firmware: {
    filename: 'smarthome_automation.ino',
    language: 'cpp',
    instructions:
      'Conecte o PIR no pino digital 2, o MQ-2 no analógico A0 e o LDR no A1. Não necessita de bibliotecas externas complexas.',
    libraries: [],
    code: `/*
 * ==============================================================================
 *  VersIOT - HomeScope 3D Smart Home Automation Firmware
 *  Hardware: Arduino Uno/Nano + PIR HC-SR501 + MQ-2 Gas + LDR
 *  Baud Rate: 115200 bps
 * ==============================================================================
 */

const int PIR_PIN = 2;
const int MQ2_ANALOG_PIN = A0;
const int LDR_ANALOG_PIN = A1;
const int LAMP_SALA_PIN = 8;
const int BUZZER_PIN = 9;

// Limiares de automação
const int GAS_ALERT_THRESHOLD = 380; // Acima deste valor indica fumaça/gás perigoso
const int NIGHT_THRESHOLD = 300;     // Abaixo deste valor é considerado noite

unsigned long lastTransmit = 0;
const unsigned long INTERVAL_MS = 100; // 10 Hz

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  pinMode(PIR_PIN, INPUT);
  pinMode(LAMP_SALA_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LAMP_SALA_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void loop() {
  unsigned long now = millis();
  if (now - lastTransmit >= INTERVAL_MS) {
    lastTransmit = now;

    int pirState = digitalRead(PIR_PIN);
    int gasRaw = analogRead(MQ2_ANALOG_PIN);
    int ldrRaw = analogRead(LDR_ANALOG_PIN);

    // Mapeamento aproximado em PPM para visualização
    int gasPpm = map(gasRaw, 0, 1023, 50, 1200);

    bool gasAlert = (gasRaw >= GAS_ALERT_THRESHOLD);
    bool isNight = (ldrRaw < NIGHT_THRESHOLD);

    // Lógica da lâmpada da sala: acende se houver movimento à noite ou presença ativa
    bool lampLivingRoom = (pirState == HIGH);
    digitalWrite(LAMP_SALA_PIN, lampLivingRoom ? HIGH : LOW);

    // Alarme sonoro em caso de fumaça
    if (gasAlert) {
      tone(BUZZER_PIN, 1800, 80);
    } else {
      noTone(BUZZER_PIN);
    }

    String statusText = "Ambiente Seguro";
    if (gasAlert) {
      statusText = "ALERTA DE FUMACA/GAS!";
    } else if (pirState == HIGH) {
      statusText = "Presenca Detectada";
    } else if (isNight) {
      statusText = "Modo Noturno Ativo";
    }

    // Transmissão padronizada VersIOT
    Serial.print("PIR:");
    Serial.print(pirState);
    Serial.print(" | Gas:");
    Serial.print(gasPpm);
    Serial.print(" | GasAlert:");
    Serial.print(gasAlert ? 1 : 0);
    Serial.print(" | Lux:");
    Serial.print(ldrRaw);
    Serial.print(" | Temp:23.8"); // Temperatura simulada da casa
    Serial.print(" | LampSala:");
    Serial.print(lampLivingRoom ? 1 : 0);
    Serial.print(" | Status:");
    Serial.println(statusText);
  }
}
`,
  },
  telemetryFields: [
    { key: 'pirDetected', label: 'Presença (PIR)', unit: '', color: '#8b5cf6', min: 0, max: 1, icon: '🚶' },
    { key: 'gasPpm', label: 'Gás / Fumaça', unit: 'PPM', color: '#ef4444', min: 0, max: 1000, icon: '🔥' },
    { key: 'gasAlert', label: 'Alerta Incêndio', unit: '', color: '#dc2626', min: 0, max: 1, icon: '🚨' },
    { key: 'lightLux', label: 'Claridade Externa', unit: 'lux', color: '#f59e0b', min: 0, max: 1000, icon: '💡' },
    { key: 'lampLivingRoom', label: 'Luz da Sala', unit: '', color: '#38bdf8', min: 0, max: 1, icon: '🛋️' },
  ],
  samplePayload: 'PIR:1 | Gas:145 | GasAlert:0 | Lux:420 | Temp:23.8 | LampSala:1 | Status:Presenca Detectada',
  payloadFormatDescription: 'Flags de presença, concentração PPM de gás, nível de luz e lâmpadas.',
};

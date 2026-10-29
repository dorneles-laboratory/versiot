import { IoTProject } from '../../types/project';

export const sonarProject: IoTProject = {
  id: 'sonar',
  name: 'SonarScope — Radar Sonar Militar 180°',
  shortName: 'SonarScope',
  tagline: 'Varredura angular de 180° com servo motor e sonar ultrassônico simulando radar tático militar.',
  description:
    'Um sistema clássico e empolgante de robótica onde um sensor ultrassônico HC-SR04 é montado sobre um micro servomotor SG90. Conforme o servo varre continuamente de 15° a 165°, o microcontrolador transmite o ângulo atual e a distância detectada. O visualizador reproduz um autêntico monitor CRT de radar militar verde com feixe giratório, persistência de fósforo e detecção holográfica de alvos.',
  icon: '📡',
  category: 'Robótica & Radar',
  difficulty: 'Iniciante',
  badge: 'Radar Tático',
  accentColor: '#00ff88',
  defaultBaud: 115200,
  components: [
    {
      name: 'Arduino Uno ou Nano',
      quantity: 1,
      role: 'Processador de controle',
      description: 'Gera sinais PWM para o servo e mede o tempo de eco do sensor HC-SR04.',
    },
    {
      name: 'Micro Servo Motor SG90 (9g)',
      quantity: 1,
      role: 'Atuador rotacional',
      description: 'Gira o sensor ultrassônico em um arco contínuo de 180 graus.',
    },
    {
      name: 'Sensor Ultrassônico HC-SR04',
      quantity: 1,
      role: 'Emissor/Receptor Sonar',
      description: 'Emite rajadas de ultrassom a 40 kHz e mede ecos de retorno.',
    },
    {
      name: 'Suporte Articulado / Bracket para HC-SR04',
      quantity: 1,
      role: 'Montagem mecânica',
      description: 'Fixa o sensor ultrassônico no eixo da cruzeta do servo motor.',
    },
  ],
  pinout: [
    {
      pinMicro: '5V',
      pinSensor: 'VCC',
      sensor: 'HC-SR04',
      wireColor: '#ff4444',
      notes: 'Alimentação de 5V do sonar.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'HC-SR04',
      wireColor: '#333333',
      notes: 'GND comum.',
    },
    {
      pinMicro: 'Pino Digital 9',
      pinSensor: 'TRIG',
      sensor: 'HC-SR04',
      wireColor: '#00e5ff',
      notes: 'Gatilho de pulso sonoro.',
    },
    {
      pinMicro: 'Pino Digital 10',
      pinSensor: 'ECHO',
      sensor: 'HC-SR04',
      wireColor: '#9933ff',
      notes: 'Eco de recepção sonoro.',
    },
    {
      pinMicro: 'Pino Digital 11',
      pinSensor: 'Sinal (Laranja)',
      sensor: 'Servo SG90',
      wireColor: '#ff9900',
      notes: 'Controle PWM do ângulo do servo.',
    },
    {
      pinMicro: '5V (ou fonte ext.)',
      pinSensor: 'VCC (Vermelho)',
      sensor: 'Servo SG90',
      wireColor: '#ff4444',
      notes: 'Alimentação do servo (pode puxar até 250mA em pico).',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND (Marrom)',
      sensor: 'Servo SG90',
      wireColor: '#333333',
      notes: 'GND do servo.',
    },
  ],
  circuitWarnings: [
    'Servos motores geram picos de corrente ao mudar de direção abruptamente. Se o Arduino reiniciar sozinho, use um capacitor eletrolítico de 100µF a 470µF entre o 5V e o GND do servo.',
    'Nunca force o braço do servo manualmente com as mãos enquanto ele estiver energizado para não quebrar as engrenagens de nylon.',
    'Mantenha a varredura entre 15° e 165° para evitar estresse mecânico nos batentes finais do servo SG90.',
  ],
  firmware: {
    filename: 'sonar_radar_180.ino',
    language: 'cpp',
    instructions:
      'Utiliza a biblioteca nativa Servo.h já inclusa na Arduino IDE. Carregue o código, posicione o sensor com visão desimpedida e abra a porta a 115200 baud.',
    libraries: [
      {
        name: 'Servo',
        author: 'Michael Margolis / Arduino',
        installGuide: 'Biblioteca nativa pré-instalada na Arduino IDE.',
      },
    ],
    code: `/*
 * ==============================================================================
 *  VersIOT - SonarScope 180° Tactical Radar Firmware
 *  Hardware: Arduino Uno/Nano + Servo SG90 + HC-SR04 Sonar
 *  Baud Rate: 115200 bps
 * ==============================================================================
 */

#include <Servo.h>

Servo radarServo;

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int SERVO_PIN = 11;

// Limites seguros de varredura mecânica
const int MIN_ANGLE = 15;
const int MAX_ANGLE = 165;
const int ANGLE_STEP = 2; // Passo de rotação em graus

int currentAngle = MIN_ANGLE;
int sweepDirection = 1; // 1 = avançando, -1 = retornando

float calculateDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Timeout de 20ms (~3.4m máx)
  long duration = pulseIn(ECHO_PIN, HIGH, 20000);
  if (duration == 0) return 100.0; // Sem eco detectado

  float distance = (duration * 0.0343) / 2.0;
  if (distance < 2.0 || distance > 100.0) return 100.0;
  return distance;
}

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  radarServo.attach(SERVO_PIN);
  radarServo.write(currentAngle);
  delay(500);
}

void loop() {
  radarServo.write(currentAngle);
  delay(35); // Tempo para o servo estabilizar fisicamente a posição

  float distance = calculateDistanceCm();

  int danger = 0;
  String statusMsg = "Rastreamento";

  if (distance < 15.0) {
    danger = 2;
    statusMsg = "ALVO CRITICO!";
  } else if (distance < 30.0) {
    danger = 1;
    statusMsg = "Alvo Detectado";
  }

  // Transmissão padronizada VersIOT
  Serial.print("Angle:");
  Serial.print(currentAngle);
  Serial.print(" | Distance:");
  Serial.print(distance, 1);
  Serial.print(" | Danger:");
  Serial.print(danger);
  Serial.print(" | Status:");
  Serial.println(statusMsg);

  // Incrementa a varredura e inverte nas bordas
  currentAngle += sweepDirection * ANGLE_STEP;
  if (currentAngle >= MAX_ANGLE) {
    currentAngle = MAX_ANGLE;
    sweepDirection = -1;
  } else if (currentAngle <= MIN_ANGLE) {
    currentAngle = MIN_ANGLE;
    sweepDirection = 1;
  }
}
`,
  },
  telemetryFields: [
    { key: 'angle', label: 'Ângulo de Varredura', unit: '°', color: '#00ff88', min: 0, max: 180, icon: '🧭' },
    { key: 'distance', label: 'Distância do Obstáculo', unit: 'cm', color: '#00e5ff', min: 0, max: 100, icon: '📏' },
    { key: 'danger', label: 'Proximidade / Ameaça', unit: '', color: '#ff3366', min: 0, max: 2, icon: '🎯' },
  ],
  samplePayload: 'Angle:72 | Distance:21.4 | Danger:1 | Status:Alvo Detectado',
  payloadFormatDescription: 'Ângulo da cruzeta (15° a 165°) e distância sonoplotada em centímetros.',
};

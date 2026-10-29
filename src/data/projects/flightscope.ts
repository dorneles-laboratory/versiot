import { IoTProject } from '../../types/project';

export const flightscopeProject: IoTProject = {
  slug: 'flightscope',
  id: 'flightscope',
  name: 'FlightScope — Telemetria Aeroespacial & HUD 3D',
  shortName: 'FlightScope',
  tagline: 'Simulador de voo militar 3D fotorrealista com cockpit 1:1, horizonte artificial e radar.',
  description:
    'Sistema de telemetria inercial de alta fidelidade conectado a uma Unidade de Medição Inercial (IMU MPU-6050) de 6 eixos e um sensor sonar ultrassônico (HC-SR04). O simulador 3D renderiza uma aeronave caça delta e uma cabine de pilotagem com Head-Up Display (HUD) em tempo real, calculando atitude (Pitch, Roll) e altitude radar com interpolação suave a até 144 FPS.',
  icon: '✈️',
  category: 'Aeroespacial',
  categoryKey: 'aerospace',
  difficulty: 'Intermediário',
  difficultyKey: 'intermediate',
  microcontrollers: ['ESP32', 'Arduino'],
  featured: true,
  badge: '3D Fotorrealista',
  accentColor: '#00e5ff',
  defaultBaud: 115200,
  components: [
    {
      name: 'Arduino Uno / Nano / ESP32',
      quantity: 1,
      role: 'Microcontrolador principal',
      description: 'Lê os barramentos I2C e digital e transmite os pacotes seriais a 115200 baud.',
    },
    {
      name: 'IMU MPU-6050 (Acelerômetro + Giroscópio)',
      quantity: 1,
      role: 'Sensor de Atitude Inercial',
      description: 'Mede os ângulos de arfagem (Pitch) e rolamento (Roll) via barramento I2C.',
    },
    {
      name: 'Sensor Ultrassônico HC-SR04',
      quantity: 1,
      role: 'Radar Altimétrico / Proximidade',
      description: 'Calcula a distância do solo ou obstáculos em centímetros com pulsos sonares.',
    },
    {
      name: 'Protoboard & Jumpers Macho-Fêmea',
      quantity: 1,
      role: 'Interconexão',
      description: 'Conecta os módulos ao microcontrolador com flexibilidade.',
    },
  ],
  pinout: [
    {
      pinMicro: '5V ou 3.3V',
      pinSensor: 'VCC',
      sensor: 'MPU-6050',
      wireColor: '#ff4444',
      notes: 'Alimentação do módulo MPU-6050.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'MPU-6050',
      wireColor: '#333333',
      notes: 'Referência de terra comum.',
    },
    {
      pinMicro: 'A4 (SDA)',
      pinSensor: 'SDA',
      sensor: 'MPU-6050',
      wireColor: '#00cc88',
      notes: 'Linha de dados I2C (No ESP32 use GPIO 21).',
    },
    {
      pinMicro: 'A5 (SCL)',
      pinSensor: 'SCL',
      sensor: 'MPU-6050',
      wireColor: '#ffaa00',
      notes: 'Linha de clock I2C (No ESP32 use GPIO 22).',
    },
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
      notes: 'Terra comum.',
    },
    {
      pinMicro: 'Pino Digital 9',
      pinSensor: 'TRIG',
      sensor: 'HC-SR04',
      wireColor: '#00e5ff',
      notes: 'Pulso de disparo ultrassônico (Output).',
    },
    {
      pinMicro: 'Pino Digital 10',
      pinSensor: 'ECHO',
      sensor: 'HC-SR04',
      wireColor: '#9933ff',
      notes: 'Pulso de eco de retorno (Input).',
    },
  ],
  circuitWarnings: [
    'O sensor HC-SR04 necessita de 5V estáveis para funcionar com precisão.',
    'Se usar ESP32 (3.3V lógica), utilize um divisor de tensão resistivo (ex: 1kΩ / 2kΩ) no pino ECHO para não enviar 5V no pino GPIO.',
    'Certifique-se de que o MPU-6050 esteja fixado com firmeza na base ou protoboard para evitar ruído nos acelerômetros.',
  ],
  firmware: {
    filename: 'flightscope_telemetry.ino',
    language: 'cpp',
    instructions:
      'Abra o código na Arduino IDE, instale as bibliotecas Adafruit MPU6050 pelo Library Manager, selecione a porta COM e envie com baud rate de 115200.',
    libraries: [
      {
        name: 'Adafruit MPU6050',
        author: 'Adafruit',
        installGuide: 'Gerenciador de Bibliotecas da Arduino IDE: busque por "Adafruit MPU6050" e instale com suas dependências.',
      },
      {
        name: 'Adafruit Unified Sensor',
        author: 'Adafruit',
        installGuide: 'Instalada automaticamente como dependência da Adafruit MPU6050.',
      },
    ],
    code: `/*
 * ==============================================================================
 *  VersIOT - FlightScope Aerospace Telemetry Firmware
 *  Hardware: Arduino Uno/Nano + MPU-6050 (I2C) + HC-SR04 Sonar
 *  Baud Rate: 115200 bps
 * ==============================================================================
 */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

// Pinos do Radar Ultrassônico HC-SR04
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

// Constantes de filtro e timing
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 80; // ~12.5 Hz de telemetria fluida

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000); // Aguarda porta serial caso necessário

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Inicializa barramento I2C e MPU-6050
  if (!mpu.begin()) {
    Serial.println("STATUS:ERRO_MPU6050_NAO_ENCONTRADO");
    while (1) {
      delay(500);
    }
  }

  // Configuração aeroespacial de leitura
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  delay(100);
}

float readUltrasonicRadarCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Timeout de 25ms para alcance de até ~4 metros sem travar o loop
  long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  if (duration == 0) return 60.0; // Valor seguro padrão

  float distanceCm = (duration * 0.0343) / 2.0;
  if (distanceCm < 2.0 || distanceCm > 150.0) return 60.0;
  return distanceCm;
}

void loop() {
  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    // Cálculo trigonométrico de Atitude (Pitch e Roll)
    float pitch = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / PI;
    float roll  = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
    float radar = readUltrasonicRadarCm();

    // Determina o nível de perigo de proximidade (0 = Seguro, 1 = Alerta, 2 = Crítico)
    int dangerLevel = 0;
    String flightStatus = "Voo Normal";

    if (radar < 15.0) {
      dangerLevel = 2;
      flightStatus = "ALERTA TERRENO CRITICO!";
    } else if (radar < 30.0) {
      dangerLevel = 1;
      flightStatus = "Aproximacao de Obstaculo";
    }

    // Transmissão padronizada VersIOT
    Serial.print("Pitch:");
    Serial.print(pitch, 1);
    Serial.print(" | Roll:");
    Serial.print(roll, 1);
    Serial.print(" | Radar_cm:");
    Serial.print(radar, 1);
    Serial.print(" | Nivel_Perigo:");
    Serial.print(dangerLevel);
    Serial.print(" | Status:");
    Serial.println(flightStatus);
  }
}
`,
  },
  telemetryFields: [
    { key: 'Pitch', label: 'Arfagem (Pitch)', unit: '°', color: '#00e5ff', min: -90, max: 90, icon: '📐' },
    { key: 'Roll', label: 'Rolamento (Roll)', unit: '°', color: '#ffaa00', min: -90, max: 90, icon: '🔄' },
    { key: 'Radar_cm', label: 'Altitude Radar', unit: 'cm', color: '#00ff88', min: 0, max: 60, icon: '📡' },
    { key: 'Nivel_Perigo', label: 'Nível de Perigo', unit: '', color: '#ff3366', min: 0, max: 2, icon: '⚠️' },
  ],
  samplePayload: 'Pitch:12.4 | Roll:-3.2 | Radar_cm:28.5 | Nivel_Perigo:1 | Status:Aproximacao de Obstaculo',
  payloadFormatDescription: 'Valores separados por pipe (|) no formato Chave:Valor.',
};

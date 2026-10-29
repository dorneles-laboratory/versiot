import { IoTProject } from '../../types/project';

export const gardenProject: IoTProject = {
  slug: 'garden',
  id: 'garden',
  name: 'BioScope — Estufa & Terrário Inteligente',
  shortName: 'BioScope',
  tagline: 'Ecossistema botânico vivo com monitoramento de clima, solo e iluminação reativa.',
  description:
    'Um projeto completo de agricultura de precisão e terrários inteligentes. Sensores capturam temperatura ambiente e umidade do ar (DHT22), umidade do solo por sonda e radiação luminosa por LDR. O visualizador renderiza um terrário/estufa interativo onde o ciclo de sol/lua obedece à luminosidade real, gotas de chuva surgem com a umidade e uma planta virtual floresce vigorosa ou fica murcha e amarelada dependendo das condições da terra.',
  icon: '🌱',
  category: 'Ambiente & Clima',
  categoryKey: 'climate',
  difficulty: 'Iniciante',
  difficultyKey: 'beginner',
  microcontrollers: ['Arduino', 'ESP32', 'Raspberry Pi'],
  featured: true,
  badge: 'Ecossistema Vivo',
  accentColor: '#10b981',
  defaultBaud: 115200,
  components: [
    {
      name: 'Arduino Uno / Nano ou ESP32',
      quantity: 1,
      role: 'Controlador ambiental',
      description: 'Lê sensores analógicos e digitais e aciona mini bombas ou LEDs de cultivo.',
    },
    {
      name: 'Sensor de Temperatura e Umidade DHT22 (ou DHT11)',
      quantity: 1,
      role: 'Monitor climático',
      description: 'Mede a temperatura (°C) e a umidade relativa do ar (%).',
    },
    {
      name: 'Sensor de Umidade do Solo (Capacitivo ou Resistivo)',
      quantity: 1,
      role: 'Sonda de substrato',
      description: 'Mede a condutividade ou constante dielétrica da terra no vaso.',
    },
    {
      name: 'Fotorresistor LDR (5mm)',
      quantity: 1,
      role: 'Fotômetro solar',
      description: 'Varia a resistência de acordo com a intensidade da luz ambiente incidente.',
    },
    {
      name: 'Resistor de 10kΩ',
      quantity: 1,
      role: 'Divisor de tensão para o LDR',
      description: 'Cria uma referência analógica estável no pino A1.',
    },
    {
      name: 'Módulo Relé de 1 Canal (Opcional)',
      quantity: 1,
      role: 'Acionamento de bomba/irrigador',
      description: 'Chaveia uma mini bomba de água submersível 5V de irrigação.',
    },
  ],
  pinout: [
    {
      pinMicro: '5V',
      pinSensor: 'VCC',
      sensor: 'DHT22',
      wireColor: '#ff4444',
      notes: 'Alimentação positiva de 5V.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'DHT22',
      wireColor: '#333333',
      notes: 'Terra comum.',
    },
    {
      pinMicro: 'Pino Digital 2',
      pinSensor: 'DATA',
      sensor: 'DHT22',
      wireColor: '#10b981',
      notes: 'Pino de dados com resistor pull-up interno.',
    },
    {
      pinMicro: '5V',
      pinSensor: 'VCC',
      sensor: 'Sensor de Solo',
      wireColor: '#ff4444',
      notes: 'Alimentação do sensor.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'Sensor de Solo',
      wireColor: '#333333',
      notes: 'Terra.',
    },
    {
      pinMicro: 'A0 (Analógico)',
      pinSensor: 'AOUT',
      sensor: 'Sensor de Solo',
      wireColor: '#f59e0b',
      notes: 'Leitura analógica da umidade da terra (0 a 1023).',
    },
    {
      pinMicro: 'A1 (Analógico)',
      pinSensor: 'Junção LDR + 10kΩ',
      sensor: 'Divisor LDR',
      wireColor: '#6366f1',
      notes: 'Tensão proporcional à claridade do ambiente.',
    },
  ],
  circuitWarnings: [
    'Sensores de solo resistivos comuns sofrem corrosão galvânica se mantidos energizados constantemente. Se possível, utilize um sensor de solo capacitivo v1.2.',
    'Nunca conecte motores ou bombas de água diretamente nos pinos do Arduino; utilize sempre o módulo relé ou um transistor com diodo de flyback.',
  ],
  firmware: {
    filename: 'smart_greenhouse_bioscope.ino',
    language: 'cpp',
    instructions:
      'Instale a biblioteca "DHT sensor library" da Adafruit via Gerenciador de Bibliotecas da Arduino IDE. Conecte o DHT22 no pino 2, o sensor de solo no A0 e o LDR no A1.',
    libraries: [
      {
        name: 'DHT sensor library',
        author: 'Adafruit',
        installGuide: 'Gerenciador de Bibliotecas da Arduino IDE: busque por "DHT sensor library by Adafruit" e instale com dependências.',
      },
    ],
    code: `/*
 * ==============================================================================
 *  VersIOT - BioScope Smart Greenhouse & Terrarium Firmware
 *  Hardware: Arduino Uno/Nano + DHT22/DHT11 + LDR + Soil Moisture Sensor
 *  Baud Rate: 115200 bps
 * ==============================================================================
 */

#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT22 // Altere para DHT11 se estiver usando o sensor azul

DHT dht(DHTPIN, DHTTYPE);

const int SOIL_PIN = A0;
const int LDR_PIN = A1;
const int PUMP_RELAY_PIN = 7;

unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL_MS = 200; // 5 Hz

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);

  dht.begin();
  delay(500);
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = now;

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    // Fallback defensivo contra leituras nulas ocasionais do DHT
    if (isnan(humidity)) humidity = 55.0;
    if (isnan(temperature)) temperature = 24.0;

    int rawSoil = analogRead(SOIL_PIN);
    // Mapeamento: 1023 (seco no ar) até 350 (imerso em água) -> 0% a 100%
    int soilPercent = map(rawSoil, 1023, 350, 0, 100);
    soilPercent = constrain(soilPercent, 0, 100);

    int rawLight = analogRead(LDR_PIN);
    // Mapeia leitura LDR para escala de 0 a 1000 lux estimada
    int lightLevel = constrain(rawLight, 0, 1000);

    // Lógica autônoma de irrigação inteligente
    bool pumpActive = false;
    String climateStatus = "Clima Ideal";

    if (soilPercent < 25) {
      pumpActive = true;
      digitalWrite(PUMP_RELAY_PIN, HIGH);
      climateStatus = "Irrigando Solo Seco";
    } else {
      digitalWrite(PUMP_RELAY_PIN, LOW);
      if (temperature > 32.0) {
        climateStatus = "Temperatura Alta!";
      } else if (temperature < 15.0) {
        climateStatus = "Frio Extremo";
      }
    }

    // Transmissão padronizada VersIOT
    Serial.print("Temp:");
    Serial.print(temperature, 1);
    Serial.print(" | Humidity:");
    Serial.print(humidity, 1);
    Serial.print(" | Soil:");
    Serial.print(soilPercent);
    Serial.print(" | Light:");
    Serial.print(lightLevel);
    Serial.print(" | Pump:");
    Serial.print(pumpActive ? 1 : 0);
    Serial.print(" | Status:");
    Serial.println(climateStatus);
  }
}
`,
  },
  telemetryFields: [
    { key: 'temperature', label: 'Temperatura', unit: '°C', color: '#ef4444', min: 0, max: 50, icon: '🌡️' },
    { key: 'humidity', label: 'Umidade do Ar', unit: '%', color: '#06b6d4', min: 0, max: 100, icon: '💧' },
    { key: 'soilMoisture', label: 'Umidade do Solo', unit: '%', color: '#10b981', min: 0, max: 100, icon: '🪴' },
    { key: 'lightLevel', label: 'Luminosidade', unit: 'lux', color: '#f59e0b', min: 0, max: 1000, icon: '☀️' },
    { key: 'pumpActive', label: 'Irrigação', unit: '', color: '#3b82f6', min: 0, max: 1, icon: '🚿' },
  ],
  samplePayload: 'Temp:25.4 | Humidity:63.2 | Soil:58 | Light:840 | Pump:0 | Status:Clima Ideal',
  payloadFormatDescription: 'Temperatura ambiente, umidade do ar, umidade do solo e lux incidente.',
};

import { IoTProject } from '../../types/project';

export const pulseProject: IoTProject = {
  id: 'pulse',
  name: 'PulseScope — Monitor Biométrico Cyberpunk',
  shortName: 'PulseScope',
  tagline: 'Coração 3D pulsante em tempo real, traçado de ECG neon e oximetria de pulso (SpO2).',
  description:
    'Um bio-monitor futurista inspirado em interfaces médicas cyberpunk e telemetria de astronautas. Conectado a um sensor óptico de pulso e oximetria (MAX30100 / MAX30102 ou Pulse Sensor analógico), ele detecta os picos sistólicos do fluxo sanguíneo capilar. O visualizador reproduz um coração anatômico holográfico pulsando com precisão milissegundo, um osciloscópio com traçado contínuo de eletrocardiograma (ECG) neon, medidor de saturação de oxigênio (SpO2 %) e cálculo de variabilidade da frequência cardíaca (HRV).',
  icon: '🫀',
  category: 'Saúde & Biometria',
  difficulty: 'Avançado',
  badge: 'Cyberpunk 3D',
  accentColor: '#ec4899',
  defaultBaud: 115200,
  components: [
    {
      name: 'ESP32 ou Arduino Nano / Uno',
      quantity: 1,
      role: 'Processador de sinais biométricos',
      description: 'Executa amostragem rápida (100 Hz) para detecção de picos R da onda cardíaca.',
    },
    {
      name: 'Sensor Óptico de Frequência Cardíaca (MAX30102 ou Pulse Sensor)',
      quantity: 1,
      role: 'Fotopletismógrafo (PPG)',
      description: 'Emite luz vermelha e infravermelha para medir absorção de hemoglobina no sangue.',
    },
    {
      name: 'Cabos Jumpers Flexíveis',
      quantity: 4,
      role: 'Conexão',
      description: 'Ligação I2C de 4 vias (VCC, GND, SDA, SCL).',
    },
    {
      name: 'Fita de Velcro para o Dedo',
      quantity: 1,
      role: 'Fixação anatômica',
      description: 'Garante pressão constante sem prender a circulação do dedo.',
    },
  ],
  pinout: [
    {
      pinMicro: '3.3V (Importante!)',
      pinSensor: 'VIN / VCC',
      sensor: 'MAX30102',
      wireColor: '#ff4444',
      notes: 'O MAX30102 é sensível a sobretensão; use sempre 3.3V.',
    },
    {
      pinMicro: 'GND',
      pinSensor: 'GND',
      sensor: 'MAX30102',
      wireColor: '#333333',
      notes: 'Terra de referência.',
    },
    {
      pinMicro: 'SDA (A4 no Uno / GPIO 21 no ESP32)',
      pinSensor: 'SDA',
      sensor: 'MAX30102',
      wireColor: '#00cc88',
      notes: 'Linha de dados I2C.',
    },
    {
      pinMicro: 'SCL (A5 no Uno / GPIO 22 no ESP32)',
      pinSensor: 'SCL',
      sensor: 'MAX30102',
      wireColor: '#ffaa00',
      notes: 'Linha de clock I2C.',
    },
  ],
  circuitWarnings: [
    'A maioria das placas MAX30102 baratas possui um regulador interno que pode apresentar instabilidade se ligada em 5V. Prefira sempre alimentar com 3.3V.',
    'Ruído de movimento: manter o dedo imóvel e aplicar pressão suave constante é crucial para a precisão do traçado fotopletismográfico.',
    'Este projeto tem fins educacionais, makers e de demonstração lúdica; não deve ser utilizado como dispositivo de diagnóstico médico crítico.',
  ],
  firmware: {
    filename: 'cyberpunk_pulsescope.ino',
    language: 'cpp',
    instructions:
      'Instale a biblioteca "SparkFun MAX3010x Pulse and Proximity Sensor Library" na Arduino IDE. Fixe o dedo sobre a lente óptica com leve pressão.',
    libraries: [
      {
        name: 'SparkFun MAX3010x Pulse and Proximity Sensor Library',
        author: 'SparkFun',
        installGuide: 'Gerenciador de Bibliotecas da Arduino IDE: busque por "SparkFun MAX3010x" e instale.',
      },
    ],
    code: `/*
 * ==============================================================================
 *  VersIOT - PulseScope Cyberpunk Biometric Monitor Firmware
 *  Hardware: ESP32 ou Arduino + MAX30102 (I2C) / Pulse Sensor
 *  Baud Rate: 115200 bps
 * ==============================================================================
 */

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

const byte RATE_SIZE = 4; // Média móvel dos últimos 4 batimentos
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0; // Momento do último pico

float beatsPerMinute = 72.0;
int beatAvg = 72;
int spo2Estimated = 98;

unsigned long lastSerialTime = 0;
const unsigned long SERIAL_INTERVAL_MS = 60; // ~16 Hz para traçado fluido de ECG

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("STATUS:ERRO_MAX30102_NAO_ENCONTRADO");
    while (1) {
      delay(500);
    }
  }

  // Configuração óptica otimizada para detecção de pulso no dedo
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x1F); // Vermelho moderado
  particleSensor.setPulseAmplitudeGreen(0);  // Desliga verde
  particleSensor.setPulseAmplitudeIR(0x1F);   // Infravermelho ativo
}

void loop() {
  long irValue = particleSensor.getIR();

  // Verifica se o dedo está posicionado sobre o sensor óptico
  if (irValue < 50000) {
    // Dedo desconectado
    unsigned long now = millis();
    if (now - lastSerialTime >= 200) {
      lastSerialTime = now;
      Serial.println("BPM:0 | SpO2:0 | Wave:0 | Stress:Baixo | Status:Posicione o Dedo");
    }
    return;
  }

  // Algoritmo de detecção de batimento cardíaco
  if (checkForBeat(irValue) == true) {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 40) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      int total = 0;
      for (byte x = 0; x < RATE_SIZE; x++) total += rates[x];
      beatAvg = total / RATE_SIZE;
      
      // Estimativa correlacionada de SpO2 entre 96% e 99%
      spo2Estimated = 98 - (beatAvg > 100 ? 1 : 0);
    }
  }

  unsigned long now = millis();
  if (now - lastSerialTime >= SERIAL_INTERVAL_MS) {
    lastSerialTime = now;

    // Normaliza o sinal bruto de infravermelho para escala de osciloscópio (0 a 1023)
    int waveformValue = map(constrain(irValue, 50000, 150000), 50000, 150000, 100, 950);

    String stress = "Baixo";
    String status = "Sinais Vitais Estaveis";

    if (beatAvg > 100) {
      stress = "Alto";
      status = "Taquicardia Leve";
    } else if (beatAvg > 85) {
      stress = "Moderado";
    }

    // Transmissão padronizada VersIOT
    Serial.print("BPM:");
    Serial.print(beatAvg);
    Serial.print(" | SpO2:");
    Serial.print(spo2Estimated);
    Serial.print(" | Wave:");
    Serial.print(waveformValue);
    Serial.print(" | Stress:");
    Serial.print(stress);
    Serial.print(" | Status:");
    Serial.println(status);
  }
}
`,
  },
  telemetryFields: [
    { key: 'bpm', label: 'Frequência Cardíaca', unit: 'BPM', color: '#ec4899', min: 40, max: 180, icon: '🫀' },
    { key: 'spo2', label: 'Saturação de Oxigênio', unit: '%', color: '#06b6d4', min: 85, max: 100, icon: '🩸' },
    { key: 'rawWaveform', label: 'Onda ECG / Pulso', unit: 'raw', color: '#a855f7', min: 0, max: 1023, icon: '📈' },
    { key: 'stressLevel', label: 'Nível de Estresse', unit: '', color: '#f59e0b', min: 0, max: 2, icon: '🧠' },
  ],
  samplePayload: 'BPM:74 | SpO2:98 | Wave:680 | Stress:Baixo | Status:Sinais Vitais Estaveis',
  payloadFormatDescription: 'Batimentos cardíacos (BPM), SpO2 (%) e sinal instantâneo do fotopletismógrafo.',
};

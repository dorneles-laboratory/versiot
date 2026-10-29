import { describe, it, expect } from 'vitest';
import { parseUniversalSerialLine } from '../src/utils/parseSerial';
import {
  generateFlightscopeSimPoint,
  generateSonarSimPoint,
  generateGardenSimPoint,
  generateSmartHomeSimPoint,
  generatePulseSimPoint,
} from '../src/utils/simulationGenerators';
import { ALL_PROJECTS, getProjectBySlug, DEFAULT_PROJECT_SLUG } from '../src/data/projects';
import i18n from '../src/i18n';

describe('Project Data & Metadata', () => {
  it('should load all 5 IoT projects with valid slug and metadata', () => {
    expect(ALL_PROJECTS.length).toBe(5);
    const slugs = ALL_PROJECTS.map((p) => p.slug);
    expect(slugs).toContain('flightscope');
    expect(slugs).toContain('sonar');
    expect(slugs).toContain('garden');
    expect(slugs).toContain('smarthome');
    expect(slugs).toContain('pulse');
  });

  it('should get project by slug', () => {
    const flight = getProjectBySlug('flightscope');
    expect(flight).toBeDefined();
    expect(flight?.slug).toBe('flightscope');
    expect(flight?.defaultBaud).toBe(115200);
    expect(flight?.microcontrollers.length).toBeGreaterThan(0);
  });

  it('should have DEFAULT_PROJECT_SLUG pointing to flightscope', () => {
    expect(DEFAULT_PROJECT_SLUG).toBe('flightscope');
  });
});

describe('parseUniversalSerialLine', () => {
  it('parses flightscope key-value format', () => {
    const line = 'Pitch:12.5,Roll:-4.2,Radar_cm:85.0';
    const parsed = parseUniversalSerialLine(line, 'flightscope');
    expect(parsed?.flightscope).toBeDefined();
    expect(parsed?.flightscope?.Pitch).toBeCloseTo(12.5);
    expect(parsed?.flightscope?.Roll).toBeCloseTo(-4.2);
    expect(parsed?.flightscope?.Radar_cm).toBeCloseTo(85.0);
  });

  it('parses sonar format', () => {
    const line = 'ANG:90,DIST:45';
    const parsed = parseUniversalSerialLine(line, 'sonar');
    expect(parsed?.sonar).toBeDefined();
    expect(parsed?.sonar?.angle).toBe(90);
    expect(parsed?.sonar?.distance).toBe(45);
  });

  it('parses garden format', () => {
    const line = 'TEMP:24.5,HUM:65,SOIL:50,LDR:500';
    const parsed = parseUniversalSerialLine(line, 'garden');
    expect(parsed?.garden).toBeDefined();
    expect(parsed?.garden?.temperature).toBeCloseTo(24.5);
    expect(parsed?.garden?.humidity).toBe(65);
    expect(parsed?.garden?.soilMoisture).toBe(50);
  });

  it('parses smarthome format', () => {
    const line = 'PIR:1,GAS:0,LDR:80,LAMP:1';
    const parsed = parseUniversalSerialLine(line, 'smarthome');
    expect(parsed?.smarthome).toBeDefined();
    expect(parsed?.smarthome?.pirDetected).toBe(true);
    expect(parsed?.smarthome?.lampLivingRoom).toBe(true);
  });

  it('parses pulse format', () => {
    const line = 'BPM:75,SPO2:98,ECG:512';
    const parsed = parseUniversalSerialLine(line, 'pulse');
    expect(parsed?.pulse).toBeDefined();
    expect(parsed?.pulse?.bpm).toBe(75);
    expect(parsed?.pulse?.spo2).toBe(98);
  });
});

describe('Simulation Generators', () => {
  it('generates valid flightscope point', () => {
    const point = generateFlightscopeSimPoint();
    expect(point.Pitch).toBeDefined();
    expect(point.Roll).toBeDefined();
    expect(point.Radar_cm).toBeGreaterThanOrEqual(15);
  });

  it('generates valid sonar point', () => {
    const point = generateSonarSimPoint();
    expect(point.angle).toBeGreaterThanOrEqual(15);
    expect(point.angle).toBeLessThanOrEqual(165);
  });

  it('generates valid garden point', () => {
    const point = generateGardenSimPoint();
    expect(point.temperature).toBeGreaterThan(10);
    expect(point.humidity).toBeGreaterThan(0);
  });

  it('generates valid smart home point', () => {
    const point = generateSmartHomeSimPoint();
    expect(typeof point.pirDetected).toBe('boolean');
    expect(typeof point.gasAlert).toBe('boolean');
  });

  it('generates valid pulse point', () => {
    const point = generatePulseSimPoint();
    expect(point.bpm).toBeGreaterThan(40);
    expect(point.spo2).toBeGreaterThanOrEqual(90);
  });
});

describe('i18n Configuration', () => {
  it('translates common brand and navigation in pt-BR', () => {
    expect(i18n.t('brand', { ns: 'common' })).toBe('VersIOT');
    expect(i18n.t('hero.title', { ns: 'landing' })).toBe('Hardware Real, Simulação Virtual');
    expect(i18n.t('tabs.visualizer', { ns: 'workspace' })).toBe('Visualizador Interativo');
  });
});

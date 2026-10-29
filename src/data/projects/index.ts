import { IoTProject } from '../../types/project';
import { flightscopeProject } from './flightscope';
import { sonarProject } from './sonar';
import { gardenProject } from './garden';
import { smarthomeProject } from './smarthome';
import { pulseProject } from './pulse';

export const ALL_PROJECTS: IoTProject[] = [
  flightscopeProject,
  sonarProject,
  gardenProject,
  smarthomeProject,
  pulseProject,
];

export function getProjectById(id: string): IoTProject | undefined {
  return ALL_PROJECTS.find((p) => p.id === id);
}

export const DEFAULT_PROJECT_ID = 'flightscope';

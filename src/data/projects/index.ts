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

export function getProjectBySlug(slug: string): IoTProject | undefined {
  return ALL_PROJECTS.find((p) => p.slug === slug || p.id === slug);
}

export function getProjectById(id: string): IoTProject | undefined {
  return getProjectBySlug(id);
}

export const DEFAULT_PROJECT_SLUG = 'flightscope';
export const DEFAULT_PROJECT_ID = DEFAULT_PROJECT_SLUG;

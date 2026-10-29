import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonPtBR from './locales/pt-BR/common.json';
import landingPtBR from './locales/pt-BR/landing.json';
import catalogPtBR from './locales/pt-BR/catalog.json';
import workspacePtBR from './locales/pt-BR/workspace.json';
import projectsPtBR from './locales/pt-BR/projects.json';
import errorsPtBR from './locales/pt-BR/errors.json';

export const defaultNS = 'common';
export const resources = {
  'pt-BR': {
    common: commonPtBR,
    landing: landingPtBR,
    catalog: catalogPtBR,
    workspace: workspacePtBR,
    projects: projectsPtBR,
    errors: errorsPtBR,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    defaultNS,
    supportedLngs: ['pt-BR'],
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'versiot_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enJSON from './locales/en.json';
import esJSON from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enJSON },
      es: { translation: esJSON },
    },
    // Default language if detection fails or is not in the list
    fallbackLng: 'es', 
    
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    
    detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage']
    }
  });

export default i18n;

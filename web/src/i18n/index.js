import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import de from './locales/de.json';

export const SUPPORTED_LOCALES = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'de', name: 'Deutsch' },
];

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            es: { translation: es },
            pt: { translation: pt },
            de: { translation: de },
        },
        fallbackLng: 'en',
        supportedLngs: SUPPORTED_LOCALES.map((l) => l.code),
        load: 'languageOnly',            // 'en-US' → 'en'
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'locale',
        },
        returnEmptyString: false,
    });

export default i18n;

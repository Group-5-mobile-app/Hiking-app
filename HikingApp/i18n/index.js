import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fi from './locales/fi.json';
import en from './locales/en.json';

const resources = {
    "fi": { translation: fi},
    "en": { translation: en },
};

const initI18n = async () => {
    let savedLang = await AsyncStorage.getItem('language');
    if (!savedLang) {
        savedLang = Localization.getLocales()[0].languageCode;
    }

    i18n.use(initReactI18next).init({
        compatibilityJSON: 'v3',
        resources,
        lng: savedLang,
        fallbackLng: 'fi',
        interpolation: {
            escapeValue: false,
        },
    });
};

initI18n();

export default i18n;


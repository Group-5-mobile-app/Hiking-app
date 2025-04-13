import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './components/AppNavigator';
import { customLightTheme, customDarkTheme } from './components/theme';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? customDarkTheme : customLightTheme;
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('language');
        if (savedLang) {
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    
    loadLanguage();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <AppNavigator isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </PaperProvider>
    </I18nextProvider>
      );
    }

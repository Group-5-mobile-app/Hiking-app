import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './components/AppNavigator';
import theme from './components/theme';
import { PaperProvider } from 'react-native-paper';
import { useState, useEffect } from 'react';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
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
        <AppNavigator />
      </PaperProvider>
    </I18nextProvider>
  );
};

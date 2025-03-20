import { StatusBar } from 'expo-status-bar';
//import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './components/AppNavigator';
import theme from './components/theme';
import { PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <AppNavigator />
    </PaperProvider>
  );
};

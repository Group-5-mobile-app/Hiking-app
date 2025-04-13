import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8bc34a',
    secondary: '#757575',
    accent: '#03dac4',
    background: '#8c8787',
    surface: '#D3D3D3',
    text: '#000000',
    white: '#ffffff',
    black: '#000000',
    red: '#FF0000',
  },
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3b8d29',
    secondary: '#616161',
    accent: '#03dac6',
    background: '#333333',
    surface: '#444444',
    text: '#ffffff',
    white: '#ffffff',
    black: '#000000',
    red: '#FF0000',
    
  },
};

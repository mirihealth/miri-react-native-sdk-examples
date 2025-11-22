import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Main } from './components/Main';
import { AuthProvider } from './contexts/AuthContext';

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : {
              ...DefaultTheme,
              colors: { ...DefaultTheme.colors, background: 'white' },
            }
      }
    >
      <AuthProvider>
        <KeyboardProvider>
          <Main />
        </KeyboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { MiriAppProvider } from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FC, Fragment } from 'react';
import { Text } from 'react-native';

import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from './Login';
import { SafeAreaView } from 'react-native-safe-area-context';

let scheme = 'expoexample';

if (Constants.expoConfig?.scheme) {
  scheme = Array.isArray(Constants.expoConfig?.scheme)
    ? Constants.expoConfig?.scheme[0]
    : Constants.expoConfig?.scheme;
}
const apiKey = '';

export const Main: FC = () => {
  const theme = useTheme();
  const { token } = useAuth();

  if (!apiKey) {
    return (
      <SafeAreaView>
        <Text style={{ color: theme.colors.text }}>
          Please provide your API key in the MiriAppProvider.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <MiriAppProvider
      apiKey={apiKey}
      auth={{
        token,
        provider: 'firebase',
      }}
      scheme={scheme}
      logError={console.error}
      theme={{
        colors: {
          background: theme.colors.background,
          text: theme.colors.text,
        },
        fonts: theme.fonts,
      }}
      env="staging"
    >
      {token ? (
        <Fragment>
          <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="(tabs)"
              options={{ title: 'Miri SDK Expo Example' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </Fragment>
      ) : (
        <Login />
      )}
    </MiriAppProvider>
  );
};

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

const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.googleIOSClientId;
const MIRI_API_KEY = Constants.expoConfig?.extra?.miriApiKey;

export const Main: FC = () => {
  const theme = useTheme();
  const { token } = useAuth();

  if (!MIRI_API_KEY) {
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
      apiKey={MIRI_API_KEY}
      auth={{
        token,
        provider: 'google',
        config: {
          client_id: GOOGLE_IOS_CLIENT_ID,
          issuer_url: 'https://www.googleapis.com/oauth2/v3/certs',
        },
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

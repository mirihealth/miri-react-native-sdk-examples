import { MiriAppProvider, MiriAuth } from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FC, Fragment, useMemo } from 'react';
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

// TODO: Read from Constants.expoConfig.extra once Expo config loading is fixed.
// For now, read directly from app.json at build time via metro resolver.
let appExtra: Record<string, string> = {};
try {
  const appJson = require('../app.json');
  appExtra = appJson?.expo?.extra ?? {};
} catch {
  // fallback
}

const GOOGLE_IOS_CLIENT_ID = appExtra.googleIOSClientId;
const MIRI_API_KEY = appExtra.miriApiKey;
const FIREBASE_PROJECT_ID = appExtra.firebaseProjectId;
const AUTH_PROVIDER = appExtra.authProvider || 'google';

/**
 * Returns the MiriAuth config based on the selected auth provider.
 *
 * Google auth: uses Google Sign-In to get an ID token, then exchanges it
 * via Miri's token exchange endpoint.
 *
 * Firebase auth: uses your app's existing Firebase Authentication to get
 * an ID token, then exchanges it. Set FIREBASE_PROJECT_ID to your Firebase
 * project ID (from google-services.json or GoogleService-Info.plist).
 */
function useMiriAuth(token: string | null): MiriAuth {
  return useMemo(() => {
    if (AUTH_PROVIDER === 'firebase') {
      return {
        token,
        provider: 'firebase' as const,
        config: {
          project_id: FIREBASE_PROJECT_ID,
        },
      };
    }

    // Default: Google auth
    return {
      token,
      provider: 'google' as const,
      config: {
        client_id: GOOGLE_IOS_CLIENT_ID,
        issuer_url: 'https://www.googleapis.com/oauth2/v3/certs',
      },
    };
  }, [token]);
}

export const Main: FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const auth = useMiriAuth(token);

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
    <KeyboardProvider>
      <MiriAppProvider
        apiKey={MIRI_API_KEY}
        auth={auth}
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
    </KeyboardProvider>
  );
};

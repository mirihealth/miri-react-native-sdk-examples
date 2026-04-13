import {
  GOOGLE_IOS_CLIENT_ID,
  MIRI_API_KEY,
  FIREBASE_PROJECT_ID,
  AUTH_PROVIDER,
} from '@env';
import { MiriAppProvider, MiriAuth } from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { FC, useMemo } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { Tabs } from './Tabs';

const authProvider = AUTH_PROVIDER || 'google';

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
    if (authProvider === 'firebase') {
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
    <MiriAppProvider
      apiKey={MIRI_API_KEY}
      auth={auth}
      userAgentPrefix="reactnativeexample/1.0"
      env="staging"
      scheme="example"
      logError={console.error}
      theme={{
        colors: {
          background: theme.colors.background,
          text: theme.colors.text,
        },
        fonts: theme.fonts,
      }}
    >
      {token ? <Tabs /> : <Login />}
    </MiriAppProvider>
  );
};

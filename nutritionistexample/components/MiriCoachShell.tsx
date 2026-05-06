// MiriCoachShell — the bridge component the partner app mounts inside its
// "Coach" tab. Wraps everything Miri needs:
//   - MiriAppProvider (API key, auth, env, scheme, theme)
//   - Login gate (Dev Login backdoor for staging — same as the standalone examples)
//   - The inner Miri tab navigator (Today / Progress / Log / Coach + hidden Chat)
//
// The partner's outer NavigationContainer + outer bottom-tab nav stays mounted;
// when the partner user taps the "Coach" tab, this shell renders inside that
// screen. So both nav bars are visible simultaneously — Miri's bottom-tab nav
// stacks above the partner's bottom-tab nav, making the integration boundary
// explicit in the demo.

import {
  AUTH_PROVIDER,
  FIREBASE_PROJECT_ID,
  GOOGLE_IOS_CLIENT_ID,
  MIRI_API_KEY,
} from '@env';
import { MiriAppProvider, MiriAuth } from '@miri-ai/miri-react-native';
import { FC, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { MiriTabs } from './MiriTabs';
import { partnerColors } from './partnerTheme';

const authProvider = AUTH_PROVIDER || 'google';

function useMiriAuth(token: string | null): MiriAuth {
  return useMemo(() => {
    if (authProvider === 'firebase') {
      return {
        token,
        provider: 'firebase' as const,
        config: { project_id: FIREBASE_PROJECT_ID },
      };
    }
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

// Miri's own theme — distinct from the partner's chrome so the demo makes
// the integration boundary visible.
const miriTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#1C1F26',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export const MiriCoachShell: FC = () => {
  const { token } = useAuth();
  const auth = useMiriAuth(token);

  if (!MIRI_API_KEY) {
    return (
      <SafeAreaView style={styles.errorWrapper}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Miri not configured</Text>
          <Text style={styles.errorBody}>
            Set MIRI_API_KEY in your .env file to enable the Coach tab.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <MiriAppProvider
      apiKey={MIRI_API_KEY}
      auth={auth}
      userAgentPrefix="nutritionistexample/1.0"
      env="staging"
      scheme="example"
      logError={console.error}
      theme={miriTheme}
    >
      {token ? <MiriTabs /> : <Login />}
    </MiriAppProvider>
  );
};

const styles = StyleSheet.create({
  errorWrapper: {
    flex: 1,
    backgroundColor: partnerColors.surface,
    padding: 20,
  },
  errorBox: {
    marginTop: 80,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
    padding: 18,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: partnerColors.text,
    marginBottom: 6,
  },
  errorBody: {
    fontSize: 14,
    color: partnerColors.textMuted,
    lineHeight: 20,
  },
});

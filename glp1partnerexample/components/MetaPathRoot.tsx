// MetaPathRoot — wires MiriAppProvider above the partner tabs once the
// patient is authenticated, otherwise shows MetaPath's branded Login.
//
// Design choice: in the nutritionistexample pattern, MiriAppProvider was
// scoped to a single tab. Here it's at the ROOT — the patient is
// authenticated against MetaPath's own auth, and we silently exchange
// that token for a Miri session. Any partner screen can then pull from
// Miri SDK hooks (`useWellnessScore`, `useInsights`, `useHabitProgress`,
// `usePriorityActionAPI`, `useCoachChipsAPI`) without re-mounting a
// provider per screen.

import {
  AUTH_PROVIDER,
  FIREBASE_PROJECT_ID,
  GOOGLE_IOS_CLIENT_ID,
  MIRI_API_KEY,
} from '@env';
import { MiriAppProvider, MiriAuth } from '@miri-ai/miri-react-native';
import { FC, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { miriThemeForPartner, partnerColors } from './partnerTheme';
import { RootNavigator } from './RootNavigator';

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

export const MetaPathRoot: FC = () => {
  const { token } = useAuth();
  const auth = useMiriAuth(token);

  if (!MIRI_API_KEY) {
    return (
      <View style={styles.errorWrapper}>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Miri not configured</Text>
          <Text style={styles.errorBody}>
            Set MIRI_API_KEY in your .env file to enable the embedded Coach.
          </Text>
        </View>
      </View>
    );
  }

  // MiriAppProvider is mounted unconditionally so the Login screen can use
  // SDK auth hooks (`useAuthVerificationAPI`) before a token exists. When
  // `auth.token` is null, the SDK is initialised but unauthenticated;
  // requests that require auth wait until the token is set.
  return (
    <MiriAppProvider
      apiKey={MIRI_API_KEY}
      auth={auth}
      userAgentPrefix="glp1partnerexample/1.0"
      env="staging"
      scheme="example"
      logError={(...args) => {
        // Use console.log (not console.error) so SDK errors during the
        // initial auth race don't trigger dev redboxes / yellow boxes
        // — partner apps would route to their own logger here.
        if (__DEV__) console.log('[Miri]', ...args);
      }}
      theme={miriThemeForPartner}
    >
      {token ? <RootNavigator /> : <Login />}
    </MiriAppProvider>
  );
};

const styles = StyleSheet.create({
  errorWrapper: {
    flex: 1,
    backgroundColor: partnerColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorBox: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: partnerColors.border,
    maxWidth: 320,
  },
  errorTitle: {
    color: partnerColors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorBody: {
    color: partnerColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

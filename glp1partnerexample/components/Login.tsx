// MetaPath-branded login. The patient signs in to MetaPath, NOT to Miri —
// and the same token gets exchanged silently for a Miri session in
// MetaPathRoot. From the patient's perspective there's only one login
// screen, branded fully by MetaPath. This is the right pattern for embedded
// SDK integration: the Miri brand should never appear in front of a
// partner's existing auth flow.
//
// NOTE: The console.error calls below log to the JS console for example-app
// readability. In a real partner app, swap them for your own logger and
// scrub any token/PII fields before sending off-device.

import { useAuthVerificationAPI } from '@miri-ai/miri-react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { signInWithCustomToken } from 'firebase/auth';
import { FC, useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { firebaseAuth } from '../services/firebase';
import { PARTNER_BRAND, partnerColors } from './partnerTheme';

// Internal-test phone number — server bypasses real SMS verification for
// any +1555... number on alpha/beta builds and accepts the OTP "51010".
// See miri-server/README.md → "Internal Testing".
const DEV_PHONE_NUMBER = '+15559999795';
const DEV_VERIFICATION_CODE = '51010';

export const Login: FC = () => {
  const { setToken } = useAuth();
  const { startSMSVerification, completeSMSVerification } =
    useAuthVerificationAPI();
  const [error, setError] = useState<string | null>(null);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [devPhoneLoading, setDevPhoneLoading] = useState(false);

  const onLoginPress = useCallback(async () => {
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setToken(response.data.idToken);
      }
    } catch (err: any) {
      const message = err?.message || String(err);
      if (
        message.includes('GIDClientID') ||
        message.includes('No active configuration')
      ) {
        setError(
          'Google Sign-In is not configured.\n\n' +
            'To fix this:\n' +
            '1. Download GoogleService-Info.plist from Firebase Console (with Google Sign-In enabled)\n' +
            '2. Place it in the ios/ directory\n' +
            '3. Set GOOGLE_IOS_CLIENT_ID in your .env file\n' +
            '4. Rebuild the app',
        );
      } else if (message.includes('SIGN_IN_CANCELLED')) {
        // user cancelled — no error to show
      } else {
        setError(`Sign-in error: ${message}`);
      }
      console.error('Error signing in:', err);
    }
  }, [setToken]);

  const onDevLogin = useCallback(() => {
    if (devToken.trim()) {
      setToken(devToken.trim());
    }
  }, [setToken, devToken]);

  const onDevPhoneLogin = useCallback(async () => {
    setError(null);
    setDevPhoneLoading(true);
    try {
      await startSMSVerification(DEV_PHONE_NUMBER);
      const customToken = await completeSMSVerification(
        DEV_PHONE_NUMBER,
        DEV_VERIFICATION_CODE,
      );
      const userCredential = await signInWithCustomToken(
        firebaseAuth,
        customToken,
      );
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
    } catch (err: any) {
      setError(`Dev phone login failed: ${err?.message || String(err)}`);
      console.error('Dev phone login error:', err);
    } finally {
      setDevPhoneLoading(false);
    }
  }, [startSMSVerification, completeSMSVerification, setToken]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{PARTNER_BRAND.name}</Text>
        <Text style={styles.subtitle}>{PARTNER_BRAND.tagline}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            Sign in to your patient account
          </Text>

          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={onLoginPress}
            style={styles.googleButton}
          />

          <Pressable
            style={[
              styles.phoneButton,
              devPhoneLoading && styles.phoneButtonDisabled,
            ]}
            onPress={onDevPhoneLogin}
            disabled={devPhoneLoading}
            accessibilityRole="button"
          >
            <Text style={styles.phoneButtonLabel}>
              {devPhoneLoading ? 'Signing in…' : 'Continue with phone (demo)'}
            </Text>
          </Pressable>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Paste-token backdoor — `__DEV__`-gated so customers forking this
              example don't inherit the affordance in production builds. */}
          {__DEV__ && (
            <View style={styles.devSection}>
              <Pressable
                onPress={() => setShowDevLogin(!showDevLogin)}
                style={styles.devToggle}
              >
                <Text style={styles.devLinkText}>
                  {showDevLogin ? 'Hide' : 'Dev login (paste token)'}
                </Text>
              </Pressable>

              {showDevLogin && (
                <View style={styles.devBlock}>
                  <TextInput
                    style={styles.tokenInput}
                    placeholder="Paste Firebase ID token or Google ID token"
                    placeholderTextColor={partnerColors.textSubtle}
                    value={devToken}
                    onChangeText={setDevToken}
                    multiline
                    numberOfLines={3}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable style={styles.devSubmit} onPress={onDevLogin}>
                    <Text style={styles.devSubmitLabel}>
                      Sign in with token
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          New here? Talk to your prescriber to set up MetaPath.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    flexGrow: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: partnerColors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: partnerColors.textMuted,
    lineHeight: 22,
  },
  card: {
    marginTop: 48,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: partnerColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 48,
  },
  phoneButton: {
    marginTop: 12,
    backgroundColor: partnerColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  phoneButtonDisabled: { opacity: 0.6 },
  phoneButtonLabel: {
    color: partnerColors.surfaceElevated,
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: partnerColors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  devSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: partnerColors.border,
  },
  devToggle: { padding: 4, alignSelf: 'flex-start' },
  devLinkText: {
    color: partnerColors.textSubtle,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  devBlock: { marginTop: 12 },
  tokenInput: {
    borderWidth: 1,
    borderColor: partnerColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: 'Courier',
    color: partnerColors.text,
  },
  devSubmit: {
    marginTop: 8,
    backgroundColor: partnerColors.text,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  devSubmitLabel: {
    color: partnerColors.surfaceElevated,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    fontSize: 13,
    color: partnerColors.textSubtle,
    textAlign: 'center',
  },
});

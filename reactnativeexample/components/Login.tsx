import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@miri-ai/miri-react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Login = () => {
  const { setToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devToken, setDevToken] = useState('');

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
        // User cancelled — no error to show
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

  return (
    <SafeAreaView style={styles.authForm}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.authFormHeader}>Sign In to Miri</Text>

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onLoginPress}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={styles.devToggle}
          onPress={() => setShowDevLogin(!showDevLogin)}
        >
          <Text style={styles.devToggleText}>
            {showDevLogin ? 'Hide' : 'Dev Login (paste token)'}
          </Text>
        </Pressable>

        {showDevLogin && (
          <>
            <TextInput
              style={styles.tokenInput}
              placeholder="Paste Firebase ID token or Google ID token..."
              value={devToken}
              onChangeText={setDevToken}
              multiline
              numberOfLines={3}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable style={styles.devButton} onPress={onDevLogin}>
              <Text style={styles.devButtonText}>Sign In with Token</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authForm: {
    flex: 1,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    padding: 20,
  },
  authFormHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 13,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    overflow: 'hidden',
    lineHeight: 18,
  },
  devToggle: {
    marginTop: 24,
    padding: 8,
  },
  devToggleText: {
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  tokenInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    marginTop: 8,
    marginBottom: 12,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  devButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

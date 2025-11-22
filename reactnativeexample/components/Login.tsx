import { useAuth } from '@/contexts/AuthContext';
import { Text } from '@miri-ai/miri-react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Login = () => {
  const { setToken } = useAuth();
  const onLoginPress = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setToken(response.data.idToken);
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }, [setToken]);

  return (
    <SafeAreaView style={styles.authForm}>
      <Text style={styles.authFormHeader}>Sign In to Miri</Text>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={onLoginPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  authForm: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  authFormHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

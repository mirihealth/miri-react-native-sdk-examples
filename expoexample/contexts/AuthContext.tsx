import { getNotInitializedFn } from '@miri-ai/miri-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.googleIOSClientId;
const AUTH_PROVIDER = Constants.expoConfig?.extra?.authProvider || 'google';

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  signout: () => Promise<void>;
  authProvider: string;
}

GoogleSignin.configure({
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email', 'openid'],
});

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: getNotInitializedFn('AppAuthContext', 'setIdToken'),
  signout: getNotInitializedFn('AppAuthContext', 'signout'),
  authProvider: 'google',
});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAppAuth must be used within an AppAuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);

  const signout = useCallback(async () => {
    try {
      if (AUTH_PROVIDER === 'google') {
        await GoogleSignin.signOut();
      }
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  useEffect(() => {
    if (AUTH_PROVIDER === 'google') {
      const currentUser = GoogleSignin.getCurrentUser();
      if (currentUser?.idToken) {
        setToken(currentUser.idToken);
      }
    }
    // For Firebase auth, the token is set externally via setToken
    // (e.g., from Firebase Auth's onAuthStateChanged -> user.getIdToken())
  }, []);

  const value = useMemo(
    () => ({
      token,
      setToken,
      signout,
      authProvider: AUTH_PROVIDER,
    }),
    [signout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

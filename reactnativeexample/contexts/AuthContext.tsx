import { GOOGLE_IOS_CLIENT_ID } from '@env';
import { getNotInitializedFn } from '@miri-ai/miri-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  signout: () => Promise<void>;
}

GoogleSignin.configure({
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email', 'openid'],
});

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: getNotInitializedFn('AppAuthContext', 'setIdToken'),
  signout: getNotInitializedFn('AppAuthContext', 'signout'),
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
      await GoogleSignin.signOut();
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  useEffect(() => {
    const currentUser = GoogleSignin.getCurrentUser();
    if (currentUser?.idToken) {
      setToken(currentUser.idToken);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      setToken,
      signout,
    }),
    [signout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

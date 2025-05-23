import { signInWithCustomToken, User } from '@firebase/auth';
import { getNotInitializedFn } from '@miri-ai/miri-react-native';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth } from '@/utils/firebase';

export interface AuthContextType {
  token: string | null;
  setIdToken: (customToken: string) => Promise<void>;
  signout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setIdToken: getNotInitializedFn('AppAuthContext', 'setIdToken'),
  signout: getNotInitializedFn('AppAuthContext', 'signout'),
  isLoading: false,
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
  const [isLoading, setIsLoading] = useState(true);

  const getIdTokenFromCustomToken = useCallback(async (customToken: string) => {
    try {
      // Sign in with the custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      const user = userCredential.user;

      if (user) {
        const idToken = await user.getIdToken();

        return idToken;
      } else {
        throw new Error('No user is signed in.');
      }
    } catch (error) {
      console.error('Error obtaining ID token:', error);
      throw error;
    }
  }, []);

  const setIdToken = useCallback(
    async (customToken: string) => {
      const idToken = await getIdTokenFromCustomToken(customToken);
      setToken(idToken);
    },
    [getIdTokenFromCustomToken],
  );

  const signout = useCallback(async () => {
    await auth.signOut();
    setToken(null);
  }, []);

  useEffect(() => {
    const authChangeHandler = async (user: User | null) => {
      if (user) {
        const token = await user.getIdToken();
        setToken(token);
      } else {
        setToken(null);
      }

      setIsLoading(false);
    };
    const removeAuthStateChanged = auth.onAuthStateChanged(authChangeHandler);
    const removeIdTokenChanged = auth.onIdTokenChanged(authChangeHandler);

    return () => {
      removeAuthStateChanged();
      removeIdTokenChanged();
    };
  }, [auth, setToken]);

  const value = useMemo(
    () => ({
      token,
      setIdToken,
      signout,
      isLoading,
    }),
    [token, setIdToken, signout, isLoading],
  );

  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

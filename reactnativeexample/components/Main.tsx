import { GOOGLE_IOS_CLIENT_ID, MIRI_API_KEY } from '@env';
import { MiriAppProvider } from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { FC } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { Tabs } from './Tabs';

export const Main: FC = () => {
  const theme = useTheme();
  const { token } = useAuth();

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
      auth={{
        token,
        provider: 'google',
        config: {
          client_id: GOOGLE_IOS_CLIENT_ID,
          issuer_url: 'https://www.googleapis.com/oauth2/v3/certs',
        },
      }}
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

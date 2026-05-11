// App — minimum-viable web embed of the Miri SDK.
//
// Friday's/Kalix host model: their native RN wrapper hosts a WebView
// pointing at the URL where this bundle is served. The host passes
// auth in via URL fragment so we never write a token to a logged
// query-string (cookies/localStorage are also viable; fragment chosen
// here because it never leaves the browser).
//
// URL contract:
//   https://<embed-host>/#token=<miri-token>&apiKey=<...>&env=<staging|production>
//
// In production, the host would call our auth-exchange API to mint a
// short-lived Miri token, then build the embed URL with it. For the
// prototype, the token can be pasted in via the dev panel.

import {
  Chat as MiriChat,
  ChatInput,
  MessagesList,
  MiriAppProvider,
  ModuleNames,
} from '@miri-ai/miri-react-native';
import { FC, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface UrlConfig {
  token: string | null;
  apiKey: string | null;
  env: 'staging' | 'production';
}

function parseUrlConfig(): UrlConfig {
  const fragment = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(fragment);
  const env = params.get('env');
  return {
    token: params.get('token'),
    apiKey: params.get('apiKey'),
    env: env === 'production' ? 'production' : 'staging',
  };
}

export const App: FC = () => {
  const [overrideToken, setOverrideToken] = useState<string | null>(null);
  const [overrideKey, setOverrideKey] = useState<string | null>(null);
  const urlConfig = useMemo(() => parseUrlConfig(), []);

  const token = overrideToken ?? urlConfig.token;
  const apiKey = overrideKey ?? urlConfig.apiKey;

  // Dev panel — only shown when the URL hasn't supplied a token/apiKey.
  // Production hosts always pass them via the URL fragment, so this
  // panel only appears when developing or testing.
  if (!token || !apiKey) {
    return (
      <View style={styles.devPanel}>
        <Text style={styles.devTitle}>Miri Embed — Dev panel</Text>
        <Text style={styles.devBody}>
          No token/apiKey in URL fragment. Paste below to test, or load
          this page with #token=...&apiKey=...&env=staging.
        </Text>
        <TextInput
          style={styles.devInput}
          placeholder="apiKey (miri-inc_alpha_ios_…)"
          value={overrideKey ?? ''}
          onChangeText={setOverrideKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={[styles.devInput, styles.devTokenInput]}
          placeholder="Bearer token"
          value={overrideToken ?? ''}
          onChangeText={setOverrideToken}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
      </View>
    );
  }

  return (
    <MiriAppProvider
      apiKey={apiKey}
      env={urlConfig.env}
      scheme="embed"
      userAgentPrefix="miri-web-embed/0.0.1"
      auth={{
        token,
        // Host-managed token — we treat the token as opaque and pass
        // it straight to Miri's auth-exchange. `firebase` is the
        // closest existing provider; the SDK accepts the token as-is.
        provider: 'firebase' as const,
        config: { project_id: 'miri-staging' },
      }}
      logError={(...args) => console.warn('[Miri]', ...args)}
    >
      <View style={styles.chatWrap}>
        <MiriChat moduleName={ModuleNames.QUICKSTART}>
          <MessagesList />
          <ChatInput />
        </MiriChat>
      </View>
    </MiriAppProvider>
  );
};

const styles = StyleSheet.create({
  chatWrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  devPanel: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  devTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  devBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  devInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: 'ui-monospace, Menlo, monospace',
  },
  devTokenInput: {
    minHeight: 100,
  },
});

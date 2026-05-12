// App — web embed of the Miri SDK, rendering the full multi-program
// SKU surfaces as built in the GLP-1 partner example.
//
// Imports Home / Progress / Care directly from
// ../../glp1partnerexample/components/ so the web build stays
// bit-for-bit in sync with the native partner app. The same component
// tree that ships on iOS / Android renders here in the browser via
// react-native-web.
//
// Host model: the host's web portal (browser) or mobile WebView loads
// this bundle. Auth handoff is via URL fragment so the token never
// hits a server log / query string.
//
// URL contract:
//   https://<embed-host>/#token=<miri-token>&apiKey=<...>&env=<staging|production>&tab=home|progress|care|chat

import {
  LogPickerV2,
  MiriAppProvider,
  useActiveMedicationGoal,
  useMiriApp,
  useProgram,
  type BodyComposition,
  type PlanArtifactWeight,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Care } from '../../glp1partnerexample/components/Care';
import { Home } from '../../glp1partnerexample/components/Home';
import { Progress } from '../../glp1partnerexample/components/Progress';

type TabKey = 'home' | 'progress' | 'care';

interface UrlConfig {
  token: string | null;
  apiKey: string | null;
  env: 'staging' | 'production';
  initialTab: TabKey;
}

// Public demo apiKey for the Miri staging `miri-inc` demo care_seeker.
// Real customer integrations override via URL fragment (#apiKey=...).
const DEMO_API_KEY = 'miri-inc_alpha_ios_feb56312-42e9-4b4d-bd11-fa8244388378';

// Tokens are minted on-demand by /api/demo-token (a Vercel serverless
// function that uses Firebase Admin). This is the production pattern —
// the client never sees long-lived credentials, only a short-lived
// (1hr) ID token fetched fresh on each visit.
async function fetchDemoToken(): Promise<string> {
  const res = await fetch('/api/demo-token');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`demo-token endpoint failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { idToken: string };
  return data.idToken;
}

function parseUrlConfig(): UrlConfig {
  const fragment = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(fragment);
  const env = params.get('env');
  const tabRaw = params.get('tab');
  const initialTab: TabKey =
    tabRaw === 'progress' || tabRaw === 'care' ? tabRaw : 'home';
  return {
    // URL-fragment overrides let customers paste their own staging
    // credentials without redeploying.
    token: params.get('token'),
    apiKey: params.get('apiKey') ?? DEMO_API_KEY,
    env: env === 'production' ? 'production' : 'staging',
    initialTab,
  };
}

const LEFT_TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'progress', label: 'Progress' },
];
const RIGHT_TABS: { key: TabKey; label: string }[] = [
  { key: 'care', label: 'Care' },
];

// Tab bar with LogPickerV2 in the center slot — matches the iOS / Android
// partner app shell. The SDK's LogPickerV2 brings its own "+" button +
// portal-rendered grid of log options (Meal, Mood, Water, Sleep, Weight,
// Medication, …).
const TabBar: FC<{
  active: TabKey;
  onChange: (key: TabKey) => void;
}> = ({ active, onChange }) => {
  const { getWeightProgress, getBodyComposition } = useMiriApp();
  const { program } = useProgram();
  const { medicationGoal, refetch: refetchMedicationGoal } =
    useActiveMedicationGoal();
  const [weightProgress, setWeightProgress] = useState<{
    weightTracking: WeightTracking | null;
    weightGoal: PlanArtifactWeight | null;
  } | null>(null);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWeightProgress().then((wp) => {
      if (!cancelled) setWeightProgress(wp);
    });
    getBodyComposition().then((bc) => {
      if (!cancelled) setBodyComposition(bc);
    });
    return () => {
      cancelled = true;
    };
  }, [getWeightProgress, getBodyComposition]);

  const handleUpdateTracking = useCallback(async () => {
    const [wp, bc] = await Promise.all([
      getWeightProgress(),
      getBodyComposition(),
    ]);
    setWeightProgress(wp);
    setBodyComposition(bc);
  }, [getWeightProgress, getBodyComposition]);

  return (
    <View style={styles.tabBar}>
      {LEFT_TABS.map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          active={active === tab.key}
          onPress={() => onChange(tab.key)}
        />
      ))}

      <View style={styles.centerSlot}>
        {program ? (
          <LogPickerV2
            weightProgress={
              weightProgress ?? { weightGoal: null, weightTracking: null }
            }
            bodyComposition={bodyComposition}
            onUpdateTracking={handleUpdateTracking}
            onNavigateToChat={() => undefined}
            onNavigateToLogMeal={() => undefined}
            onLogSuccess={() => refetchMedicationGoal()}
            medicationGoal={medicationGoal}
          />
        ) : null}
      </View>

      {RIGHT_TABS.map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab}
          active={active === tab.key}
          onPress={() => onChange(tab.key)}
        />
      ))}
    </View>
  );
};

const TabButton: FC<{
  tab: { key: TabKey; label: string };
  active: boolean;
  onPress: () => void;
}> = ({ tab, active, onPress }) => (
  <Pressable
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {tab.label}
    </Text>
  </Pressable>
);

const TabContent: FC<{ tab: TabKey }> = ({ tab }) => {
  switch (tab) {
    case 'home':
      return <Home />;
    case 'progress':
      return <Progress />;
    case 'care':
      return <Care />;
  }
};

const DevPanel: FC<{
  apiKey: string;
  token: string;
  onApiKey: (v: string) => void;
  onToken: (v: string) => void;
  errorMessage?: string | null;
}> = ({ apiKey, token, onApiKey, onToken, errorMessage }) => (
  <ScrollView style={styles.devPanelScroll} contentContainerStyle={styles.devPanel}>
    <Text style={styles.devTitle}>Miri SDK — Web Embed</Text>
    <Text style={styles.devBody}>
      Self-served React-Native-Web build of the Miri SDK, mounting the same
      Home / Progress / Care surfaces shipped in the iOS / Android GLP-1
      partner example. Pass auth via URL fragment, or paste below.
    </Text>
    {errorMessage ? (
      <View style={styles.errorBlock}>
        <Text style={styles.errorTitle}>Auto-token fetch failed</Text>
        <Text style={styles.errorBody}>{errorMessage}</Text>
        <Text style={styles.errorBody}>Falling back to manual paste.</Text>
      </View>
    ) : null}
    <Text style={styles.devLabel}>URL fragment shape</Text>
    <Text style={styles.devCode}>
      #token=...&apiKey=...&env=staging&tab=home|progress|care
    </Text>
    <Text style={styles.devLabel}>API key</Text>
    <TextInput
      style={styles.devInput}
      placeholder="miri-inc_alpha_…"
      value={apiKey}
      onChangeText={onApiKey}
      autoCapitalize="none"
      autoCorrect={false}
    />
    <Text style={styles.devLabel}>Bearer token</Text>
    <TextInput
      style={[styles.devInput, styles.devTokenInput]}
      placeholder="Token"
      value={token}
      onChangeText={onToken}
      autoCapitalize="none"
      autoCorrect={false}
      multiline
    />
  </ScrollView>
);

export const App: FC = () => {
  const urlConfig = useMemo(() => parseUrlConfig(), []);
  const [overrideToken, setOverrideToken] = useState<string>('');
  const [overrideKey, setOverrideKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabKey>(urlConfig.initialTab);
  const [autoToken, setAutoToken] = useState<string | null>(null);
  const [autoTokenError, setAutoTokenError] = useState<string | null>(null);

  // If no token is supplied via URL fragment or paste, request one from
  // the demo-token endpoint. This keeps the bare URL working forever —
  // every visit gets a fresh 1-hour token. Customers integrating for
  // real always pass their own token via MiriAppProvider, never via
  // this endpoint.
  useEffect(() => {
    if (urlConfig.token || overrideToken) return;
    if (autoToken || autoTokenError) return;
    fetchDemoToken()
      .then(setAutoToken)
      .catch((err) => setAutoTokenError(String(err)));
  }, [urlConfig.token, overrideToken, autoToken, autoTokenError]);

  const token = overrideToken || urlConfig.token || autoToken;
  const apiKey = overrideKey || urlConfig.apiKey;

  if (autoTokenError && !overrideToken) {
    return (
      <DevPanel
        apiKey={overrideKey}
        token={overrideToken}
        onApiKey={setOverrideKey}
        onToken={setOverrideToken}
        errorMessage={autoTokenError}
      />
    );
  }

  if (!token || !apiKey) {
    return (
      <View style={styles.loadingPanel}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Miri demo…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <MiriAppProvider
        apiKey={apiKey}
        env={urlConfig.env}
        scheme="embed"
        userAgentPrefix="miri-web-embed/0.0.1"
        auth={{
          token,
          provider: 'firebase' as const,
          config: { project_id: 'miri-staging' },
        }}
        logError={(...args) => console.warn('[Miri]', ...args)}
      >
        <View style={styles.appShell}>
          <View style={styles.tabContent}>
            <TabContent tab={activeTab} />
          </View>
          <TabBar active={activeTab} onChange={setActiveTab} />
        </View>
      </MiriAppProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  tabContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    height: 72,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderTopWidth: 2,
    borderTopColor: '#0F172A',
  },
  centerSlot: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#0F172A',
  },
  devPanelScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  devPanel: {
    padding: 32,
    gap: 12,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
  },
  devTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  devBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  devLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devCode: {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: 12,
    backgroundColor: '#E2E8F0',
    padding: 10,
    borderRadius: 8,
    color: '#0F172A',
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
  loadingPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
  },
  errorBlock: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  errorBody: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'ui-monospace, Menlo, monospace',
  },
});

# Miri SDK — Web Integration Guide

**Audience:** Engineering teams integrating Miri into a web portal or WebView-wrapped mobile app
**Contact:** your Miri service rep

---

## Overview

Miri ships two integration paths for web:

1. **`@miri-ai/miri-react-native/web` paired with `@miri-ai/miri-react-native-web`** — the SDK with its web companion package. Drop components into your own React app and compose them however your product needs. Use this when you want Miri surfaces (chat, insights, scores, habit tracking, logging) woven into your portal's UX.
2. **Hosted chat embed** — a Miri-hosted URL you drop into an iframe or WebView. Use this when you want a turnkey coach experience inside a portal without writing any SDK integration code.

Both paths run identically inside a browser portal and inside a WebView-wrapped mobile app, so the same integration covers both surfaces.

A live demo is available at **https://dist-sand-tau-14.vercel.app/** — it mounts the full multi-program SKU (Home / Progress / Care) against the Miri staging environment. The exact source for this deployment is in the reference integration linked below.

---

## Path 1 — Self-served SDK with the web companion package

### Install

```bash
npm install @miri-ai/miri-react-native @miri-ai/miri-react-native-web \
  react react-dom react-native-web vite
```

- `@miri-ai/miri-react-native` — the SDK itself (same package used by the iOS / Android apps).
- `@miri-ai/miri-react-native-web` — companion package that ships the Vite plugin, runtime polyfills, and shim modules needed to bundle the SDK on web.

### Configure Vite

```ts
// vite.config.mts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { configureViteForMiri } from '@miri-ai/miri-react-native-web/vite';

const miri = configureViteForMiri();

export default defineConfig({
  ...miri,
  plugins: [...(miri.plugins ?? []), reactNativeWeb(), react()],
  // ...your own config
});
```

`configureViteForMiri()` returns the resolver aliases, the JSX-in-`.js` transform plugin, the `optimizeDeps` excludes, and the rollup `shimMissingExports` flag needed for the SDK to bundle cleanly. Spread it into your config; your own plugins and options sit alongside.

### Install the runtime polyfill

In your `main.tsx` / `main.ts`, set up the runtime polyfill before any SDK component imports:

```ts
// main.tsx
import { setupMiriWebRuntime } from '@miri-ai/miri-react-native-web/runtime';

await setupMiriWebRuntime();

const { App } = await import('./App');
const { AppRegistry } = await import('react-native');

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
```

`setupMiriWebRuntime` installs a `window.require` dispatcher that resolves the small number of runtime `require()` calls left in the SDK bundle (React Native Web's `createReactDOMStyle`, `preprocess`, Lottie, Linear Gradient) and provides a permissive proxy fallback for native-module probes that don't apply on web.

### Import components

```tsx
import {
  MiriAppProvider,
  Chat,
  MessagesList,
  ChatInput,
  QuickCheckinFlow,
  LogPickerV2,
  LeverBreakdown,
  StreakTracking,
  WellnessScore,
  HabitTracking,
  KeySignalsRow,
  InsightCard,
} from '@miri-ai/miri-react-native/web';
```

The `/web` subpath re-exports the full SDK surface and signals that the import is for a web bundle. Component APIs are identical to the native SDK — the same `<Chat>`, `<QuickCheckinFlow>`, `<LogPickerV2>` that work in your iOS / Android RN app work here. The companion package handles the React Native → React Native Web translation, native-dep shimming, and runtime polyfills.

### Reference integration

A complete working integration — Vite, the companion package, an `api/demo-token.ts` serverless function showing the server-side auth pattern, and the full Home / Progress / Care tab composition — lives in `miri-react-native-sdk-examples`:

🔗 https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample

Clone the branch, copy `webexample/`, swap in your own auth and component composition, and you have a working web integration in under an hour.

### Wire up the provider

The pattern below is straight from `webexample/src/App.tsx`:

```tsx
function PatientPortal() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Your backend mints a Firebase ID token tied to your auth system,
    // then hands it to the SDK. See the "Authentication" section below.
    fetchMiriToken().then(setToken);
  }, []);

  if (!token) return <Loading />;

  return (
    <MiriAppProvider
      apiKey={process.env.MIRI_API_KEY!}
      env="production"
      auth={{
        token,
        provider: 'firebase',
        config: { project_id: 'your-firebase-project-id' },
      }}
    >
      <YourHeader />
      <QuickCheckinFlow cards={cards} />
      <WellnessScore />
      <LeverBreakdown />
      <Chat />
    </MiriAppProvider>
  );
}
```

That's the full integration shape. No bundler aliases, shim files, or transform plugins. Components compose with your own UI exactly as on native.

### Authentication

The SDK accepts a Firebase ID token tied to a Miri `care_seeker_id`. Your backend exposes a small **auth webhook** that the client calls on session start; the webhook authenticates your own user (cookie / JWT / OAuth — whatever your existing auth uses), maps that user to their Miri care_seeker, and returns a fresh Firebase ID token the SDK can use.

#### How the mapping is established

Each end-user maps 1:1 to a Miri `care_seeker_id`. The mapping is created once, when you onboard the user — typically at the time you create the Miri patient record from your enrollment flow. Store the `care_seeker_id` on your own user row so subsequent lookups are a single column read.

#### The auth webhook

Expose an endpoint on your backend — for example `POST /api/miri-token` — that:

1. Authenticates the incoming request using your existing auth (session cookie, bearer JWT, etc.)
2. Looks up the Miri `care_seeker_id` for the authenticated user
3. Mints a Firebase custom token for that `care_seeker_id` using Firebase Admin
4. Exchanges the custom token for a short-lived (1 hour) ID token via the Firebase Auth REST API
5. Returns the ID token to the client

Reference implementation (Node, using `firebase-admin`):

```ts
// /api/miri-token
import { getAuth } from 'firebase-admin/auth';

export async function handler(req, res) {
  // 1. Authenticate the request against your own auth system.
  const yourUser = await authenticateRequest(req);
  if (!yourUser) return res.status(401).end();

  // 2. Look up the care_seeker_id you stored at onboarding.
  const careSeekerId = yourUser.miri_care_seeker_id;

  // 3. Mint a Firebase custom token signed by Firebase Admin.
  const customToken = await getAuth().createCustomToken(careSeekerId);

  // 4. Exchange for a 1-hour Firebase ID token via Firebase Auth REST.
  const exchangeRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const { idToken, expiresIn } = await exchangeRes.json();

  // 5. Return to the client.
  res.json({ idToken, expiresIn });
}
```

A complete working example is at `webexample/api/demo-token.ts` in the reference repo.

#### Client integration

The client calls the webhook on app load, passes the returned token to `MiriAppProvider`, and refreshes by calling the webhook again before the token expires (or eagerly on each app start, since CDN-cached responses keep this cheap):

```tsx
function PatientPortal() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/miri-token', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setToken(data.idToken));
  }, []);

  if (!token) return <Loading />;

  return (
    <MiriAppProvider
      apiKey={process.env.MIRI_API_KEY!}
      env="production"
      auth={{
        token,
        provider: 'firebase',
        config: { project_id: 'your-firebase-project-id' },
      }}
    >
      {/* your composition */}
    </MiriAppProvider>
  );
}
```

#### Where Firebase fits

The SDK uses Firebase Auth as the token format. Your backend signs tokens using a Firebase Admin service account that your Miri service rep provisions for your organization. The Firebase project is operated by Miri — you don't run a Firebase project yourself, you just hold the service-account credentials needed to sign tokens for your users.

### Available components

The `/web` SDK ships the full multi-program SKU:

| Category | Components |
|---|---|
| Context | `MiriAppProvider` |
| Chat | `Chat`, `MessagesList`, `ChatInput` |
| Quick Check-in | `QuickCheckinFlow` (cards: medication, mood, symptoms, movement, sleep, hydration) |
| Logging | `LogPickerV2`, individual tile components |
| Progress | `LeverBreakdown`, `StreakTracking`, `WellnessScore`, `WeightChart` |
| Tracking | `HabitTracking`, `KeySignalsRow` |
| Insights | `InsightCard`, `PriorityActionCard`, `CoachChipRail` |

Component APIs are identical to the native SDK. The same `<Chat>`, `<QuickCheckinFlow>`, etc. that work in your iOS / Android RN app work here.

### Behavior on web

Most components run identically to native. A small set of capabilities have web-specific behavior:

| Capability | Native | Web |
|---|---|---|
| Food photo capture | Vision Camera | Web Camera API (`getUserMedia`) with file-upload fallback |
| Body stats / activity import | HealthKit / Health Connect | Manual entry — components gate the import UI to native |
| Date / time pickers | Native modal | HTML5 `<input type="date">` |
| Animations | Reanimated native | Reanimated web build / CSS |
| Push notifications | Native push | Not surfaced in v1 (handled separately via web-push) |
| Haptics | Native | Silently no-op |

All other surfaces — chat, scoring, lever breakdowns, insights, habit tracking, weight charting, quick check-in cards — run identically.

### Versioning

`@miri-ai/miri-react-native` follows semver. Web and native builds ship together; you pin one version across both. Breaking changes only land in new majors, which you opt into by bumping the pinned version.

---

## Path 2 — Hosted chat embed

If you want a coach experience in your portal without writing SDK integration code, embed a Miri-hosted URL:

```tsx
// In a browser portal
<iframe
  src={`https://embed.miri.ai/v1/chat?token=${miriToken}`}
  width="100%"
  height="600"
  allow="microphone; camera"
/>
```

```tsx
// Inside a WebView in your RN wrapper
<WebView source={{ uri: `https://embed.miri.ai/v1/chat?token=${miriToken}` }} />
```

Miri hosts the bundle, the runtime, and the upgrade cadence. You pin the version (`/v1/`, `/v2/`) and decide when to upgrade. Same architectural shape as Stripe Checkout, Plaid Link, or Intercom Messenger.

The hosted embed covers the Chat surface only. For composable layouts where you arrange Miri components inside your own UX, use the self-served `/web` SDK.

---

## Web-embedded mobile apps

For mobile apps that wrap a web app in a WebView, both integration paths above work without any additional setup:

- The hosted embed runs inside a WebView the same way it runs in a browser tab.
- The self-served `/web` SDK is part of your web bundle — the WebView wrapper is transparent to the SDK.

Modern iOS and Android WebViews support `getUserMedia`, so the food photo capture flow works inside a WebView the same as in a browser portal.

---

## Live demo

A live integration of the `/web` SDK is deployed at:

**https://dist-sand-tau-14.vercel.app/**

It mounts the full multi-program SKU (Home, Progress, Care tabs) against a Miri staging care_seeker. The same `Home.tsx`, `Progress.tsx`, and `Care.tsx` components that ship on iOS and Android render in the browser via the `/web` SDK.

The demo includes a Vercel serverless function (`/api/demo-token`) that demonstrates the production server-side token-minting pattern described in the Authentication section.

---

## Appendix — reference repo

The complete reference integration is on the `web-sdk-example` branch of `miri-react-native-sdk-examples`:

🔗 https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample

It demonstrates:

- Vite bundling the SDK for web
- `MiriAppProvider` configured with a Firebase ID token
- The full Home / Progress / Care surfaces composed in a 3-tab layout
- A serverless `/api/demo-token` function showing the production server-side auth pattern

Clone the branch, copy `webexample/`, point it at your own staging environment, and you have a working integration in under an hour.

For repo access or production API keys, contact your Miri service rep.

# Miri SDK — Web Integration Guide

**Audience:** Engineering teams integrating Miri into a web portal or WebView-wrapped mobile app
**Contact:** your Miri service rep

---

## Overview

Miri ships two integration paths for web:

1. **`@miri-ai/miri-react-native` with the `webexample/` reference integration** — a complete Vite + React Native Web setup that bundles the full SDK for web. Clone the reference, point it at your environment, and you have a working integration. Use this when you want Miri surfaces (chat, insights, scores, habit tracking, logging) woven into your portal's UX.
2. **Hosted chat embed** — a Miri-hosted URL you drop into an iframe or WebView. Use this when you want a turnkey coach experience inside a portal without writing any SDK integration code.

Both paths run identically inside a browser portal and inside a WebView-wrapped mobile app, so the same integration covers both surfaces.

A live demo is available at **https://dist-sand-tau-14.vercel.app/** — it mounts the full multi-program SKU (Home / Progress / Care) against the Miri staging environment. The exact source for this deployment is in the reference integration linked below.

---

## Path 1 — Reference Vite + React Native Web integration

### Get the reference integration

```bash
git clone https://github.com/mirihealth/miri-react-native-sdk-examples.git
cd miri-react-native-sdk-examples
git checkout web-sdk-example
cd webexample
npm install
```

The `webexample/` directory contains a complete Vite + React Native Web setup that bundles the full SDK for web. It includes:

- The Vite configuration with `vite-plugin-react-native-web` plus the additional resolvers, shim aliases, and runtime polyfills needed to bundle React Native packages with native-only transitive dependencies
- Pre-built shims for `lottie-react-native`, `react-native-linear-gradient`, `@react-native-community/blur`, Firebase Auth's RN-specific `getReactNativePersistence`, and the `react-native/Libraries/Utilities/codegen*` subpaths
- A reference Vercel deployment (`api/demo-token.ts`) showing the server-side token-minting pattern

Browse the branch directly: https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample

### Copy + adapt

Copy the `webexample/` directory into your codebase as the starting point for your web integration. The pieces you adapt for your environment:

1. **`src/App.tsx`** — replace the demo Home / Progress / Care tabs with your own component composition. The `MiriAppProvider` setup is the only Miri-specific code; everything else is your UI.
2. **`api/demo-token.ts`** — replace the hardcoded demo `care_seeker_id` with a lookup against your auth system. This is the only server-side code path; the integration is otherwise fully client-side.
3. **`.env`** — set your own `MIRI_API_KEY` (from your Miri service rep) and Firebase project credentials.

The `vite.config.mts` and `shims/` directory don't need changes — they're the SDK plumbing.

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
} from '@miri-ai/miri-react-native';
```

The same import paths used by the native (iOS / Android) SDK work on web — the bundler config in `webexample/` handles the React Native → React Native Web translation, the native-dep shimming, and the runtime polyfills for you.

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

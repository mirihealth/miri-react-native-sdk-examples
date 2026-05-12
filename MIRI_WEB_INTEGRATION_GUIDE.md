# Miri SDK — Web Integration Guide

**Audience:** Engineering teams integrating Miri into a web portal or WebView-wrapped mobile app
**Contact:** your Miri service rep

---

## Overview

Miri ships two integration paths for web:

1. **`@miri-ai/miri-react-native/web`** — an npm-installable, turnkey React build of the full SDK. Drop components into your own React app and compose them however your product needs. Use this when you want Miri surfaces (chat, insights, scores, habit tracking, logging) woven into your portal's UX.
2. **Hosted chat embed** — a Miri-hosted URL you drop into an iframe or WebView. Use this when you want a turnkey coach experience inside a portal without writing any SDK integration code.

Both paths run identically inside a browser portal and inside a WebView-wrapped mobile app, so the same integration covers both surfaces.

A live demo of the self-served `/web` SDK is available at **https://dist-sand-tau-14.vercel.app/** — it mounts the full multi-program SKU (Home / Progress / Care) against the Miri staging environment.

---

## Path 1 — Self-served `/web` SDK

### Install

```bash
npm install @miri-ai/miri-react-native react react-dom react-native-web
```

Peer dependencies (`react`, `react-dom`, `react-native-web`) are not bundled. You can pin to any compatible major version.

### Import

Import from the `/web` entry point:

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

The web entry pre-resolves all of the SDK's native peer dependencies (Reanimated, Safe Area Context, SVG, Lottie, Linear Gradient, Vision Camera, HealthKit, etc.) — so you get a clean bundle without any bundler configuration on your side.

### Wire up the provider

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

The SDK accepts a Firebase ID token. Your backend mints the token tied to your existing user identity:

```ts
// On your server (Node example using firebase-admin)
import { getAuth } from 'firebase-admin/auth';

async function mintMiriToken(yourUserId: string) {
  // Map your user to a Miri care_seeker (1:1 binding established at
  // care-seeker creation time).
  const careSeekerUid = await lookupCareSeekerForUser(yourUserId);
  const customToken = await getAuth().createCustomToken(careSeekerUid);

  // Exchange custom token for ID token via Firebase Auth REST API.
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const { idToken } = await res.json();
  return idToken;
}
```

Then expose an endpoint your client calls on session start. Firebase ID tokens are short-lived (1 hour) — your client refreshes by calling the endpoint again, or by using the Firebase Web SDK to refresh client-side with a refresh token.

A working example of this pattern is in the reference repo (see Appendix).

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

A complete reference integration is available in the `miri-react-native-sdk-examples` repo under the `webexample/` directory. It demonstrates:

- Vite bundling the `/web` SDK
- `MiriAppProvider` configured with a Firebase ID token
- The full Home / Progress / Care surfaces composed in a 3-tab layout
- A serverless `/api/demo-token` function showing the production auth pattern

Clone the repo, copy `webexample/`, point it at your own staging environment, and you have a working integration in under an hour.

For repo access or production API keys, contact your Miri service rep.

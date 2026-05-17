# Web integration

**Audience:** Engineering teams integrating Miri into a web portal or WebView-wrapped mobile app.

---

## Overview

Miri ships two integration paths for web:

1. **`@miri-ai/miri-react-native/web` paired with `@miri-ai/miri-react-native-web`** — the SDK with its web companion package. Drop components into your own React app and compose them however your product needs. Use this when you want Miri surfaces (chat, insights, scores, habit tracking, logging) woven into your portal's UX.
2. **Hosted embed** — Miri-hosted URLs you drop into an iframe or WebView. Use this when you want turnkey coach / logging / progress surfaces inside a portal without writing any SDK integration code. Documented in full in [Hosted embed](./09-hosted-embed.md).

Both paths run identically inside a browser portal and inside a WebView-wrapped mobile app, so the same integration covers both surfaces.

A live demo is available at **https://dist-sand-tau-14.vercel.app/** — it mounts the full multi-program SKU (Home / Progress / Care) against the Miri staging environment. The exact source is in the reference integration linked below.

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
  // …your own config
});
```

`configureViteForMiri()` returns the resolver aliases, the JSX-in-`.js` transform plugin, the `optimizeDeps` excludes, and the rollup `shimMissingExports` flag needed for the SDK to bundle cleanly. Spread it into your config; your own plugins and options sit alongside.

### Install the runtime polyfill

In your `main.tsx` / `main.ts`, set up the runtime polyfill **before any SDK component imports**:

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

The `/web` subpath re-exports the full SDK surface and signals that the import is for a web bundle. Component APIs are identical to the native SDK — the same `<Chat>`, `<QuickCheckinFlow>`, `<LogPickerV2>` that work in your iOS / Android RN app work here.

### Wire up the provider

```tsx
import { MiriAppProvider, QuickCheckinFlow, WellnessScore, LeverBreakdown, Chat } from '@miri-ai/miri-react-native/web';

function PatientPortal() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Your backend mints a Firebase ID token tied to your auth system,
    // then hands it to the SDK. See ./02-authentication.md.
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

That's the full integration shape. No bundler aliases, shim files, or transform plugins beyond `configureViteForMiri()`. Components compose with your own UI exactly as on native.

### Authentication

Same shape as native — see [Authentication](./02-authentication.md), which covers the Firebase server-side custom-token-mint pattern that's the right default for web.

A complete server example is at [`webexample/api/demo-token.ts`](https://github.com/mirihealth/miri-react-native-sdk-examples/blob/web-sdk-example/webexample/api/demo-token.ts) — a Vercel serverless function that signs a Firebase custom token and exchanges it for a 1-hour ID token.

### Reference integration

A complete working integration — Vite, the companion package, the serverless function, and the full Home / Progress / Care tab composition — lives in this repo on the `web-sdk-example` branch:

🔗 [`webexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample)

Clone the branch, copy `webexample/`, swap in your own auth and component composition, and you have a working web integration in under an hour.

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

## Path 2 — Hosted embed

If you want Miri surfaces in your portal without writing any SDK integration code, drop a Miri-hosted URL into an iframe:

```html
<iframe
  src="https://embed.miri.ai/coach?api_key=YOUR_KEY#token=USER_TOKEN"
  width="100%"
  height="600"
  style="border: 0;"
  allow="microphone; camera"
></iframe>
```

Miri hosts the bundle, the runtime, and the upgrade cadence — same architectural shape as Stripe Checkout, Plaid Link, or Intercom Messenger. The embed exposes standalone routes for coach, logging, and progress, theming via URL params, and a custom-auth-webhook flow for handing it your own tokens.

**This path is documented in full in [Hosted embed](./09-hosted-embed.md)** — routes, parameters, theming, the playground, demo tokens, and the two production authentication models. For composable layouts where you arrange Miri components inside your own UX, use the self-served SDK in Path 1 above.

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

The demo includes a Vercel serverless function (`/api/demo-token`) that demonstrates the production server-side token-minting pattern described in the [Authentication](./02-authentication.md) section.

---

## Troubleshooting

| Symptom | Likely fix |
|---|---|
| `require is not defined` at runtime | You skipped `setupMiriWebRuntime()` or imported SDK components before calling it. Move the SDK import after the runtime setup. |
| Vite refuses to bundle the SDK (cryptic resolver errors) | Make sure `configureViteForMiri()` is spread *into* your config rather than overwriting it — `...miri` first, then your overrides. |
| Reanimated animations are jittery / silent | Reanimated's web build needs an explicit Babel plugin. Most Vite setups don't need it, but if you see issues, follow the [Reanimated web setup](https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/). |
| Camera permissions denied in a WebView | iOS WebView needs `NSCameraUsageDescription` set in the native shell's Info.plist; Android needs the camera permission in the wrapping APK. The SDK can't request permissions through the WebView boundary. |
| TypeScript can't find `@miri-ai/miri-react-native/web` types | Ensure your `tsconfig.json` has `"moduleResolution": "bundler"` (or `"node16"` / `"nodenext"`) — subpath exports aren't resolved under classic `"node"`. |

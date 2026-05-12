# Miri SDK — Web Integration Guide

**Audience:** Host engineering teams integrating Miri into a web or web-embedded portal
**Contact:** Boris (boris@miri.ai)

---

## TL;DR

`@miri-ai/miri-react-native` is built on React Native. You're right that the default package's transitive native peer deps don't bundle cleanly inside a `react-native-web` host build — that's exactly why we ship `@miri-ai/miri-react-native/web`, a parallel turnkey web build with all of the integration friction resolved on our side. You `npm install`, import, and use it like any other React library.

For teams that want a coach experience inside a portal without any SDK integration, we also offer a hosted embed (your portal drops a URL into an iframe / WebView).

Both run identically inside a browser portal and inside a WebView-wrapped mobile app, which makes them a clean fit for your setup.

This doc walks through:

1. The two integration paths and what each gets you
2. The native peer dep landscape and how our `/web` build resolves each piece
3. Concrete integration code for each path
4. The handful of features that have web-specific behavior

---

## Two integration paths

| Path | Best for |
|---|---|
| **Hosted embed** | Drop-in chat experience inside your portal — no Miri code in your bundle |
| **Self-served `/web` SDK** | Composing Miri components into your own layout (like our Kalix integration) |

Both are real, supported integration models. Many customers will use both — hosted embed for fast wins, self-served SDK for surfaces they want woven into their own UX.

---

## The native peer dep situation

You correctly diagnosed the problem. Here's what's going on, and how our `/web` build resolves each piece:

### React Native Web is the right starting point

`react-native-web` maps RN primitives (`View`, `Text`, `Pressable`, `StyleSheet`, `Image`, `ScrollView`) to DOM equivalents. Most of our component code uses these primitives, so the surface-level rendering is web-compatible.

### Transitive native peer deps, and how the `/web` build handles each

The SDK pulls in third-party packages that expect a native runtime. The `/web` build addresses each one — you don't see any of this work in your bundle:

| Package | Issue | Web treatment in `/web` build |
|---|---|---|
| `react-native-reanimated` | Imports `react-native/Libraries/Renderer/shims/ReactFabric` | Substitute: reanimated's experimental web build (v4) |
| `react-native-safe-area-context` | Imports `codegenNativeComponent` | Substitute: its published web build |
| `react-native-svg` | Native-backed by default | Substitute: `react-native-svg-web` |
| `lottie-react-native` | Imports `codegenNativeCommands` | Substitute: `lottie-web` wrapper |
| `react-native-linear-gradient` | `.ios.js` / `.android.js` only | Substitute: CSS gradient shim |
| `@react-native-community/blur` | iOS / Android only | Substitute: CSS `backdrop-filter` |
| `@react-native-community/datetimepicker` | Flow syntax + native | Substitute: HTML5 inputs |
| `react-native-fs` | Native file system | Stub: no web FS |
| `@kingstinct/react-native-healthkit` | iOS-only | Stub: gated by `Platform.OS` |
| `react-native-vision-camera` | Native camera | Substitute: Web Camera API + file-upload fallback |
| `react-native-health-connect` | Android-only | Stub |
| `@shopify/react-native-skia` | Native canvas | Stub (no v1 surface uses it) |

### Why this work belongs in the SDK, not in your bundle

If every host did this themselves, you'd configure Flow stripping at the bundler level, alias `react-native` → `react-native-web`, discover and shim each transitive dep above (some only discoverable by bundle failure), and maintain those shims as the SDK evolves. That's recurring tax on you for every SDK update. The `/web` build moves all of it into the SDK package, so you get a clean import.

---

## How `@miri-ai/miri-react-native/web` works

A second build target inside the same npm package — selected by import path.

### Package layout

```json
{
  "name": "@miri-ai/miri-react-native",
  "exports": {
    ".":     { "default": "./lib/module/index.js" },
    "./web": { "default": "./lib/web/index.js" }
  }
}
```

### Host integration

```bash
npm install @miri-ai/miri-react-native react react-dom react-native-web
```

```tsx
import {
  MiriAppProvider,
  Chat,
  QuickCheckinFlow,
  LogPickerV2,
  LeverBreakdown,
  StreakTracking,
  WellnessScore,
} from '@miri-ai/miri-react-native/web';

export function PatientPortal() {
  return (
    <MiriAppProvider auth={{ token, apiKey }}>
      {/* Compose components however you want */}
      <YourHeader />
      <QuickCheckinFlow cards={cards} />
      <WellnessScore />
      <LeverBreakdown />
      <Chat />
    </MiriAppProvider>
  );
}
```

That's the entire integration. No bundler config beyond your existing `react-native-web` setup. We do the shim work, the build step, the dep audit.

### Components shipping in v1

Sourced from the multi-program SKU (the surfaces in our GLP-1 partner example):

- **Context / providers:** `MiriAppProvider`
- **Chat:** `Chat`, `MessagesList`, `ChatInput`
- **Quick Check-in:** `QuickCheckinFlow` with all six card types (medication, mood, symptoms, movement, sleep, hydration)
- **Logging:** `LogPickerV2` with tiles for sleep, water, mood, mind-body, activity, weight, symptoms, food photo
- **Progress:** `LeverBreakdown`, `StreakTracking`, `WellnessScore`, `WeightChart`
- **Tracking:** `HabitTracking`, `KeySignalsRow`

### Behavior differences on web

| Capability | Native | Web |
|---|---|---|
| Food photo capture | Vision Camera (native) | Web Camera API + file-upload fallback |
| Body stats / activity import | HealthKit (iOS) / Health Connect (Android) | Manual entry only — components gate the import UI |
| Date / time pickers | Native modal | HTML5 `<input type="date">` |
| Push notifications | Native push | Out of scope for v1 (web push is a different system) |
| Animations | Reanimated native | Reanimated web build or CSS animations |
| Haptics | Native | Silently no-op |

Everything else (chat, scoring, insights, habit tracking, weight charting, lever breakdowns) runs identically.

### Versioning

- npm semver — you pin a version, we ship within-version fixes only when non-breaking
- Breaking changes get a new major; you opt in by bumping
- Same release cadence as the native SDK

---

## Hosted chat embed

If your team wants a coach experience inside your portal without writing any SDK integration code, embed a Miri-hosted URL:

```tsx
// Inside your patient portal
<iframe
  src={`https://embed.miri.ai/v1/chat?token=${miriToken}`}
  width="100%"
  height="600"
  allow="microphone; camera"
/>
```

Or inside a WebView in your RN wrapper:

```tsx
<WebView source={{ uri: `https://embed.miri.ai/v1/chat?token=${miriToken}` }} />
```

We operate the bundle, the runtime, and the upgrade cadence. You pin the version (`/v1/`, `/v2/`) and decide when to upgrade. Same architectural shape as Stripe Checkout, Plaid Link, Intercom Messenger.

The hosted embed covers the **Chat surface only**. For composable layouts where you arrange Miri components inside your own UX (like our Kalix integration), use the self-served `/web` SDK above.

---

## For web-embedded mobile apps specifically

If your mobile app is a WebView-wrapped web app (Friday's setup), both paths above work:

- **Hosted embed** runs inside your WebView the same way it runs in your browser portal
- **Self-served `/web` SDK** also runs inside your WebView the same way it runs in your browser portal — your web bundle is the same; the WebView wrapper is irrelevant to the SDK

The browser-API gaps (HealthKit, native push) apply equally to web and to WebView-wrapped web. Notably: WebViews on modern iOS and Android **do** support `getUserMedia` for camera access, so food photo capture works in your WebView the same as in a browser portal.

---

## What we'd like to align on

We have a working Vite + react-native-web prototype that has already validated the Chat surface bundles, renders, and connects to our backend end-to-end. Happy to share a runnable version of that with your team so you can poke at it directly.

### A few questions from our side

1. **Scope confirmation** — does the v1 surface list above cover what you'd want to put in your portal? Anything missing we should pull forward?
2. **Layout intent** — are you planning to compose Miri components inside your own screens (self-served SDK route), or do you want a turnkey coach experience inside your portal (hosted embed route)? Or both?
3. **Bundle constraints** — any size budgets or framework constraints (Next.js, Remix, plain Vite, plain Webpack) we should test against specifically?

---

## Appendix — sample integration

A reference Vite integration lives in our `miri-react-native-sdk-examples` repo. It demonstrates:

- Vite bundling the SDK with `vite-plugin-react-native-web`
- `MiriAppProvider`, `Chat`, `MessagesList`, `ChatInput` imported and rendering
- URL-fragment auth handoff working end to end

We're happy to share access so your team has a working baseline to evaluate against.

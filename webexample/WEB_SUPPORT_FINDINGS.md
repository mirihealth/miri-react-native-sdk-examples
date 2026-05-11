# Miri SDK Web Embed — Findings & Recommendation

## TL;DR

A host RN app (Friday's, Kalix, etc.) wanting to load Miri inside a WebView **cannot** today take `@miri-ai/miri-react-native` from npm, drop it into their own Vite/Webpack build, and ship. The SDK pulls in too many transitive native-only deps. **We need to ship a `@miri-ai/miri-react-native-web` build that the SDK team owns and tests**, then hosts consume that.

Recommended path: **hosted embed page**, not self-served bundle.

## What I tried

Built a Vite + React Native Web prototype in `webexample/`:

- Bundler: Vite 5 with `vite-plugin-react-native-web` (strips Flow types, aliases `react-native` → `react-native-web`)
- Wired up `MiriAppProvider` + `<Chat>` + `<MessagesList>` + `<ChatInput>`
- Token handoff via URL fragment (`#token=...&apiKey=...`)
- Shimmed every native-only dep I hit

## What worked

- Vite bundles the SDK after the Flow-stripping plugin is in place.
- The chat surface (`MessagesList`, `ChatInput`, `Chat` context provider) imports cleanly.
- RN primitives (`View`, `Text`, `StyleSheet`, `Pressable`, `ScrollView`) work via RN Web.
- URL-fragment auth handoff is trivial — `MiriAppProvider` accepts `auth.token` as a prop.

## What didn't work

The SDK pulls in transitive deps that import RN internals via subpaths:

| Package | Problematic import | What it needs |
|---|---|---|
| `react-native-reanimated` | `react-native/Libraries/Renderer/shims/ReactFabric` | Web shim |
| `react-native-safe-area-context` | `react-native/Libraries/Utilities/codegenNativeComponent` | Web shim |
| `lottie-react-native` | `react-native/Libraries/Utilities/codegenNativeCommands` | Web shim |
| `@react-native-community/datetimepicker` | Flow syntax in `.js` source | Stub or polyfill |
| `react-native-fs` | Flow syntax | Stub |
| `react-native-linear-gradient` | Flow syntax + `.ios.js` / `.android.js` platform extensions | Web shim |
| `@react-native-community/blur` | `.ios.tsx` / `.android.tsx` platform extensions | Web shim |
| `@kingstinct/react-native-healthkit` | iOS-only | Stub |
| `react-native-vision-camera` | Native camera | Stub |
| `@shopify/react-native-skia` | WebGL adapter exists but heavy | Web build |

I stubbed most of these. Three remained blocking the final bundle — `vite-plugin-react-native-web` rewrites bare `react-native` imports to `react-native-web` BEFORE user aliases run, so my custom resolver hooks never got a chance to handle the rewritten subpaths. The next iteration would be a custom Vite plugin with `enforce: 'pre'` resolving those three subpaths.

That work is doable in a day or two, but **it's a recurring tax**: every SDK update that adds a new native dep means hosts have to add a new shim. Pushing this onto every customer is the wrong factoring.

## Why this is an SDK problem, not a host problem

Right now `@miri-ai/miri-react-native` ships with an `"exports"` field that points only at the iOS/Android build. Hosts targeting web have to:

1. Set up bundler-level Flow stripping
2. Alias `react-native` → `react-native-web`
3. Discover and shim every transitive native-only dep (the table above)
4. Maintain those shims as the SDK evolves

For one host (Kalix), this is maybe a week of integration. For ten hosts, it's the same week × 10, plus drift as the SDK ships features that pull in new deps. **The fix lives in the SDK package.**

## Recommendation

### Phase 1 (this sprint) — hosted embed

Stand up a Miri-owned URL: `https://embed.miri.ai/chat?token=<short-lived-token>`. It serves a Miri-built RN Web bundle of `<Chat>`. Kalix does:

```jsx
<WebView source={{ uri: `https://embed.miri.ai/chat?token=${token}` }} />
```

That's the integration. We own the bundle, the build pipeline, the runtime. Same shape as Stripe Checkout, Intercom Messenger, Plaid Link. Estimate: 1 engineer × 2 weeks for the embed page + token-exchange API.

### Phase 2 (post-Kalix unblock) — `@miri-ai/miri-react-native/web` entry point

Add a new export to the SDK package:

```json
{
  "exports": {
    ".": { "default": "./lib/module/index.js" },
    "./web": { "default": "./lib/web/index.js" }
  }
}
```

The `/web` build:
- Strips all native-only deps from the bundle graph at build time
- Ships pre-shimmed versions of `react-native-reanimated`, `safe-area-context`, etc. (or vets them for web support and re-exports)
- Documents which SDK surfaces are web-safe (Chat, InsightCard, ScoreCard) and which aren't (LogPickerV2 with camera, HealthKit, weight sheets with native pickers)

Hosts then do:
```jsx
import { MiriAppProvider, Chat } from '@miri-ai/miri-react-native/web';
```

No bundler config gymnastics on their side. They get a curated subset that's guaranteed to bundle and run.

Estimate: 1 engineer × 3-4 weeks for the build setup, dep audit, and CI.

### Phase 3 — full SDK on web (deferred, multi-quarter)

A "build out the same UX on web" pass that:
- Polyfills native APIs we can replace (camera → web camera API, HealthKit → manual entry, etc.)
- Or stubs them with clear "Not available on web" affordances
- Adds web-specific CI

Only worth doing once we have multiple web-shipping customers.

## What to tell Kalix today

Three things:

1. **Yes, WebView embed is the right shape** — they're not wrong to ask. We agree on the architecture.
2. **The integration today is hosted-embed** — give them a Miri-owned URL with a token in the fragment. Auth bridging is the only thing they own.
3. **We're investing in a self-served path** — the `/web` subpath is on our roadmap. ETA after the hosted embed ships.

Don't promise the self-served bundle today. The findings above are exactly why.

## Repro

This directory has the in-progress Vite prototype. To resume:

```bash
cd webexample
cp ../../../miri-react-native-sdk/package/miri-ai-miri-react-native-1.221.0.tgz ./_sdk.tgz
npm install --legacy-peer-deps
npm run dev -- --host 0.0.0.0
# Open via iOS simulator at http://<mac-ip>:5173 to test WebView shape
```

To finish the bundle, the next step is a custom Vite plugin with `enforce: 'pre'` that handles the three remaining subpath rewrites listed above.

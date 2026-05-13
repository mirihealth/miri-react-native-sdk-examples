# Provider & config

`<MiriAppProvider>` is the single mount point for everything the SDK does. It wires up authentication, API client, query cache, theming, every Miri React context, and the bottom-sheet / portal infrastructure that SDK components use.

The shape, in full:

```tsx
<MiriAppProvider
  apiKey={string}              // required — your Miri API key
  env={'production' | 'staging' | 'development'}  // default 'production'
  scheme={string}              // required — your app's URL scheme (without `://`)
  auth={{
    token: string,
    provider: 'firebase' | 'google' | 'apple',
    config: { … },             // see ./02-authentication.md for shape per provider
  }}
  theme={Theme | undefined}    // optional — see ./04-theming.md
  loadingComponent={ReactNode} // optional — shown while auth is in flight
  logError={(msg, err, extra) => void}    // optional
  logInfo={(msg, extra) => void}          // optional
  logDebug={(msg, extra) => void}         // optional
  onScreenView={(screen) => void}         // optional analytics
  trackEvent={(event, props) => void}     // optional analytics
  showMessage={(type, msg, err?) => void} // optional toast handler
  userAgentPrefix={string}     // optional — branding the UA string
>
  {/* your app */}
</MiriAppProvider>
```

## Required props

### `apiKey`

Your Miri API key. Required. Throws if missing. Scoped to a single environment — a staging key won't work against production.

### `auth`

Authentication configuration. See [Authentication](./02-authentication.md) for full provider details.

### `scheme`

Your app's URL scheme (e.g. `'miriai'`), no `://` suffix. The SDK uses this for OAuth callback URLs and deep links. For Expo apps, this is the `scheme` field in `app.json`.

## Strongly recommended props

### `env`

Defaults to `'production'`. During development set `env="staging"` to point at the staging Miri API. Mismatched `env` + API key produces 403s on most calls.

### `theme`

Brand colors + fonts that flow into every Miri component. See [Theming & branding](./04-theming.md).

### `logError`

Without this, SDK errors disappear silently. Wire it to your crash reporter (Sentry, Datadog, Bugsnag) so you see partner-facing failures in production.

```tsx
logError={(message, error, extra) => {
  Sentry.captureException(error, { extra: { message, ...extra } });
}}
```

### `showMessage`

User-facing toast hook. SDK components call this for non-fatal errors and success confirmations ("Saved", "Couldn't save — please try again"). If unset, those events go nowhere — the user sees no feedback.

```tsx
showMessage={(type, message) => {
  toastRef.current?.show({ type, message });  // your toast lib
}}
```

## Optional props

### `loadingComponent`

Rendered while the SDK exchanges the auth token for a Miri session. Default is a generic spinner. Set this if you want your brand's loading state:

```tsx
loadingComponent={<YourBrandedSplash />}
```

### Analytics hooks

| Prop | When it fires |
|---|---|
| `onScreenView(screen)` | Whenever the user lands on a screen owned by the SDK (Chat, Today, …). |
| `trackEvent(event, properties)` | On user actions the SDK considers product-meaningful (started a check-in, completed a priority action, dismissed an insight, etc.). |

Both are no-ops if unset.

### `logInfo` / `logDebug`

Lower-severity logs. Useful for tracing if you're debugging a specific flow. Production builds can leave these unset.

### `userAgentPrefix`

Prepended to the SDK's User-Agent string on every API call. Lets you identify which partner app is calling the API in server-side logs / analytics. Recommended:

```tsx
userAgentPrefix="metapath-ios/1.4.2"
```

## What `<MiriAppProvider>` mounts internally

It's a stack of contexts the SDK components consume. You can read from any of them via hooks:

| Context | Hook | Provides |
|---|---|---|
| Auth | `useAuth()` | Token state + refresh |
| Base | `useBaseProvider()` | `apiKey`, `logError`, `showMessage`, etc. |
| Care seeker | `useCareSeeker()` | The current user's `care_seeker_id` + display name |
| Practitioner | `usePractitioner()` | The active practitioner (assigned coach) + branding |
| Program | `useProgram()` | The active program + SKU |
| Theme | `useTheme()` | Merged color + font set |
| Settings | `useSettings()` | User settings (notification prefs, etc.) |
| Health data | `useHealthData()` | HealthKit / Health Connect sync state |
| Bottom sheet | `useBottomSheet()` | Programmatic sheet open/close |

See [Hooks reference](./06-hooks.md) for the full hook surface.

## Multi-program apps

If your product spans more than one SKU (e.g. GLP-1 + general nutrition), the active SKU is exposed via `useProgram().program.productSku`. SDK components that adapt their content (`<CoachChipRail>`, `<DailyCheckIn>`, etc.) read from this automatically. You don't pass the SKU in — it's part of the user's care_seeker state on the server.

The SDK switches programs without a remount when the active program changes on the server. To force a refresh on the client (e.g. after the user manually switches programs), call:

```tsx
const { reload } = useProgram();
await reload();
```

## Error boundaries

The SDK does not install a top-level error boundary — that's your app's responsibility. Wrap `<MiriAppProvider>` in your own boundary so a Miri-side render error doesn't take down your app shell:

```tsx
<YourErrorBoundary fallback={<YourErrorScreen />}>
  <MiriAppProvider … />
</YourErrorBoundary>
```

The boundary's `onError` is a good place to pipe SDK exceptions to your crash reporter (in addition to `logError`).

## Native dependencies

The SDK includes several native modules. If you're on bare RN CLI (not Expo Managed), you need to install them in your `Podfile` (iOS) and `build.gradle` (Android). Most bundlers do this automatically via `react-native autolink`; check that your build picks up:

- `react-native-svg`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `react-native-keyboard-controller`
- `@gorhom/portal`
- `@gorhom/bottom-sheet`
- `react-native-vision-camera` (for meal photo capture)
- `@react-native-async-storage/async-storage`

For Expo Managed apps, these are all in the SDK's `peerDependencies` and resolved by EAS Build.

The example apps in this repo show the full native-deps shape for both Expo and bare-CLI projects.

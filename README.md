# miri-react-native-sdk-examples

Examples for the [Miri React Native SDK](https://www.miri.ai/developer/docs/alpha)

## Authentication

The SDK supports multiple auth providers. Each example can be configured to use any of them:

### Google Sign-In (default)

Uses [Google Sign-In](https://react-native-google-signin.github.io/docs/original) to get an ID token, which is exchanged for a Miri token. See the docs for creating a [Google OAuth Client for iOS](https://support.google.com/cloud/answer/15549257?hl=en).

```tsx
<MiriAppProvider
  apiKey="<your-miri-api-key>"
  env="staging"
  auth={{
    token: googleIdToken,
    provider: 'google',
    config: {
      client_id: '<your-google-ios-client-id>',
      issuer_url: 'https://www.googleapis.com/oauth2/v3/certs',
    },
  }}
/>
```

### Firebase Authentication

If your app already uses Firebase Auth, you can pass the Firebase ID token directly. Set `project_id` to **your** Firebase project ID (from `google-services.json` or `GoogleService-Info.plist`).

```tsx
<MiriAppProvider
  apiKey="<your-miri-api-key>"
  env="staging"
  auth={{
    token: firebaseIdToken,  // from user.getIdToken()
    provider: 'firebase',
    config: {
      project_id: '<your-firebase-project-id>',
    },
  }}
/>
```

### Apple Sign-In

```tsx
<MiriAppProvider
  apiKey="<your-miri-api-key>"
  env="staging"
  auth={{
    token: appleIdToken,
    provider: 'apple',
    config: {
      team_id: '<your-apple-team-id>',
      key_id: '<your-apple-key-id>',
      issuer_url: 'https://appleid.apple.com',
    },
  }}
/>
```

### Important: the `env` prop

The `env` prop controls which Miri server the SDK connects to. If omitted, it defaults to `"production"`. During development, set `env="staging"` to use your staging API key.

## Expo Example

An [Expo](https://docs.expo.dev/) managed React Native example app showing a sample implementation for the `@miri-ai/miri-react-native` SDK. Supports both Google and Firebase auth.

See the [README](/expoexample/README.md) for this example.

## React Native Example

A bare [React Native](https://reactnative.dev/) example app showing a sample implementation for the `@miri-ai/miri-react-native` SDK.

See the [README](/reactnativeexample/README.md) for this example.

## Multi-Program Example

A second bare [React Native](https://reactnative.dev/) example app focused on the **multi-program SKU** (GLP-1 / weight-management) surfaces. Demonstrates the four-tab Today / Progress / Log / Coach layout, GLP-1 weight progress card with inline chart, server-driven coach chips, and the `LogPickerV2` + `ScanFoodModal` 4-tile meal-logging hub.

See the [README](/multiprogramexample/README.md) for this example.

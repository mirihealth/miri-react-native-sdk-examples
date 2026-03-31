# expoexample - Miri Example App

This is an Expo-based example app using `@miri-ai/miri-react-native`

## Prerequisites

You'll need a Miri API Key. For auth, choose one of the options below.

### Option A: Google Sign-In (default)

You'll need a [Google OAuth Client for iOS](https://support.google.com/cloud/answer/15549257?hl=en).

Create a `.env` file:

```
MIRI_API_KEY=<Your Miri API Key>
AUTH_PROVIDER=google
GOOGLE_IOS_CLIENT_ID=<Google OAuth Client ID>
GOOGLE_IOS_URL_SCHEME=<Google Auth Client iOS URL Scheme>
```

### Option B: Firebase Authentication

If your app uses Firebase Auth, set your Firebase project ID. The example will use Firebase ID tokens for Miri authentication.

Create a `.env` file:

```
MIRI_API_KEY=<Your Miri API Key>
AUTH_PROVIDER=firebase
FIREBASE_PROJECT_ID=<Your Firebase Project ID>
```

The `FIREBASE_PROJECT_ID` is your project's ID (e.g., `my-app-prod-12345`), found in your Firebase console under Project Settings, or in `google-services.json` / `GoogleService-Info.plist`.

When using Firebase auth, you'll need to get the ID token from your Firebase Auth user (`user.getIdToken()`) and pass it to the auth context via `setToken`.

## Usage

1. Install dependencies

   ```sh
   npm install
   ```

2. Prebuild

   ```sh
   npm run prebuild
   ```

3. Run!

   ```sh
   npm run ios
   ```

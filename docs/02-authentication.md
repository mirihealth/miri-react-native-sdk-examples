# Authentication

The SDK accepts a token from one of three identity providers — Google, Firebase, or Apple — and exchanges it for a Miri session. You hand the token to `<MiriAppProvider>` via the `auth` prop; the SDK keeps it fresh and includes it on every API call.

## Pick a provider

| Provider | Use when |
|---|---|
| **Firebase** | You're building a web portal, or your app already uses Firebase Auth, or you want the server-side custom-token-mint pattern (lets you bridge any auth system into Miri without users seeing a sign-in step). |
| **Google Sign-In** | You're building a mobile app that uses Google as its primary identity provider. |
| **Apple Sign-In** | You're building an iOS app that uses Sign in with Apple. |

If you're undecided, default to **Firebase** — the custom-token pattern is the most flexible for production integrations.

## Firebase

The SDK uses Firebase Auth as the token format. The Firebase project is operated by Miri — you don't run your own. Your Miri service rep provisions a service-account credential that lets your backend mint tokens for your users.

### Client-side (mobile / web)

```tsx
import auth from '@react-native-firebase/auth';
import { MiriAppProvider } from '@miri-ai/miri-react-native';

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Two-step: sign in with whatever auth your product uses, then
    // call your backend webhook to mint a Miri-scoped token.
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
        config: { project_id: '<your-firebase-project-id>' },
      }}
    >
      {/* your app */}
    </MiriAppProvider>
  );
}
```

### The server-side webhook (the important part)

For most production integrations, the cleanest pattern is: your backend exposes an **auth webhook** that:

1. Authenticates the incoming request against your own auth system (session cookie, bearer JWT, whatever).
2. Looks up the user's `care_seeker_id` (which you stored when you onboarded them).
3. Mints a Firebase **custom token** for that care_seeker_id using `firebase-admin`.
4. Exchanges the custom token for a 1-hour **ID token** via the Firebase Auth REST API.
5. Returns the ID token to the client.

The client calls the webhook on session start, hands the returned token to `<MiriAppProvider>`, and refreshes by calling the webhook again before the token expires.

```ts
// /api/miri-token  (Node, `firebase-admin`)
import { getAuth } from 'firebase-admin/auth';

export async function handler(req, res) {
  // 1. Your own auth.
  const yourUser = await authenticateRequest(req);
  if (!yourUser) return res.status(401).end();

  // 2. The mapping you saved at onboarding.
  const careSeekerId = yourUser.miri_care_seeker_id;

  // 3. Custom token.
  const customToken = await getAuth().createCustomToken(careSeekerId);

  // 4. Exchange for an ID token.
  const exchangeRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const { idToken, expiresIn } = await exchangeRes.json();

  res.json({ idToken, expiresIn });
}
```

A complete working example is at [`webexample/api/demo-token.ts`](https://github.com/mirihealth/miri-react-native-sdk-examples/blob/web-sdk-example/webexample/api/demo-token.ts).

### Why this shape

- Users never sign in to Miri. From their perspective the app is one product; the Miri bits "just work" because your auth has already vouched for them.
- The token is short-lived (1h). Even if it leaks, the blast radius is bounded.
- The mapping logic stays on your side. If your user model changes (b2b account hierarchy, team-based access, etc.), the Miri side doesn't need to know.

## Google Sign-In

```tsx
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { MiriAppProvider } from '@miri-ai/miri-react-native';

GoogleSignin.configure({
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
});

async function signIn() {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  return userInfo.idToken!;
}

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => { signIn().then(setToken); }, []);

  if (!token) return <Loading />;

  return (
    <MiriAppProvider
      apiKey={process.env.MIRI_API_KEY!}
      env="staging"
      auth={{
        token,
        provider: 'google',
        config: {
          client_id: process.env.GOOGLE_IOS_CLIENT_ID!,
          issuer_url: 'https://www.googleapis.com/oauth2/v3/certs',
        },
      }}
    >
      {/* your app */}
    </MiriAppProvider>
  );
}
```

You'll need a [Google OAuth client for iOS](https://support.google.com/cloud/answer/15549257) and an iOS URL scheme set in `Info.plist` (see the [Google Sign-In setup docs](https://react-native-google-signin.github.io/docs/setting-up/ios#xcode-configuration)).

Reference: [`expoexample`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/main/expoexample) — Expo + Google flow.

## Apple Sign-In

```tsx
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { MiriAppProvider } from '@miri-ai/miri-react-native';

async function signInWithApple() {
  const res = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });
  return res.identityToken!;
}

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => { signInWithApple().then(setToken); }, []);

  if (!token) return <Loading />;

  return (
    <MiriAppProvider
      apiKey={process.env.MIRI_API_KEY!}
      env="staging"
      auth={{
        token,
        provider: 'apple',
        config: {
          team_id: '<your-apple-team-id>',
          key_id: '<your-apple-key-id>',
          issuer_url: 'https://appleid.apple.com',
        },
      }}
    >
      {/* your app */}
    </MiriAppProvider>
  );
}
```

## Token refresh

Tokens are short-lived (~1 hour for Firebase ID tokens). The SDK accepts a fresh `token` value on `<MiriAppProvider>` every render, so the simplest refresh pattern is:

1. Hold the token in state.
2. Re-fetch it on app foreground (or via a `setTimeout` you start when you receive it, scheduled for ~55 minutes).
3. Set the new token; `<MiriAppProvider>` picks it up on next render.

For Firebase, `auth().currentUser.getIdToken(true)` produces a fresh token if you're using `@react-native-firebase/auth` directly. For the webhook pattern, just hit your `/api/miri-token` endpoint again.

## Verifying your setup

If the SDK can't authenticate, you'll see calls fail with 401/403 in your logger (wire `logError` on `<MiriAppProvider>` to surface this — see [Provider & config](./03-provider-and-config.md)).

Common causes:

| Symptom | Likely fix |
|---|---|
| 401 on every request | Token is missing or expired. Check the token flow runs to completion before mounting `<MiriAppProvider>`. |
| 403 on most requests, 200 on auth | API key is wrong or scoped to a different environment. Verify `env` matches your key. |
| Auth works in staging, fails in production | API keys are env-specific; you can't use a staging key against production. Get a production key from your service rep. |
| `provider: 'firebase'` works, `provider: 'google'` doesn't | The Google `client_id` in the SDK config has to match the OAuth client that minted the token. |

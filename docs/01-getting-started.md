# Getting started

The fastest path: clone one of the example apps in this repo, drop in your API key + auth provider, and run it. From there, copy the integration shape into your own app.

## What you'll need from Miri

Before you write any code, contact your Miri service rep for:

1. **A Miri API key** — scoped to either staging or production. Default to staging while you're developing.
2. **A care_seeker mapping plan.** Each end-user maps 1:1 to a Miri `care_seeker_id`. The mapping is created when you onboard the user (typically as part of your enrollment flow). Decide whether you'll create care_seekers via the admin console or via API at signup time.
3. **An auth provider decision.** The SDK accepts Google Sign-In, Firebase Auth, or Apple Sign-In tokens. If you already use one of these, use it. If not, Firebase is the most flexible (custom-token-mint pattern; see [Authentication](./02-authentication.md)).

Once you have those three, you're ready to wire up.

## The smallest possible app

```tsx
import { useEffect, useState } from 'react';
import { MiriAppProvider, Chat } from '@miri-ai/miri-react-native';

export function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Whatever your auth flow produces — Google ID token, Firebase ID token,
    // Apple ID token. See ./02-authentication.md.
    fetchAuthToken().then(setToken);
  }, []);

  if (!token) return <Loading />;

  return (
    <MiriAppProvider
      apiKey="<your-miri-api-key>"
      env="staging"
      auth={{ token, provider: 'firebase', config: { project_id: '<your-firebase-project-id>' } }}
    >
      <Chat />
    </MiriAppProvider>
  );
}
```

That's a full integration. `<MiriAppProvider>` mounts every Miri context the SDK needs (auth, care-seeker identity, active program, practitioner, theme); `<Chat>` (or any other SDK component you compose inside it) reads from those contexts and renders.

## Install

```bash
npm install @miri-ai/miri-react-native@^1.236.0
# Optional, only if you're targeting web:
npm install @miri-ai/miri-react-native-web@^0.1.0
```

Node 20+ is recommended (matches the SDK's `.nvmrc`).

For peer dependencies, the SDK's `package.json` declares them with `*` ranges to give you flexibility — but in practice each example app in this repo pins the versions that are actually tested together (currently `react@19+`, `react-native@0.83+` on the bare-CLI examples). Easiest path: clone an example with the shape you're targeting and start from its `package.json`.

## Run an example

Pick whichever shape best matches what you're building, clone the relevant branch, and run.

| Example | Branch | What it shows |
|---|---|---|
| **`expoexample/`** | `main` | The "hello Miri" baseline — Expo managed, two tabs, Chat + Today |
| **`reactnativeexample/`** | `main` | Same, bare RN CLI |
| **`multiprogramexample/`** | [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/multiprogramexample) | Full multi-program SKU: Today / Progress / Log / Coach |
| **`nutritionistexample/`** | [`feat/nutritionist-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/nutritionist-partner-example/nutritionistexample) | Partner app with Miri behind a single "Coach" tab |
| **`glp1partnerexample/`** | [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/glp1partnerexample) | Partner app with Miri components woven *inline* into Home / Meds |
| **`webexample/`** | [`web-sdk-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample) | Web portal — Vite + RN-Web + serverless token mint |

Full descriptions in **[Example apps](./08-example-apps.md)**.

## Run `expoexample`

Smallest barrier-to-entry:

```bash
git clone https://github.com/mirihealth/miri-react-native-sdk-examples.git
cd miri-react-native-sdk-examples/expoexample
cp .env.example .env  # if present; otherwise create one
# Fill in MIRI_API_KEY and your chosen AUTH_PROVIDER credentials
npm install
npm run ios     # or `npm run android`
```

The expoexample README has full details for both Google and Firebase auth setup.

## Run `multiprogramexample` (recommended for a full feature tour)

```bash
git fetch origin feat/glp1-partner-example
git worktree add ../multiprogram-tour feat/glp1-partner-example
cd ../multiprogram-tour/multiprogramexample
# Fill in .env
npm install
npx pod-install
npm run ios
```

This is the closest thing to "the canonical Miri experience" — it renders every SDK surface (Today, Progress, Log, Coach) against your staging environment.

## Next steps

- **[Authentication](./02-authentication.md)** — pick a provider and wire it up properly. Critical for any non-toy integration.
- **[Components](./05-components.md)** — survey what's available before you decide on a composition.
- **[Example apps](./08-example-apps.md)** — read the integration shapes that match your product.

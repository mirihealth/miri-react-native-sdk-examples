# miri-react-native-sdk-examples

Reference integrations for [`@miri-ai/miri-react-native`](https://www.npmjs.com/package/@miri-ai/miri-react-native) — the SDK that powers Miri's coaching, tracking, and chat surfaces in iOS, Android, and web apps.

## Developer documentation

**👉 Full developer guide: [`docs/`](./docs/README.md)**

Covers getting started, authentication, theming, every public component + hook, the web integration path, and every example app in this repo.

If you just want to dive in:

- **First-touch**: clone [`expoexample/`](./expoexample) and run it against your staging key.
- **Web integration**: see [`docs/07-web-integration.md`](./docs/07-web-integration.md) and the [`webexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample) branch.
- **Turnkey iframe embed**: see [`docs/09-hosted-embed.md`](./docs/09-hosted-embed.md) — iframe-able surfaces at `embed.miri.ai`, no SDK install.
- **Authentication setup**: see [`docs/02-authentication.md`](./docs/02-authentication.md) — covers Google, Firebase, and Apple with full webhook code.

## Example apps

| Example | Branch | Shape |
|---|---|---|
| **`expoexample/`** | `main` | Expo managed — first-touch baseline |
| **`reactnativeexample/`** | `main` | Bare RN CLI baseline |
| **`multiprogramexample/`** | [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/multiprogramexample) | Full multi-program SKU (Today / Progress / Log / Coach) |
| **`nutritionistexample/`** | [`feat/nutritionist-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/nutritionist-partner-example/nutritionistexample) | "Coach tab" partner integration pattern |
| **`glp1partnerexample/`** | [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/glp1partnerexample) | "Inline coaching" partner integration pattern |
| **`webexample/`** | [`web-sdk-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample) | Web portal — Vite + RN-Web + serverless token mint |

Full descriptions in [`docs/08-example-apps.md`](./docs/08-example-apps.md).

## Quick start

```tsx
import { useEffect, useState } from 'react';
import { MiriAppProvider, Chat } from '@miri-ai/miri-react-native';

export function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetchMiriToken().then(setToken);  // your auth flow → Firebase / Google / Apple token
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

That's a full integration. Walk through [`docs/01-getting-started.md`](./docs/01-getting-started.md) for the rest.

## Need help?

- **API keys, production tokens, repo access**: contact your Miri service rep.
- **Bug reports / SDK gaps**: file an issue against this repo.
- **Documentation questions**: ping `miri-platform-channel` in Slack or your service rep.

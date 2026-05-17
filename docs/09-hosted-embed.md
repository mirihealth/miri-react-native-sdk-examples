# Hosted embed

**Audience:** Engineering teams who want Miri surfaces inside a web portal (or a WebView-wrapped mobile app) **without bundling the SDK**.

---

## Overview

The hosted embed is a set of Miri-hosted URLs at **`https://embed.miri.ai/<route>`**. You drop one into an `<iframe>` and a Miri surface — coach, logging, progress — renders inside your product. Miri hosts the bundle, the runtime, and the upgrade cadence. There is no npm install, no bundler config, no React-Native-Web setup on your side.

This is the turnkey path. If you instead want to compose individual Miri components inside your own React layout, use the self-served SDK — see [Web integration](./07-web-integration.md).

| | Hosted embed | Self-served SDK |
|---|---|---|
| Integration effort | An `<iframe>` tag | npm install + Vite config + runtime polyfill |
| Layout control | Fixed per route | Full — compose components yourself |
| Upgrades | Miri ships continuously | You pin and bump the version |
| Best for | A POC, or a portal that wants a coach surface fast | A product weaving Miri deeply into its own UX |

---

## Surfaces

Each route is a standalone surface. Point an iframe at as many as you need.

| Route | Renders |
|---|---|
| `/coach` | Chip grid → topic-scoped chat. Tapping a chip opens chat scoped to that topic (side effects, plateau, dose timing, …). Also handles meal logging via text / voice / photo. **Recommended starting point.** |
| `/log` | Meal logging (`ScanFoodModal`: search, barcode, photo, voice, chat) + a quick check-in for sleep / water / fiber + weight logging. |
| `/progress` | Lever breakdown (sleep, hydration, fiber — tap a lever for its trend + a log action) + weight progress chart + logged-item history. Score / priority / insight cards are opt-in (see params). |
| `/today` | Wellness score + today's priority action + coach insight. |
| `/chat` | Full-viewport chat scoped to a single `module`. |

`/coach` and `/chat` fill the viewport — give those iframes a meaningful height (~600px+). The other routes are scrollable, so you can size the iframe to whatever height your layout allows.

---

## URL shape

```
https://embed.miri.ai/<route>?<query-params>#token=<token>
```

The **token rides in the URL fragment** (`#token=`), not the query string. Fragments are never sent to the server, so the token never lands in access logs, CDN logs, proxy logs, or `Referer` headers. Everything else is a normal query parameter.

| Param | Where | Required | Notes |
|---|---|---|---|
| `token` | `#` fragment | **yes** | The token the embed exchanges for a Miri session. Its form depends on `provider` — see [Authentication](#authentication). ~1-hour lifetime. |
| `provider` | query | no | `firebase` (default) or `custom`. Selects the auth model — see [Authentication](#authentication). |
| `api_key` | query | no | Your Miri tenant key. Defaults to the shared `miri-inc` demo tenant; production integrations always pass their own. |
| `env` | query | no | `staging` (default), `alpha`, or `production`. |
| `module` | query | no | `moduleName` for `/coach` and `/chat` (e.g. `coach_habit_tips`). |
| `intro` | query | no | Overrides the coach's first message. |
| `bg` | query | no | Surface background color (hex, with or without `#`). |
| `text` | query | no | Primary text color (hex). |
| `font` | query | no | Font family. `Inter` and `Poppins` are bundled; other families must be web-loadable. |
| `radius` | query | no | Corner radius in px (0–40) for the embed's own chrome. |
| `score` | query | no | `/progress` only — `1` opts the Wellness Score card in. |
| `priority` | query | no | `/progress` only — `1` opts the Today's Priority card in. |
| `insight` | query | no | `/progress` only — `1` opts the Coach Insight card in. |

---

## Theming

The embed uses a **hybrid theming model**:

- **Background, text color, font, and corner radius** come from the URL params above. They theme both the embed chrome and every SDK surface inside it. A dark `bg` automatically flips the SDK into dark mode.
- **Accent / brand / CTA color** is *not* a URL param. It comes from your **practitioner record** on the Miri side (`brandColor` / `ctaButtonColor`). Set it once and every surface — across every route — inherits it.

See [Theming & branding](./04-theming.md) for the full color cascade.

The fastest way to dial in a look is the playground (below) — it has live controls for all four URL params and a "Copy iframe snippet" button.

---

## The playground

**[`embed.miri.ai/playground`](https://embed.miri.ai/playground)** is a live sandbox. It mints a demo token, renders the three launch surfaces (`/coach`, `/log`, `/progress`) side by side as iframes, and gives you live controls for background, text color, font, corner radius, and the `/progress` opt-in cards. Adjust a control and all three iframes re-theme instantly. "Copy iframe snippet" emits the exact embed code for the current settings.

Share this link with the team doing the integration — it lets them try the surfaces and settle on a look before writing any code.

---

## Iframing it

```html
<iframe
  src="https://embed.miri.ai/coach?api_key=YOUR_KEY&module=coach_habit_tips#token=USER_TOKEN"
  width="100%"
  height="600"
  style="border: 0;"
  allow="clipboard-read; clipboard-write; microphone; camera"
></iframe>
```

```tsx
// Inside a WebView in an RN wrapper — the embed runs the same as in a browser tab.
<WebView source={{ uri: `https://embed.miri.ai/coach?api_key=YOUR_KEY#token=${userToken}` }} />
```

**Frame-ancestors CSP.** The embed sends `Content-Security-Policy: frame-ancestors` allowing `*.miri.ai`, partner origins, and `localhost`. A browser will refuse to render the iframe on an origin that isn't on the list — send your portal's origin to your Miri rep to get it added.

**Sizing.** `/coach` and `/chat` fill their iframe; give them ~600px+ of height. The other routes are scrollable and adopt the iframe's height.

---

## Authentication

The embed needs a per-user token in the `#token=` fragment. It exchanges that token for a Miri session via the SDK. There are two provider models — pick one with the `provider` query param.

### For a POC — demo tokens

For proof-of-concept work you don't need to build anything. `POST` to the embed's own token endpoint:

```bash
curl -X POST https://embed.miri.ai/api/demo-token
# → { "idToken": "...", "expiresIn": 3600, "pool": { "size": 5, "assigned": "abc12…", "fresh": true } }
```

It returns a Firebase ID token for one of five pre-seeded GLP-1 demo care_seekers on `miri-staging` (each with a 21-day data backfill + computed score and insights). CORS is open, so a browser POC running on `localhost` can call it directly. A sticky `miri_demo_uid` cookie pins repeat calls to the same demo user. Tokens last ~1h; re-POST before expiry.

The POC loop is:

```js
const { idToken } = await fetch('https://embed.miri.ai/api/demo-token', { method: 'POST' })
  .then((r) => r.json());
// then render:
<iframe src={`https://embed.miri.ai/coach#token=${idToken}`} />
```

For a real integration, replace `/api/demo-token` with one of the two production patterns below.

### Option A — Firebase token mint (`provider=firebase`, default)

Your backend mints a **Firebase ID token** for the care_seeker and hands it to the iframe. This is the same pattern the demo endpoint uses, and the same server-side webhook flow documented for the SDK in [Authentication](./02-authentication.md#the-server-side-webhook-the-important-part):

1. Your backend authenticates the request against your own auth system.
2. It looks up the user's `care_seeker_id` (stored when you onboarded them).
3. It mints a Firebase **custom token** for that id with `firebase-admin`, then exchanges it for a 1-hour **ID token** via the Firebase Auth REST API.
4. It returns the ID token; your page builds the iframe URL with `#token=<idToken>`.

`provider=firebase` is the default, so no `provider` param is needed. A complete server example is [`webexample/api/demo-token.ts`](https://github.com/mirihealth/miri-react-native-sdk-examples/blob/web-sdk-example/webexample/api/demo-token.ts).

### Option B — Custom auth webhook (`provider=custom`)

Use this when you want auth to happen **in the background** — your user is already signed in to your portal, and you'd rather hand the embed *your own* token than mint a Firebase one. With `provider=custom`, Miri validates the token by calling **a webhook you host**.

```
┌─────────────┐   1. user already signed in
│  Your portal │
│   web page   │   2. page builds iframe URL with your token in #token=
└──────┬───────┘
       │ <iframe src="…/coach?provider=custom#token=YOUR_TOKEN">
       ▼
┌──────────────┐  3. embed → MiriAppProvider(provider:'custom')
│ embed.miri.ai │     → POST /token-exchange to miri-server
└──────┬───────┘
       ▼
┌──────────────┐  4. miri-server looks up the token_validation_url
│  miri-server  │     registered against your api_key, then…
└──────┬───────┘
       │ 5. POST { "token": "YOUR_TOKEN" }
       ▼
┌──────────────────────┐  6. your webhook validates the token and
│ your token_validation │     returns the user's identity
│        _url           │
└──────────────────────┘
       │ 7. { "sub": "<external_uid>", … }
       ▼
   Miri resolves <external_uid> (scoped to your api_key) to a
   care_seeker and issues the session. The embed renders.
```

**What you build: one endpoint.** It receives a JSON `POST` and validates the token against your auth system.

*Request Miri sends to your webhook:*

```json
{ "token": "<the token from the iframe's #token= fragment>" }
```

*Response your webhook must return* — HTTP `200` with a JSON body containing a **`sub`** field:

```json
{ "sub": "<your stable user id for this person>" }
```

- `sub` is **required**. It is the user's stable identifier in *your* system (the "external uid"). Miri maps `(api_key, sub)` to a care_seeker, so the same `sub` must always mean the same person.
- Any other fields you return are passed through to Miri as token claims and ignored if not recognized.
- If the token is invalid or expired, return a non-`2xx` status (or omit `sub`) — Miri will reject the exchange.

A minimal webhook:

```ts
// POST /miri/validate-token  — registered with Miri as your token_validation_url
export async function handler(req, res) {
  const { token } = req.body;

  // Validate `token` however your auth system works — verify a JWT
  // signature, look up a session, call your IdP, etc.
  const user = await verifyYourToken(token);
  if (!user) return res.status(401).end();

  // `sub` is your stable id for this user.
  return res.json({ sub: user.id });
}
```

**What Miri configures.** The `token_validation_url` is registered **on Miri's side**, against your `api_key` — a one-time setup by your Miri rep. You never pass the URL in the iframe; the embed and your portal don't know it. Send your rep the webhook URL (HTTPS) when it's ready.

**Wiring the iframe.** Once the webhook is registered, add `provider=custom` and put *your* token in the fragment:

```html
<iframe src="https://embed.miri.ai/coach?api_key=YOUR_KEY&provider=custom#token=YOUR_PORTAL_TOKEN" …></iframe>
```

> **Optional — multi-user authorization.** If a single token should be allowed to act for several care_seekers (e.g. a clinician viewing patients), Miri also sends an `authorization_request` object to your webhook listing the `external_uid`s to authorize, and expects the validated subset back. Most integrations don't need this — ask your Miri rep if yours does.

### Token refresh

Tokens are short-lived (~1 hour) under both providers. The embed reads the token once on load and does not refresh it itself. Refresh by **swapping the iframe `src`** with a fresh `#token=` before the old one expires:

1. When you get a token, note its lifetime (`expiresIn` for the Firebase exchange).
2. Schedule a refresh ~1 minute before expiry: fetch a new token and set the iframe's `src` (or `key`, in React) to force a reload.
3. Also refresh when the page returns to the foreground after being backgrounded past the token's lifetime.

---

## Web-embedded mobile apps

If your mobile app wraps a web view, the hosted embed runs inside a WebView exactly as it does in a browser tab — no extra setup. Modern iOS and Android WebViews support `getUserMedia`, so the photo and voice meal-logging flows work inside a WebView too. The native shell must still declare camera / microphone permissions (`NSCameraUsageDescription` on iOS, the camera permission in the Android manifest) — the embed can't request them across the WebView boundary.

---

## Troubleshooting

| Symptom | Likely fix |
|---|---|
| The iframe renders blank / "refused to connect" | Your portal's origin isn't in the embed's `frame-ancestors` CSP. Send the origin to your Miri rep. |
| Surface shows the shell (header, intro) but no data / chips | The token exchange failed. Check the token isn't expired, that `provider` matches how the token was minted, and that `api_key` is the one your token / webhook is registered against. |
| `provider=custom` always fails | The `token_validation_url` may not be registered for your `api_key` yet, or your webhook isn't returning a `sub` field on `200`. Confirm both with your Miri rep. |
| Works in staging, fails in production | API keys are environment-specific. Pass `env=production` *and* a production `api_key` — a staging key won't work against production. |
| Token works once, then surfaces 401 after ~1h | Expected — tokens are ~1h. Implement the refresh-by-src-swap pattern above. |
| Camera / mic blocked in the iframe | Add `allow="microphone; camera"` to the `<iframe>` tag. Inside a WebView, also set the native permission strings. |

---

## See also

- [Authentication](./02-authentication.md) — the full Firebase / custom token-exchange model the SDK and embed share.
- [Web integration](./07-web-integration.md) — the self-served SDK path, for composable layouts.
- [Theming & branding](./04-theming.md) — the practitioner color cascade that drives the embed's accent.

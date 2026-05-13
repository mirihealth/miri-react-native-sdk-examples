# Example apps

This repo ships several worked example integrations. Pick whichever shape best matches the product you're building and clone the relevant branch.

| Example | Branch | Shape | Auth | Best for |
|---|---|---|---|---|
| [`expoexample`](#expoexample) | `main` | Expo managed, two tabs | Google / Firebase | First-touch "hello Miri" |
| [`reactnativeexample`](#reactnativeexample) | `main` | Bare RN CLI | Google | Bare-RN baseline (placeholder) |
| [`multiprogramexample`](#multiprogramexample) | `feat/glp1-partner-example` | Full multi-program SKU (Today / Progress / Log / Coach) | Google | Touring the entire SDK surface |
| [`nutritionistexample`](#nutritionistexample) | `feat/nutritionist-partner-example` | Partner app, Miri behind a "Coach" tab | Google | "Coach tab" integration pattern |
| [`glp1partnerexample`](#glp1partnerexample) | `feat/glp1-partner-example` | Partner app, Miri inline on Home / Meds | Google | "Inline coaching" integration pattern |
| [`webexample`](#webexample) | `web-sdk-example` | Vite + RN-Web web portal + serverless token mint | Firebase (webhook) | Web portal integrations |
| [`fridays-demo`](#fridays-demo) | (separate repo) | Patient-portal clone heavily themed for "Friday's" GLP-1 brand | Firebase | Highly-themed web demos |

---

## expoexample

Expo Managed React Native app, two tabs (Today + Chat), supports both Google and Firebase auth.

**Branch:** `main`
**Path:** [`expoexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/main/expoexample)
**Auth:** Google Sign-In (default) or Firebase

### Run

```bash
git clone https://github.com/mirihealth/miri-react-native-sdk-examples.git
cd miri-react-native-sdk-examples/expoexample
# Create .env per the README
npm install
npm run ios
```

### Use it for

- Your first hands-on look at the SDK.
- Verifying your API key + auth credentials before integrating into your own app.
- Sanity check of the install / native deps shape on Expo.

### .env shape

```
MIRI_API_KEY=<your-api-key>

# Pick ONE of:
AUTH_PROVIDER=google
GOOGLE_IOS_CLIENT_ID=<google-oauth-client-id>
GOOGLE_IOS_URL_SCHEME=<google-auth-ios-url-scheme>

# …or:
AUTH_PROVIDER=firebase
FIREBASE_PROJECT_ID=<your-firebase-project-id>
```

---

## reactnativeexample

A pure React Native CLI scaffolding showing the SDK in a bare-RN project (no Expo).

**Branch:** `main`
**Path:** [`reactnativeexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/main/reactnativeexample)
**Auth:** Google Sign-In
**Status:** Marked "COMING SOON" in its README — the bare-CLI examples in `multiprogramexample` / `nutritionistexample` / `glp1partnerexample` are more current.

### Use it for

- The bare-RN install shape if you don't need the multi-program SKU.

Most partners will get more value from `multiprogramexample` or one of the partner-integration examples.

---

## multiprogramexample

Full **multi-program SKU** — the GLP-1 / weight-management variant of the SDK. Four tabs: Today / Progress / Log / Coach. Runs against your staging environment.

**Branch:** [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/multiprogramexample)
**Auth:** Google Sign-In

### What it demonstrates

- **Today tab** — `<ScoreCard>`, `<KeySignalsRow>`, `<PriorityActionCard>`, `<InsightCard>`, `<HabitTracking>`, `<StreakTracking>`, `<UserSettings>` modal.
- **Progress tab** — weight chart with goal projection, `<InsightCard>` for overview narrative, `<StreakTracking>` for medication, `<LeverBreakdown>`.
- **Log tab** — `<LogPickerV2>` (medication tile gates on an active medication goal), `<ScanFoodModal>` (voice / barcode / photo / chat), `<VoiceMealFlow>`, `<MealList>`.
- **Coach tab** — server-driven topic chips via `useCoachChipsAPI`, routes into `<Chat>`. Adapts subtitle + chip set to the SKU.

### Run

```bash
git fetch origin feat/glp1-partner-example
git worktree add ../multiprogram-tour feat/glp1-partner-example
cd ../multiprogram-tour/multiprogramexample
# Create .env with MIRI_API_KEY + GOOGLE_IOS_CLIENT_ID
npm install
npx pod-install
npm run ios
```

### Use it for

- Touring the full SDK feature set on a real device.
- Lifting integration patterns for a multi-tab app shell.

---

## nutritionistexample

A bare RN CLI example showing the **"Coach tab" integration pattern** — a customer's branded patient app with Miri embedded behind a single tab.

**Branch:** [`feat/nutritionist-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/nutritionist-partner-example/nutritionistexample)
**Fictional customer:** NutriPath, an EHR provider for nutritionists.
**Auth:** Google Sign-In

### What it demonstrates

The partner ("NutriPath") owns three tabs (Schedule / Refills / Account); the fourth tab ("Coach") hands off entirely to Miri. Inside the Coach tab, Miri's own bottom-tab nav (Today / Progress / Log / Coach) stacks above the partner's nav — so the integration boundary is visually explicit.

### Use it for

- The "lowest-effort" integration pattern.
- Partners whose patients are motivated to seek out a coach (nutrition counseling, mental health, behavioral change products).

### Screenshots

The README on the branch embeds inline screenshots showing the partner tabs and the stacked-nav coach experience.

---

## glp1partnerexample

The **"Inline coaching" integration pattern** — Miri components dropped *inside* the partner's existing screens rather than behind a separate tab.

**Branch:** [`feat/glp1-partner-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/glp1partnerexample)
**Fictional customer:** MetaPath Health, a virtual GLP-1 clinic.
**Auth:** Google Sign-In

### What it demonstrates

- **Home tab** — partner-owned greeting + DoseCard, then `<BodyStatsProgress>` + `<KeySignalsRow>` (Miri), then `<PriorityActionCard>` + `<InsightCard>` + `<CoachChipRail>` (Miri), then partner-owned VisitCard / RefillCard / LabSnippet.
- **Meds tab** — partner adherence strip + Rx card, then Miri's "How are you feeling today?" entry → chat scoped to side effects, then `<HabitTracking>` filtered to hydration habits.
- **Care tab** — 100% partner-owned. Showing the boundary is part of the demo.
- **Account tab** — partner-owned with one Miri row for coach preferences.

### Use it for

- Partners whose patients open the app for *clinical* reasons (dose schedule, refill, lab results) and won't seek out a coach tab.
- Worked example of how to map Miri component slots into an existing IA without ripping out the partner's IA.

### Why it exists

The README in this branch has the rationale at length. Short version: a "Coach tab" pattern doesn't survive contact with reality for GLP-1 patients, who open the app for clinical context. Miri components have to meet the patient where they already are.

---

## webexample

Web portal integration — Vite + React Native Web + a Vercel serverless function for the token mint.

**Branch:** [`web-sdk-example`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/web-sdk-example/webexample)
**Auth:** Firebase (server-side webhook pattern)
**Live demo:** https://dist-sand-tau-14.vercel.app/

### What it demonstrates

- The full Vite + RN-Web bundler shape — `configureViteForMiri()`, `setupMiriWebRuntime()`, the JSX-in-`.js` transform plugin.
- The `<MiriAppProvider>` mount configured for web with a Firebase ID token.
- The full Home / Progress / Care tab composition rendering on web — same component code as native, modulo native-only capabilities (HealthKit, native camera).
- A Vercel serverless function (`api/demo-token.ts`) that signs a Firebase custom token and exchanges it for a 1-hour ID token. This is the canonical server-side auth pattern.

### Run

```bash
git fetch origin web-sdk-example
git worktree add ../webexample web-sdk-example
cd ../webexample/webexample
# Configure .env / .env.local with Firebase service account + Miri API key
npm install
npm run dev
```

### Use it for

- Any web portal or WebView-wrapped integration.
- Sales / partner demos — the live URL is shareable.

For the full setup walkthrough, see [Web integration](./07-web-integration.md).

---

## fridays-demo

A patient-portal clone heavily branded for a fictional GLP-1 provider ("Friday's"). Showcases the **end-state** of a partner integration: every Miri component branded, themed, and woven into a realistic IA.

**Repo:** [github.com/mirihealth/fridays-demo](https://github.com/mirihealth/fridays-demo) (separate repo from the examples)
**Live demo:** https://fridays-demo.vercel.app/

### What it demonstrates

- All 11 nav routes from Friday's real portal, rebuilt
- Miri components woven into 7 of them (Home, My Meds, Consultations, Coaching, Chat, Profile, Activity)
- Heavy branding pass-through via `theme={miriThemeForFridays}`
- A per-visitor cookie-sticky pool of pre-backfilled demo users
- Day-0 / day-7 / day-30 storytelling switcher
- Full web-SDK plumbing (Vite + companion package) you can lift wholesale

### Use it for

- The closest reference to "what a polished web integration looks like."
- Demo material for sales conversations.
- Lifting `fridaysTheme.ts` as a starting point for your own brand theme.

Companion catalog: [`COMPONENTS.md`](https://github.com/mirihealth/fridays-demo/blob/main/COMPONENTS.md) — Friday's-flavored component recommendations + integration map by surface.

---

## Don't see what you need?

If your shape isn't here (e.g. a Next.js portal, a WebView wrapper, a wellness program with custom levers), reach out to your Miri service rep. The example list grows from real partner requests — we'd rather build a new example app than try to describe one.

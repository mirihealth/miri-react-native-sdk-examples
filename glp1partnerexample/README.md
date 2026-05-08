# glp1partnerexample — Partner integration with Miri components inline

A bare React Native CLI example for partners shipping a **GLP-1 weight-loss
patient app** with Miri's coaching and tracking components woven _into_
their own screens — not behind a separate "Coach" tab.

The fictional customer is **MetaPath Health**, a virtual GLP-1 clinic.
Patients are on tirzepatide / semaglutide via mail-order, see prescribers
virtually, and track weight + side effects. Their patient app has its own
brand chrome and four tabs:

| Tab         | What it shows                                           | Owned by               |
| ----------- | ------------------------------------------------------- | ---------------------- |
| **Home**    | Daily dashboard — dose · progress · coaching · upcoming | **Mixed**              |
| **Meds**    | Dose schedule · side effects · hydration · refill       | **Mixed**              |
| **Care**    | Visits · clinician messages · lab results               | Partner                |
| **Account** | Profile · billing · coach preferences                   | Partner (+ 1 Miri row) |

## Why a second example?

The first partner example (`nutritionistexample/`) shows Miri tucked
behind a single "Coach" tab — a clean tab-takeover pattern that works
when patients are motivated to seek out the coach (e.g. nutrition
counselling).

For GLP-1 patients, that pattern doesn't survive contact with reality.
They open the app for **clinical context** (dose schedule, visit
reminders, refill status) — not to "go talk to the coach." A coach tab
they have to remember to visit gets ignored.

This example shows the _opposite_ integration pattern: Miri components
are dropped **inline** wherever they have leverage. Coaching meets the
patient where they already are — next to today's dose, next to their
weight progress, next to side-effect questions on the Meds tab.

## How Miri shows up across MetaPath

### Home tab — top to bottom

1. **Greeting + day counter** _(partner)_
2. **DoseCard** — next dose with countdown + log CTA _(partner)_
3. **HomeProgressBlock** _(Miri)_ — wraps:
   - `BodyStatsProgress` (weight / body comp progress)
   - `KeySignalsRow` (Muscle Mass · Hydration · Steps)
4. **HomeCoachingBlock** _(Miri)_ — wraps:
   - `PriorityActionCard` (today's single most-important action)
   - `InsightCard` (Coach Insight from `daily_plan` scope)
   - `CoachChipRail` (server-driven chips → opens chat as a modal sheet)
5. **Upcoming section** _(partner)_:
   - `VisitCard` (next clinical visit)
   - `RefillCard` (next ship date)
   - `LabSnippet` (recent HbA1c / LDL)

The reading order is deliberate: **dose** (clinical authority) →
**progress** (Miri inherits authority via adjacency) → **coaching**
(the answer to "why is my progress what it is, and what should I do
today") → **upcoming** (operational housekeeping). Patient attention
flows clinical → behavioural → operational, mirroring how care actually
works.

### Meds tab — mixed

1. 7-day dose adherence strip _(partner)_
2. Active prescription card _(partner)_
3. **"How are you feeling today?"** entry → opens chat scoped to side
   effects with `messageContext` _(Miri)_
4. **Hydration habit card** — `HabitTracking` filtered to hydration /
   fluid habits _(Miri)_. Surfaced here because dehydration drives most
   GLP-1 side effects (nausea, headache, constipation).
5. Refill timeline _(partner)_

### Care tab — 100% partner

Visits, clinician messages, lab results, past visit notes. No Miri
components. Showing the boundary is part of the demo: not every partner
surface needs the SDK.

### Account tab — partner with one Miri row

All partner-native (profile, care team, membership, billing, support)
**except** a single "Coach settings & data" row that opens the SDK's
`UserSettings` sheet. From the patient's perspective they're managing
"MetaPath's coach preferences"; under the hood it's an SDK component.

### Center "+" log button

The bottom-tab nav has a center "+" pill that opens Miri's `LogPickerV2`
— a 2-up grid sheet for logging meal · mood · water · sleep · weight ·
medication. Logging feels like a partner-native action even though the
picker itself is from the SDK.

## Architecture

```
SafeAreaProvider
└── NavigationContainer  (partner theme)
    └── AuthProvider  (partner — Firebase / Google / Apple)
        └── KeyboardProvider
            └── MetaPathRoot
                ├── (no token) → Login (partner-branded)
                └── (token) → MiriAppProvider  ← MOUNTED AT ROOT, not in one tab
                    └── RootNavigator (native-stack)
                        ├── MetaPathTabs (custom bottom-tab w/ center "+")
                        │   ├── Home   (partner cards + Miri inline)
                        │   ├── Meds   (partner cards + Miri inline)
                        │   ├── Care   (100% partner)
                        │   └── Account (partner + 1 Miri row)
                        └── ChatModal (presented modally from chips/links)
```

Key integration points:

- **`MiriAppProvider` is mounted at the ROOT**, above the partner tabs.
  Any tab can pull from SDK hooks (`useWellnessScore`, `useInsights`,
  `usePriorityActionAPI`, `useHabitProgress`, `useCoachChipsAPI`)
  without re-mounting a provider per screen.
- **No Miri-branded login.** The patient signs in to MetaPath; the same
  token is silently exchanged for a Miri session. This is the right
  pattern for embedded SDK integration — the Miri brand should never
  appear in front of a partner's existing auth flow.
- **Chat as a modal sheet, not a tab destination.** Tapping a coach
  chip pushes a native-stack modal screen wrapping `<MiriChat>`. Keeps
  the patient in their care context and dismissable.
- **Partner-styled chip rail** uses `useCoachChipsAPI` for the data and
  partner colors / typography for the chrome. Same data, partner skin.

## What's mocked vs. real

| Surface                                                   | State                                             |
| --------------------------------------------------------- | ------------------------------------------------- |
| Schedule, Visits, Lab results, Refill status              | Mocked — static UI scaffolding                    |
| Partner brand (MetaPath, Dr. Lena Patel, Tirzepatide 5mg) | Fictional                                         |
| Dose adherence strip on Meds tab                          | Mocked — last 7 days hardcoded                    |
| All Miri inline components                                | Real — hits Miri staging via the SDK              |
| Auth                                                      | Same Dev Login backdoor as the other example apps |

## Running

```sh
npm install
npx pod-install
npm run ios
```

`.env` requires `MIRI_API_KEY`, plus `GOOGLE_IOS_CLIENT_ID` (or
`FIREBASE_PROJECT_ID` if `AUTH_PROVIDER=firebase`). See `.env.example`.

### Auth options

The Login screen offers three sign-in paths:

1. **Sign in with Google** — real OAuth, requires a `GOOGLE_IOS_CLIENT_ID`
   wired up in the Firebase Console + a `GoogleService-Info.plist` in
   `ios/`.
2. **Continue with phone (demo)** — backend bypass for any `+1555…`
   phone on alpha/beta builds. Uses the SDK's `useAuthVerificationAPI`
   SMS flow + Firebase Web SDK `signInWithCustomToken` to mint an ID
   token without leaving the app. Easiest path for demoing.
3. **Dev login (paste token)** — `__DEV__`-gated. Paste a Firebase ID
   token or Google ID token captured from another Miri client. Useful
   for impersonating real test accounts.

## How to read the source

Recommended order:

1. `App.tsx` — root provider chain
2. `components/MetaPathRoot.tsx` — auth gate + MiriAppProvider mount
3. `components/MetaPathTabs.tsx` — custom tab bar + LogPickerV2 center slot
4. `components/Home.tsx` — orchestrator that proves the integration shape
5. `components/miri/HomeProgressBlock.tsx` + `components/miri/HomeCoachingBlock.tsx`
   — the inline Miri sections
6. `components/miri/CoachChipRail.tsx` — partner-styled chip rail
7. `components/Meds.tsx` — mixed surface with the side-effect chat entry
8. `components/Account.tsx` — the single-row UserSettings bridge

## Why this example exists

`reactnativeexample/` and `multiprogramexample/` show Miri running as the
_entire_ app. `nutritionistexample/` shows Miri tucked behind a single
tab.

This example shows the third — and arguably most common — pattern:
**Miri components woven into the partner's own screens, where the
patient already is.** It's the canonical reference for partners whose
patients open the app for clinical context (dose, visits, labs) and
need coaching to meet them there rather than waiting in a separate tab.

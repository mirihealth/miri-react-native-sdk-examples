# nutritionistexample — Partner-app integration demo

A bare React Native CLI example showing how a customer ships **their own
branded patient app** with Miri embedded behind a single tab.

The fictional customer is **NutriPath**, an EHR provider for nutritionists.
Their patient-facing app has its own brand chrome and four tabs:

| Tab | What it shows | Owned by |
|---|---|---|
| **Schedule** | Upcoming nutritionist visits | Partner (mock) |
| **Refills** | Supplement refill tracking | Partner (mock) |
| **Account** | Patient profile + care team | Partner (mock) |
| **Coach** | Full Miri experience | **Miri SDK** |

Tapping **Coach** keeps the partner's bottom-tab nav visible and stacks
Miri's own bottom-tab nav (Today / Progress / Log / Coach) just above it.
Both nav bars are simultaneously on screen — so the integration boundary
is visually explicit, and the user understands which surface they're on.

## Screenshots

### Partner-owned tabs (mocked)

| Schedule | Refills | Account |
|---|---|---|
| ![Schedule](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/01-schedule.png) | ![Refills](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/02-refills.png) | ![Account](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/03-account.png) |

### Coach tab — full Miri experience with both nav bars stacked

| Today | Progress | Log | Coach |
|---|---|---|---|
| ![Today](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/05-miri-today.png) | ![Progress](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/06-miri-progress.png) | ![Log](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/07-miri-log.png) | ![Miri Coach](https://raw.githubusercontent.com/mirihealth/miri-react-native-sdk-examples/screenshots/nutritionist-example/08-miri-coach.png) |

Each screenshot shows Miri's bottom-tab nav stacked directly above the
partner's bottom-tab nav, with **Coach** highlighted (leaf icon) on the
partner side.

## Architecture

```
SafeAreaProvider
└── NavigationContainer  ← single, partner-owned
    └── AuthProvider
        └── KeyboardProvider
            └── PartnerTabs  ← outer bottom-tab nav (Schedule/Refills/Account/Coach)
                ├── Schedule
                ├── Refills
                ├── Account
                └── MiriCoachShell  ← rendered inside the "Coach" screen
                    └── MiriAppProvider  ← apiKey, auth, env, scheme
                        └── (Login | MiriTabs)
                            └── MiriTabs  ← inner bottom-tab nav (Today/Progress/Log/Coach + hidden Chat)
                                ├── Today
                                ├── Progress
                                ├── Log
                                ├── Coach
                                └── Chat (hidden, navigated to from chips/log tiles)
```

Key points for integrators:

- **One `NavigationContainer`** at the very top (partner-owned).
  `MiriTabs` is a *child* navigator nested inside the Coach screen — no
  second `NavigationContainer`.
- **`MiriAppProvider`** is mounted only inside the Coach screen, not at
  the root. The partner's other tabs render with zero Miri overhead.
- **Auth gate**: the Login screen is also nested inside the Coach tab.
  Patients use the partner's outer app without an authenticated Miri
  session; Miri's auth flow only fires when they enter the Coach tab.
- **Theme split**: the partner uses its own warm-earthy palette
  (`partnerTheme.ts`); Miri inherits its own theme via the
  `MiriAppProvider`'s `theme` prop, so the two surfaces are visually
  distinct.

## What's mocked vs. real

| Surface | State |
|---|---|
| Schedule, Refills, Account screens | Mocked — static UI scaffolding, no API |
| Partner brand (NutriPath, Jordan Smith, Dr. Cohen, etc.) | Fictional |
| Miri Coach tab | Real — hits Miri staging via the SDK |
| Auth | Same Dev Login backdoor as the other example apps |

## Running

```sh
npm install
npx pod-install
npm run ios
```

`.env` requires `MIRI_API_KEY`, plus `GOOGLE_IOS_CLIENT_ID` (or
`FIREBASE_PROJECT_ID` if `AUTH_PROVIDER=firebase`). See `.env.example`.

### Auth options

The Login screen (rendered inside the Coach tab) offers three sign-in paths:

1. **Sign in with Google** — real OAuth, requires a `GOOGLE_IOS_CLIENT_ID`
   wired up in the Firebase Console + a `GoogleService-Info.plist` in
   `ios/`.
2. **Dev Login (test phone +15559999794)** — backend bypass for any
   `+1555…` phone on alpha/beta builds. Uses the SDK's
   `useAuthVerificationAPI` SMS flow + Firebase Web SDK
   `signInWithCustomToken` to mint an ID token without leaving the app.
   Easiest path for demoing.
3. **Dev Login (paste token)** — paste a Firebase ID token or Google ID
   token captured from another Miri client. Useful for impersonating
   real test accounts.

## Why this example exists

`reactnativeexample/` and `multiprogramexample/` show Miri running as the
*entire* app. Real customers don't deploy that way — they ship a partner
app whose first-class concerns are theirs (scheduling, billing, charts,
pharmacy, etc.) and want Miri tucked behind a single tab. This example
shows that integration shape end-to-end.

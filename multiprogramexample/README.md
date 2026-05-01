# multiprogramexample - Miri Example App

A bare React Native example app using `@miri-ai/miri-react-native`. Demonstrates the **multi-program SKU** surfaces (Today / Progress / Log / Coach) — the GLP-1 / weight-management variant of the SDK.

## What this example demonstrates

- **Today tab** — `<ScoreCard>`, `<KeySignalsRow>` (Muscle Mass / Hydration / Steps three-up, lifted from the host into the SDK in 1.220.0), `<PriorityActionCard>`, `<InsightCard>` (daily plan), `<HabitTracking>`, `<StreakTracking>`, `<UserSettings>` modal
- **Progress tab** — `<WeightProgressCard>` (inline 7-day chart + dashed projection via `useWeightHistory`), local `<ProgressStatsRow>` (3-up: WELLNESS SCORE / PROTEIN / STEPS — kept locally because the SDK doesn't yet ship a Progress-tab three-stat component), `<InsightCard>` (overview), `<StreakTracking>` (medication), `<LeverBreakdown>`
- **Log tab** — `<LogPickerV2>` (the "+" picker; the Medication tile renders when `useActiveMedicationGoal()` returns a non-null artifact), `<ScanFoodModal>` (4-tile Log Meal hub: voice / barcode / photo / chat), `<VoiceMealFlow>` (lifted into the SDK in 1.220.0 — wired via `renderVoiceCapture` on `ScanFoodModal`), `<DateSelector>`, `<MealList>`
- **Coach tab** — server-driven topic chips via `useCoachChipsAPI` (sku-aware: cravings / recipes / restaurants / doctor visit for `multi_program`), routing into `<Chat>`. Subtitle prefers the new `CoachChipsResponse.subtitle` field (added in SDK 1.220.0) and falls back to `welcome_message`.

## Remaining SDK gaps

A handful of host-only routes still aren't in the SDK and the example simply no-ops the navigation:

- **Habit-detail screen** — `HabitTracking.onPress` is a no-op (host apps would push a habit-detail route).
- **Score-detail screen** — `ScoreCard` taps and `LeverBreakdown.onLeverPress` are no-ops (no lever-detail route in the SDK).
- **Daily-plan route** — the daily-plan `<InsightCard>` doesn't navigate anywhere on tap.

## Prerequisites

You'll need a Miri API Key and a [Google OAuth Client for IOS](https://support.google.com/cloud/answer/15549257?hl=en).

Create a .env file in this directory and add `GOOGLE_IOS_CLIENT_ID` and `MIRI_API_KEY` to it. E.g.:

```
GOOGLE_IOS_CLIENT_ID=<Google OAuth Client ID>
MIRI_API_KEY=<Your Miri API Key>
```

To add the IOS URL scheme, see [these docs](https://react-native-google-signin.github.io/docs/setting-up/ios#xcode-configuration).

## Usage

1. Install dependencies

   ```sh
   npm install
   ```

2. Install pods

   ```sh
   npx pod-install
   ```

3. Run!

   ```sh
   npm run ios
   ```

4. Running on device

   Check out the [React Native](https://reactnative.dev/docs/running-on-device) docs.

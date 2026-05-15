# Components

The SDK ships dozens of components. This page groups them by surface so you can pick the right one for the slot you're filling in your app.

All components below come from `@miri-ai/miri-react-native` (or `@miri-ai/miri-react-native/web` for the web subpath, which re-exports the same surface). They all read from `<MiriAppProvider>`'s contexts; no per-component setup beyond that.

## How the surfaces depend on each other

Most of the coaching components only do their job once the user is feeding Miri behavior data. Concretely:

- **`PriorityActionCard`, `InsightCard`, `WeeklyReviewCard`, `CorrelationCard`** read from the agentic coach + the L1→L3 pipeline. That pipeline is fed by **daily check-in** data (mood / movement / sleep / hydration / meals). Without a check-in surface wired up, these coaching components stay in a cold-start state — they'll render with generic copy but won't reflect the user.
- **`DailyCheckIn` + `SymptomsTracker`** are the typical input side. Drop those (or your own equivalent) into the daily loop before you expect the coaching surfaces to feel useful.
- **`ScoreCard`, `KeySignalsRow`, `LeverBreakdown`, `WeightChart`** read from `useWellnessScore()` / `useWeightHistory()`. Same dependency on tracking artifacts existing.

If you're building a partner integration, the practical sequencing is: ship the check-in + logging surfaces first, then layer the coaching surfaces on top.

## What's currently live in the Miri app vs SDK-available

Everything on this page is exported by the SDK. A subset is also rendered in the production Miri mobile app today; the rest are SDK-available for partners to compose into their own surfaces but aren't yet on the main app's Home / Progress / Coach tabs. Newer entries (e.g. `WeeklyReviewCard`, `ProgramRecommendationCard`, `SymptomsTracker`, `CorrelationCard`, `ActionPlanCard`, `BringListCard`) come from partner-demo work and are wired in the demos but not in the main app yet — they're stable enough to compose, just not "yet shipped to Miri-the-product."

If you need to know whether a specific component is rendering in the main Miri app right now (vs SDK-only), check the relevant screen in `miri-reactnative` or ask your service rep.

## Coaching surfaces

The "what should I do, why, and how is my plan going" layer. These are the highest-engagement surfaces in any Miri integration. **All assume a check-in surface is feeding them data — see the dependency note above.**

| Component | What it renders | Reads from |
|---|---|---|
| **`PriorityActionCard`** | Today's single most-important action with rationale + Mark Complete | `usePriorityActionAPI()` |
| **`InsightCard`** | Coach-generated narrative for a scope (`daily_plan`, `weekly_review`, `pattern_analysis`, etc.) with citations | `useInsights()` |
| **`ExpandedInsightView`** | Full-screen / sheet view of an insight with citations table | `useInsights()` |
| **`CoachChipRail`** | Horizontal rail of "talk to Miri about X" topic chips. Fires `onChipPress(chip)` so the host opens its own chat surface | `useCoachChipsAPI()` |
| **`WeeklyReviewCard`** | "This week at a glance" with best-habit / tightest-spot highlights + narrative + plan-next-week CTA | Presentational — host computes the stats |
| **`ProgramRecommendationCard`** | Day-30 cross-sell card (pattern + ~3 metrics + primary/secondary CTAs) | Presentational |
| **`InfoButton`** | Inline "what does this mean?" affordance for any score / metric | Standalone |

```tsx
import {
  PriorityActionCard,
  InsightCard,
  CoachChipRail,
  WeeklyReviewCard,
  ProgramRecommendationCard,
} from '@miri-ai/miri-react-native';

// Inside MiriAppProvider:
<PriorityActionCard
  actionText={pa.action_text}
  rationale={pa.rationale}
  habitCategory={pa.habit_category}
  isCompleted={pa.is_completed}
  generatedAt={pa.generated_at}
  onMarkComplete={handleMarkComplete}
/>

<InsightCard
  subtitle="Daily plan · Pattern analysis"
  text={insights.daily_plan.text}
  status={insights.recomputation_status}
  lastUpdatedAt={insights.daily_plan.generated_at}
  awaitingCheckin={insights.awaiting_checkin}
/>

<CoachChipRail
  limit={6}
  onChipPress={(chip) => openChat({ moduleName: chip.module_name, prompt: chip.prompt_text })}
/>
```

## Daily check-in

The "how was today" surface — quick, structured logging for medication, mood, movement, sleep, hydration, symptoms.

| Component | What it renders |
|---|---|
| **`DailyCheckIn`** | Opinionated wrapper with the five standard cards baked in (medication / mood / movement / sleep / hydration). Pick which to include via `cards`, override copy via `cardOverrides`. Auto-persists. |
| **`SymptomsTracker`** | Per-symptom 0..5 draggable severity sliders. Replaces the older "one severity for the whole episode" pattern — each symptom gets its own slider. Submission via `onSubmit({ positives, all, maxSeverity })`. |
| **`SeveritySlider`** | The 0..5 (or 0..N) draggable slider primitive used inside `SymptomsTracker`. Re-export so you can build your own custom symptom UIs. |
| **`QuickCheckinFlow`** | The lower-level flow component that powers `DailyCheckIn`. Use directly if you want full control over the card list, dismiss behavior, etc. |
| **`LogPickerV2`** | "+" FAB-style grid of log actions (Meal, Mood, Water, Sleep, Activity, Weight, Medication). Surfaces the medication tile only when an active medication goal exists. |
| **`ScanFoodModal`** | Meal logging UI — voice, barcode, photo, or chat. Triggered by a "Log meal" action. Controlled via `visible`. |
| **`VoiceMealFlow`** | Voice-only meal entry. Often wired into `ScanFoodModal` via the `renderVoiceCapture` prop. |
| **`MealList` / `MealDetail`** | Browse and edit past meals. |
| **`PlanArtifactFormSheet`** | Generic plan-artifact editor (water glass, weight, sleep, activity, etc.). Used by `LogPickerV2` under the hood. |

```tsx
import { DailyCheckIn, SymptomsTracker } from '@miri-ai/miri-react-native';

<DailyCheckIn
  cards={['medication', 'mood', 'movement', 'sleep', 'hydration']}
  hydrationGoalOz={64}
  onFlowComplete={refetchHome}
/>

<SymptomsTracker
  onSubmit={async (submission) => {
    await submitSymptomTracking({
      severity: submission.maxSeverity,
      symptoms: submission.positives,
    });
  }}
/>
```

## Progress & signals

The "is this working" surface — scores, weight, goals, per-behavior progress.

| Component | What it renders | Reads from |
|---|---|---|
| **`ScoreCard`** | Composite Wellness Score with delta vs prior period | `useWellnessScore()` |
| **`ScoreDetailCard`** | Full breakdown of a single score | `useWellnessScore()` |
| **`KeySignalsRow`** | 3-up row of behavior scores (e.g. Muscle Mass / Hydration / Steps) | `useWellnessScore()` |
| **`LeverBreakdown`** | Per-behavior progress with progress bars (sleep, movement, hydration, protein, …) | `useWellnessScore()` |
| **`WellnessScore`** | Compact score pill (smaller than `ScoreCard`) | `useWellnessScore()` |
| **`WeightChart`** | 7-day weight trend + optional dashed projection to goal | `useWeightHistory()` |
| **`BodyStatsProgress`** | Weight + body comp progress block | `useMiriApp()` |
| **`GoalsCard`** | Long-term + weekly goals with 7-day progress chips + 👍/👎 reflection | Presentational |
| **`HabitTracking`** | List of active habits with completion tracking | `useHabitProgressAPI()` |
| **`StreakTracking`** | Per-habit streak count + visual streak meter | `useHabitProgressAPI()` |
| **`Progress`** | Top-level progress dashboard composition | Multiple |
| **`ProgressBar`** | Standalone progress bar primitive | None |

```tsx
import { KeySignalsRow, WeightChart, GoalsCard } from '@miri-ai/miri-react-native';

<KeySignalsRow />

<WeightChart
  currentValue={weight.value}
  currentUnit={weight.unit}
  goalValue={goal.value}
  goalUnit={goal.unit}
/>

<GoalsCard
  goals={goals}
  weeklyProgress={weeklyProgress}
  currentWeekKey={currentWeekKey}
  onReflectGoal={handleReflect}
  onPlanNextWeek={handlePlanWeek}
/>
```

## Chat

The conversational UI. The `<Chat>` shell composes `<MessagesList>` + `<ChatInput>` + the welcome state; you can also drop those primitives into a custom layout.

| Component | What it renders |
|---|---|
| **`Chat`** | Full Chat shell — welcome, messages, input, streaming. Pass `moduleName` to scope conversation context. Resume with `chatSessionId`. |
| **`MessagesList`** | The scrolling thread (without input). Use if you want to compose your own input. |
| **`ChatInput`** | The composer with voice + image attach. |
| **`Welcome`** | Coach-intro state shown before the first message. Auto-mounted inside `<Chat>`. |
| **`MealAnalysisCard`** / **`StreakCard`** / **`InlineCards`** | Rich in-chat cards. Auto-mounted by `<MessagesList>`. |
| **`PractitionerHeader`** | Coach-branded header (avatar + name + program). |
| **`Markdown`** / **`StreamedMarkdown`** | Markdown renderers used inside chat. Exposed for inline composition. |

```tsx
import { Chat, useChatSessionsAPI } from '@miri-ai/miri-react-native';

<Chat moduleName="coach_habit_tips" />

// or, resuming a prior session:
const { sessions } = useChatSessionsAPI();
<Chat chatSessionId={sessions[0]?.id} />
```

## Visit prep

The "what to bring to my next appointment" loop — built around `BringListCard` + a small footer button you attach to any coaching surface for enqueueing.

| Component | What it renders |
|---|---|
| **`BringListCard`** | Queue of items the patient flagged "bring to next visit" — checkbox to mark discussed, × to remove. Host owns storage. |
| **`BringToVisitButton`** | Small footer button to attach below `PriorityActionCard` / `InsightCard` / `ProgramRecommendationCard` for enqueueing. |

```tsx
<PriorityActionCard {...} />
<BringToVisitButton onPress={() => addToBringList(priorityAction)} />

// On your Consultations page:
<BringListCard
  items={bringListItems}
  onToggleItem={toggleDone}
  onRemoveItem={removeItem}
/>
```

## Health-data integrations

| Component | What it renders |
|---|---|
| **`HealthDataConnection`** | Connect / disconnect UI for HealthKit (iOS) or Health Connect (Android). |
| **`SyncStatus`** | Last-sync indicator + manual refresh button. |
| **`CameraScanner` / `BarcodeScanner`** | Native camera surfaces used by `ScanFoodModal`. |

## Settings / account

| Component | What it renders |
|---|---|
| **`UserSettings`** | Notification preferences, data sync, coaching profile — full settings sheet. Drop behind a "Coach settings & data" row on your account page. |
| **`SignupCode`** | Signup-code redemption surface for programs that gate enrollment behind a code. |

## Other primitives

The SDK also re-exports a fair number of low-level primitives (`BottomSheet`, `Text`, `ImageWithFallback`, `Loader`, `Tooltip`, `FlatListWithFade`, `ScrollViewWithFade`, `MiniRoundel`, `EditSheet`, `DateSelector`, `CheckinCard`, `ConfirmFeedbackModal`, `ViewImageModal`, `SparkleShimmer`, …). These are most useful if you're building a custom composition that needs to match the SDK's visual language. None are required for a standard integration.

## Composition patterns

There are three common ways to compose the SDK into a partner app:

### Pattern 1 — "Coach tab"

Miri lives behind a single tab in your tab bar. Tapping it opens an SDK-owned shell (Today / Progress / Log / Coach sub-tabs). The rest of your app is unchanged.

- See [`nutritionistexample`](./08-example-apps.md#nutritionistexample).
- Best when patients are motivated to seek out the coach (e.g. nutrition counseling).
- Lowest integration effort.

### Pattern 2 — "Inline coaching"

Miri components drop *inside* your existing screens. Coaching meets the patient on the surfaces they already visit.

- See [`glp1partnerexample`](./08-example-apps.md#glp1partnerexample).
- Best when patients open your app for clinical reasons and won't seek out a coach tab.
- Highest integration effort, highest engagement.

### Pattern 3 — "Full SDK shell"

The SDK owns the whole app — your `<MiriAppProvider>` wraps an SDK shell composition end-to-end. Useful for greenfield apps with no other product surface.

- See [`multiprogramexample`](./08-example-apps.md#multiprogramexample).

## Custom compositions

Most components accept enough style + behavior overrides that you can build a partner-branded composition without forking. If you find a component that doesn't accept the override you need, [file an issue](https://github.com/mirihealth/miri-react-native-sdk-examples/issues) — the SDK ships weekly and partner-driven gaps are prioritized.

## See also

- **[Hooks reference](./06-hooks.md)** — the data side. Every public hook the components above read from.
- **[Theming & branding](./04-theming.md)** — how to brand all of this in one place.
- **[Example apps](./08-example-apps.md)** — full worked compositions you can crib from.

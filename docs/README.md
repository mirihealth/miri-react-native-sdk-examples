# Miri SDK — Developer Documentation

This is the developer guide for `@miri-ai/miri-react-native` and its web companion `@miri-ai/miri-react-native-web`. It covers everything from installation through advanced theming, multi-program SKUs, and partner-integration patterns.

Current SDK version: **`^1.236.0`** (caret pins to the latest 1.x release; the `/web` subpath landed in 1.236.0 and is the contract this guide is built around).

If you're a partner eng team integrating Miri for the first time, start with **[Getting started](./01-getting-started.md)** and **[Authentication](./02-authentication.md)**, then jump to whichever guide matches the surface you're building:

| You're building… | Read |
|---|---|
| A new React Native app from scratch | [Getting started](./01-getting-started.md) → [Components](./05-components.md) |
| An integration into an existing RN app | [Provider & config](./03-provider-and-config.md) → [Components](./05-components.md) → [Example: nutritionistexample](./08-example-apps.md#nutritionistexample) |
| An integration into a web portal | [Web integration](./07-web-integration.md) → [Example: webexample](./08-example-apps.md#webexample) |
| A WebView-wrapped mobile experience | [Web integration](./07-web-integration.md#web-embedded-mobile-apps) |
| Custom theming / brand alignment | [Theming & branding](./04-theming.md) |

## Contents

1. **[Getting started](./01-getting-started.md)** — install, run an example, what `MiriAppProvider` needs, the smallest possible "hello Miri" app.
2. **[Authentication](./02-authentication.md)** — Google, Firebase, Apple. Token lifecycle. Server-side webhook pattern for portal-style integrations.
3. **[Provider & config](./03-provider-and-config.md)** — every `MiriAppProvider` prop, the contexts that drop out of it, environment selection, error / log hooks.
4. **[Theming & branding](./04-theming.md)** — `theme` prop pass-through, the practitioner color cascade, per-component style overrides.
5. **[Components](./05-components.md)** — full catalog. Coaching surfaces (PriorityActionCard / InsightCard / CoachChipRail / WeeklyReviewCard / ProgramRecommendationCard), daily check-in (DailyCheckIn / SymptomsTracker / LogPickerV2 / ScanFoodModal), progress (WeightChart / KeySignalsRow / GoalsCard), visit prep (BringListCard), chat (Chat / MessagesList / ChatInput), settings (UserSettings).
6. **[Hooks reference](./06-hooks.md)** — every public hook: identity, programs, scores, insights, meal/weight repositories, chat session APIs.
7. **[Web integration](./07-web-integration.md)** — Vite plugin, runtime polyfill, behavior differences on web, hosted-chat-embed alternative.
8. **[Example apps](./08-example-apps.md)** — `expoexample`, `reactnativeexample`, `multiprogramexample`, `nutritionistexample`, `glp1partnerexample`, `webexample`. What each shows, which SDK surface it covers, link to source.

## Need help?

- **For repo access, API keys, or production tokens**: contact your Miri service rep.
- **For bug reports**: file an issue against this repository.
- **For component requests / SDK gaps**: ping your service rep or file an issue — the SDK ships weekly iterations and partner-driven gaps are prioritized.

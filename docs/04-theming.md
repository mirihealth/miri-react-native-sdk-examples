# Theming & branding

Miri components pick up your brand colors and fonts from a single `theme` prop on `<MiriAppProvider>`. Set it once; every SDK surface reads from `useTheme()` and inherits.

## The minimal theme

```ts
// src/yourTheme.ts
import type { Theme } from '@miri-ai/miri-react-native';

export const yourTheme: Theme = {
  colors: {
    background: '#FBF7EE',   // your page background
    text:       '#1B1B16',   // your default foreground / body text
  },
  fonts: {
    regular: { fontFamily: 'Inter', fontWeight: '400' },
    bold:    { fontFamily: 'Inter', fontWeight: '700' },
    heavy:   { fontFamily: 'Inter', fontWeight: '800' },
    light:   { fontFamily: 'Inter', fontWeight: '300' },
  },
};
```

```tsx
<MiriAppProvider theme={yourTheme} {/* …other props */}>
  {/* every SDK component below picks up your colors + fonts */}
</MiriAppProvider>
```

That's it for 90% of integrations. Every Miri component reads `colors.background`, `colors.foreground`, and the practitioner-derived brand colors from this base.

## How the color system layers

There are three layers of color resolution, from broadest to narrowest:

1. **Theme prop** — what you pass to `<MiriAppProvider theme={…}>`. Sets `background` + `text` for the active mode (light or dark).
2. **Mode palette** — the SDK's built-in light / dark palette, which fills in everything you didn't set (`positive`, `negative`, `warning`, `tertiary`, etc.). Dark mode kicks in automatically if your `background` is dark.
3. **Practitioner colors** — every practitioner in Miri can ship their own brand palette (used when SDK-managed surfaces are practitioner-branded, e.g. the chat coach header). Pulled from `usePractitioner()`.

Per-component style overrides sit on top of all of these. Most SDK components accept `containerStyle` / `chipStyle` / etc. props that let you deviate from the theme on a single instance.

## The full `Theme` shape

```ts
export interface Theme {
  colors?: {
    background?: string;  // surface bg
    text?: string;        // default foreground
  };
  fonts?: {
    light?:   { fontFamily: string; fontWeight: TextStyle['fontWeight'] };
    regular?: { fontFamily: string; fontWeight: TextStyle['fontWeight'] };
    bold?:    { fontFamily: string; fontWeight: TextStyle['fontWeight'] };
    heavy?:   { fontFamily: string; fontWeight: TextStyle['fontWeight'] };
  };
}
```

That's the public surface. Everything else (`positive`, `negative`, `warning`, `accent`, `brandHighlight`, etc.) is derived. If you want to see the full color token set the SDK exposes, look at `useTheme()` inside a component — `colors.foreground`, `colors.foregroundSecondary`, `colors.foregroundTertiary`, `colors.tertiary`, `colors.positive`, `colors.positiveBackground`, `colors.negative`, `colors.negativeBackground`, `colors.warning`, `colors.warningBackground`, `colors.accent`, `colors.brandHighlight`, `colors.brandForeground`, `colors.brandBackground`, `colors.brandSecondary`, `colors.brandTertiary`.

## Dark mode

If the `background` you pass is dark (per `color` library detection), the SDK switches to its dark color set automatically. No `mode` prop needed.

```ts
// Light mode
const light: Theme = { colors: { background: '#FBF7EE', text: '#1B1B16' } };

// Dark mode — just flip the background
const dark: Theme = { colors: { background: '#0F0F0E', text: '#FBF7EE' } };
```

If your app needs system-driven dark mode, swap which theme you pass to `<MiriAppProvider>` based on `useColorScheme()`:

```tsx
import { useColorScheme } from 'react-native';

const scheme = useColorScheme();
return (
  <MiriAppProvider theme={scheme === 'dark' ? dark : light} … >
    …
  </MiriAppProvider>
);
```

## Per-component style overrides

Most SDK components accept style override props for cases where the theme isn't quite right on a specific instance. Pattern:

```tsx
<CoachChipRail
  onChipPress={handleChipPress}
  containerStyle={{ paddingHorizontal: 24 }}
  chipStyle={{ borderColor: '#A33', borderWidth: 2 }}
  activeChipStyle={{ backgroundColor: '#FEE' }}
  chipTextStyle={{ fontWeight: '800' }}
/>
```

The override-prop names follow a consistent convention:

| Suffix | Applies to |
|---|---|
| `containerStyle` | The outermost `View` of the component |
| `…RowStyle` / `…CellStyle` | Per-row / per-cell sub-elements |
| `…TextStyle` | Inner text labels |
| `accentColor` | The component's "primary brand" color when the theme's `accent` isn't ideal |
| `lineColor` / `dotColor` / etc. | Specific draw colors for chart-like components |

See each component in [Components](./05-components.md) for its exact prop list.

## Fonts

You're responsible for loading the fonts you reference in `theme.fonts` — the SDK doesn't bundle any. For Expo:

```tsx
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold, Inter_300Light } from '@expo-google-fonts/inter';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_700Bold, Inter_800ExtraBold, Inter_300Light,
  });
  if (!fontsLoaded) return null;
  return <MiriAppProvider theme={yourTheme} … >…</MiriAppProvider>;
}
```

For bare RN, add fonts to your `app.json` (`expo.assets`) or follow [the standard RN font-linking guide](https://reactnative.dev/docs/text#font-family).

## Practitioner-branded surfaces

Coach-presenting surfaces (the chat coach header, the welcome message, the practitioner-card components) pull from the active practitioner's brand colors automatically — independent of your `theme` prop. This is intentional: if you're a multi-practitioner platform, each practitioner can have a distinct visual identity within your app shell.

If you want to suppress that and force everything to your brand, override with `containerStyle` / `headerStyle` on the relevant components (most practitioner-aware components expose this).

## Worked examples

| Where | What |
|---|---|
| [`webexample/src/App.tsx`](https://github.com/mirihealth/miri-react-native-sdk-examples/blob/web-sdk-example/webexample/src/App.tsx) | Minimal theme wired to `<MiriAppProvider>` |
| [`nutritionistexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/nutritionist-partner-example/nutritionistexample) | Distinct partner brand wrapped around Miri's coach tab |
| [`multiprogramexample/`](https://github.com/mirihealth/miri-react-native-sdk-examples/tree/feat/glp1-partner-example/multiprogramexample) | Full multi-program SKU rendered with the default Miri theme |

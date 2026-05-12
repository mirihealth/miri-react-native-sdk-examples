import { AppRegistry } from 'react-native';

// Pre-imported real implementations / shims for runtime `require()`
// calls that the SDK / RN-web / RN ecosystem leave as dynamic requires
// in the bundle. Vite's `resolve.alias` only handles static imports —
// runtime requires bypass it. Map known IDs here so the SDK gets a
// real module rather than the Proxy stub from index.html's polyfill.
import createReactDOMStyle from 'react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle';
import preprocessStyle from 'react-native-web/dist/exports/StyleSheet/preprocess';
// Aliased to shim/lottie-react-native via vite resolve.alias.
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const lottieModule = { default: LottieView, LottieView };
const linearGradientModule = { default: LinearGradient, LinearGradient };

const KNOWN_REQUIRES: Record<string, unknown> = {
  'react-native-web/dist/exports/StyleSheet/compiler/createReactDOMStyle': createReactDOMStyle,
  'react-native-web/dist/exports/StyleSheet/preprocess': preprocessStyle,
  'lottie-react-native': lottieModule,
  'lottie-react': lottieModule,
  'react-native-linear-gradient': linearGradientModule,
  'expo-linear-gradient': linearGradientModule,
};

const originalRequire = (window as unknown as { require?: (id: string) => unknown }).require;
(window as unknown as { require: (id: string) => unknown }).require = (id: string) => {
  if (KNOWN_REQUIRES[id] !== undefined) return KNOWN_REQUIRES[id];
  return originalRequire ? originalRequire(id) : null;
};

import { App } from './App';

// React Native Web mounts via AppRegistry — same API as the native
// runtime. The third arg points at the `#root` div from index.html.
AppRegistry.registerComponent('MiriEmbed', () => App);
AppRegistry.runApplication('MiriEmbed', {
  rootTag: document.getElementById('root'),
});

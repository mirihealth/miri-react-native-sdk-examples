import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// vite-plugin-react-native-web handles the RN-ecosystem nuances Metro
// solves on native: stripping Flow type annotations from un-transpiled
// `react-native` and ecosystem subpath imports, aliasing
// `react-native` → `react-native-web`, dealing with `.web.js` /
// `.web.tsx` extensions, etc. Without it Vite chokes on the Flow
// syntax in `node_modules/react-native/Libraries/...`.
import reactNativeWeb from 'vite-plugin-react-native-web';

// Self-served bundle prototype for embedding Miri SDK inside a host RN
// app's WebView. The host (e.g. Friday's) builds this bundle into their
// web assets and points a WebView at it.

export default defineConfig({
  plugins: [reactNativeWeb(), react()],
  resolve: {
    alias: [
      // Native-only modules with no web equivalent — stub with empty
      // modules so the SDK loads. Surfaces that depend on these will
      // throw at render time; gate them with Platform.OS checks.
      {
        find: '@kingstinct/react-native-healthkit',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native-vision-camera',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        find: '@shopify/react-native-skia',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        // Android-only.
        find: 'react-native-health-connect',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        // Uses `.ios.tsx` / `.android.tsx` files which Metro resolves
        // by platform extension but Vite doesn't.
        find: '@react-native-community/blur',
        replacement: new URL('./shims/blur.tsx', import.meta.url).pathname,
      },
      {
        find: '@react-native-community/datetimepicker',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native-fs',
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
      {
        find: 'react-native-linear-gradient',
        replacement: new URL('./shims/linear-gradient.tsx', import.meta.url).pathname,
      },
      // RN subpath imports — these `react-native/Libraries/Utilities/codegen*`
      // are codegen factories that are no-ops at runtime on native, but the
      // files don't exist in `react-native-web`. The rn-web plugin already
      // rewrote `react-native` → `react-native-web` so we match both
      // prefixes in case alias resolution order changes.
      {
        find: /^react-native(-web)?\/Libraries\/Utilities\/codegenNativeCommands$/,
        replacement: new URL('./shims/codegenNativeCommands.ts', import.meta.url).pathname,
      },
      {
        find: /^react-native(-web)?\/Libraries\/Utilities\/codegenNativeComponent$/,
        replacement: new URL('./shims/codegenNativeComponent.ts', import.meta.url).pathname,
      },
      {
        find: /^react-native(-web)?\/Libraries\/Renderer\/shims\/ReactFabric$/,
        replacement: new URL('./shims/empty.ts', import.meta.url).pathname,
      },
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
});

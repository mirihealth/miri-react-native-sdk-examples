import react from '@vitejs/plugin-react';
import esbuild from 'esbuild';
import { defineConfig, type Plugin } from 'vite';
// vite-plugin-react-native-web handles the RN-ecosystem nuances Metro
// solves on native: stripping Flow type annotations from un-transpiled
// `react-native` and ecosystem subpath imports, aliasing
// `react-native` → `react-native-web`, dealing with `.web.js` /
// `.web.tsx` extensions, etc. Without it Vite chokes on the Flow
// syntax in `node_modules/react-native/Libraries/...`.
import reactNativeWeb from 'vite-plugin-react-native-web';

// Many RN packages ship un-transpiled JSX inside `.js` files. Metro
// handles this on native; on web Rollup parses .js as plain JS and
// chokes. This plugin runs esbuild's jsx loader over any .js file in a
// react-native-* or @react-native/* package. esbuild's jsx loader is a
// superset of js, so it's a no-op on files without JSX.
function jsxInJsPlugin(): Plugin {
  // react-native-web ships pre-compiled — don't try to re-jsx-transform it.
  const exclude = /node_modules\/(react-native-web|react-dom|react)\//;
  const matcher =
    /node_modules\/(react-native-[^/]+|@react-native[^/]*\/[^/]+)\/.*\.js$/;
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (exclude.test(id)) return null;
      if (!matcher.test(id)) return null;
      // Skip files that don't contain JSX (esbuild jsx loader is a
      // superset of js, but we save cycles + avoid sourcemap churn).
      if (!/<[A-Za-z]/.test(code)) return null;
      const result = await esbuild.transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        target: 'es2020',
        sourcefile: id,
        sourcemap: false,
      });
      return { code: result.code, map: null };
    },
  };
}

// Self-served bundle prototype for embedding Miri SDK inside a host RN
// app's WebView. The host (e.g. Friday's) builds this bundle into their
// web assets and points a WebView at it.

export default defineConfig({
  plugins: [jsxInJsPlugin(), reactNativeWeb(), react()],
  // Allow imports from the sibling glp1partnerexample/ directory so we
  // reuse the exact Home / Progress / Care components shipped by the
  // native partner example. Avoids drift between native + web demos.
  server: {
    fs: {
      allow: [
        new URL('.', import.meta.url).pathname,
        new URL('../glp1partnerexample', import.meta.url).pathname,
      ],
    },
  },
  resolve: {
    // Resolve from webexample's node_modules even when importing files
    // that live outside the project root (e.g. the partner example
    // components). Without this, the rn-web plugin's rewrites resolve
    // relative to the source file's directory, which doesn't have the
    // SDK / react-native-web installed.
    preserveSymlinks: false,
    dedupe: [
      'react',
      'react-dom',
      'react-native',
      'react-native-web',
      'react-native-safe-area-context',
      'react-native-svg',
      '@miri-ai/miri-react-native',
    ],
    alias: [
      // firebase/auth's web entry doesn't export getReactNativePersistence,
      // but the SDK imports it unconditionally. Shim adds a no-op
      // and re-exports everything else.
      {
        find: /^firebase\/auth$/,
        replacement: new URL('./shims/firebase-auth.ts', import.meta.url).pathname,
      },
      // Native-only modules with no web equivalent — stub with empty
      // modules so the SDK loads. Surfaces that depend on these will
      // throw at render time; gate them with Platform.OS checks.
      {
        find: '@kingstinct/react-native-healthkit',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        find: 'react-native-vision-camera',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        find: '@shopify/react-native-skia',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        // Android-only.
        find: 'react-native-health-connect',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        // Uses `.ios.tsx` / `.android.tsx` files which Metro resolves
        // by platform extension but Vite doesn't.
        find: '@react-native-community/blur',
        replacement: new URL('./shims/blur.tsx', import.meta.url).pathname,
      },
      {
        find: '@react-native-community/datetimepicker',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        find: 'react-native-fs',
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
      {
        find: 'react-native-linear-gradient',
        replacement: new URL('./shims/linear-gradient.tsx', import.meta.url).pathname,
      },
      {
        find: 'lottie-react-native',
        replacement: new URL('./shims/lottie-react-native.tsx', import.meta.url).pathname,
      },
      {
        find: 'lottie-react',
        replacement: new URL('./shims/lottie-react-native.tsx', import.meta.url).pathname,
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
        replacement: new URL('./shims/empty.cjs', import.meta.url).pathname,
      },
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    // esbuild's prebundle pass is much stricter than rollup about
    // named-export validation and resolution. The rollup pipeline
    // handles every RN-ecosystem quirk (shimMissingExports, alias
    // rewrites, jsx-in-js transform). Skip prebundle for the SDK +
    // every package that pulls in native-only imports, so they're
    // served by vite's dev middleware via the rollup transform pipe.
    exclude: [
      '@miri-ai/miri-react-native',
      'react-native-reanimated',
      'react-native-svg',
      'react-native-fast-confetti',
      'react-native-image-picker',
      'react-native-linear-gradient',
      'react-native-keyboard-controller',
      'react-native-gesture-handler',
      'react-native-vector-icons',
      'react-native-markdown-display',
      'react-native-picker-select',
      'react-native-gifted-charts',
      'react-native-collapsible',
      'react-native-actions-sheet',
      'expo-modules-core',
      'lottie-react-native',
      '@gorhom/bottom-sheet',
      '@gorhom/portal',
    ],
    esbuildOptions: {
      loader: { '.js': 'jsx' },
      plugins: [
        {
          // Dev-server prebundling uses esbuild's own resolver, which
          // doesn't honor vite's `resolve.alias`. Mirror the same
          // path rewrites here so codegen subpaths + stubbed native
          // modules resolve during prebundle.
          name: 'rn-web-alias',
          setup(build) {
            const shimsDir = new URL('./shims/', import.meta.url).pathname;
            const aliasFile = (filename: string) => shimsDir + filename;
            const onResolve = (
              filter: RegExp,
              file: string
            ) => {
              build.onResolve({ filter }, () => ({ path: aliasFile(file) }));
            };
            onResolve(
              /^react-native(-web)?\/Libraries\/Utilities\/codegenNativeCommands$/,
              'codegenNativeCommands.ts'
            );
            onResolve(
              /^react-native(-web)?\/Libraries\/Utilities\/codegenNativeComponent$/,
              'codegenNativeComponent.ts'
            );
            onResolve(
              /^react-native(-web)?\/Libraries\/Renderer\/shims\/ReactFabric$/,
              'empty.cjs'
            );
            onResolve(/^@kingstinct\/react-native-healthkit$/, 'empty.cjs');
            onResolve(/^react-native-vision-camera$/, 'empty.cjs');
            onResolve(/^@shopify\/react-native-skia$/, 'empty.cjs');
            onResolve(/^react-native-health-connect$/, 'empty.cjs');
            onResolve(/^@react-native-community\/datetimepicker$/, 'empty.cjs');
            onResolve(/^react-native-fs$/, 'empty.cjs');
            onResolve(/^@react-native-community\/blur$/, 'blur.tsx');
            onResolve(/^react-native-linear-gradient$/, 'linear-gradient.tsx');
            onResolve(/^firebase\/auth$/, 'firebase-auth.ts');
          },
        },
      ],
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      // Many native-only deps are stubbed with empty shims. The SDK
      // (and its transitive deps) still issue `import { x } from ...`
      // against those stubs. shimMissingExports tells rollup to emit
      // an `undefined` for any missing export rather than failing the
      // build. Anything that actually uses these at runtime is gated
      // by Platform.OS === 'web' checks.
      shimMissingExports: true,
    },
  },
});

// firebase/auth shim — re-exports the web build of firebase/auth and
// adds a no-op `getReactNativePersistence`. The SDK imports that
// symbol unconditionally for RN; on web the function is irrelevant
// because firebase's web persistence (IndexedDB / localStorage) is the
// default. Rollup needs explicit named re-exports — `export *` from a
// CJS-flavored module doesn't propagate through static analysis.
// Relative path to the actual firebase/auth ESM build to avoid
// alias-cycle (vite aliases `firebase/auth` → this file).
// eslint-disable-next-line import/no-relative-packages
export * from '../node_modules/firebase/auth/dist/esm/index.esm.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getReactNativePersistence(_storage: unknown): any {
  // Web has its own persistence layer; this no-op satisfies the SDK's
  // RN-shaped initializeAuth call. Firebase falls back to its default
  // web persistence (indexedDB) when given an unrecognized object.
  return {};
}

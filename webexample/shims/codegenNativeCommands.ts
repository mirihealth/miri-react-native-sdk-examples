// On native, this returns a Commands object for fabric components. On
// web there are no fabric commands — return a no-op proxy so any
// callsite that imperatively dispatches commands silently fails. (Real
// hosts on web would gate these calls behind Platform.OS checks; this
// shim just prevents bundle-time crashes.)
export default function codegenNativeCommands<T>(_config: {
  supportedCommands: string[];
}): T {
  return new Proxy({} as T, {
    get: () => () => undefined,
  });
}

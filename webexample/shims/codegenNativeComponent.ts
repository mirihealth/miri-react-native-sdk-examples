// On native, this returns a host component class from a codegen
// schema. On web we hand back a passthrough `View` so render trees
// containing these specs don't crash. Hosts gating with
// `Platform.OS === 'web'` should never hit this at runtime, but the
// bundler still resolves the import path.
import { View } from 'react-native';

export default function codegenNativeComponent<TProps>(
  _name: string,
  _options?: unknown
): React.ComponentType<TProps> {
  // react-native-web's View accepts arbitrary props gracefully.
  return View as unknown as React.ComponentType<TProps>;
}

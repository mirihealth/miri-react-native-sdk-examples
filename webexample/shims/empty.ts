// Empty shim for native-only modules that have no web equivalent.
// Anything trying to import a real symbol from these will get
// `undefined` and fail at use-site — gate consumers behind a
// `Platform.OS === 'web'` check.
const noop: any = () => undefined;
export default noop;

// CJS empty shim. esbuild treats `import { Foo } from './empty.cjs'`
// as a property access on the module's default export, which doesn't
// require Foo to be a statically discoverable named export — it just
// resolves at runtime through the Proxy. Anything calling these at
// runtime is no-op (returns undefined / harmless function); call-sites
// are gated by Platform.OS === 'web' on the SDK side.

const noop = () => undefined;
const passthrough = new Proxy(
  function () {},
  {
    get(_target, prop) {
      // Common React component-like props return null so render trees
      // don't explode if a stubbed component is rendered. Other named
      // accesses get a no-op function.
      if (prop === '__esModule') return true;
      if (prop === 'default') return passthrough;
      if (typeof prop === 'symbol') return undefined;
      return passthrough;
    },
    apply() {
      return undefined;
    },
    construct() {
      return {};
    },
  }
);

module.exports = passthrough;
module.exports.default = passthrough;

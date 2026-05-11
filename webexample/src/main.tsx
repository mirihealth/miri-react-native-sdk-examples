import { AppRegistry } from 'react-native';

import { App } from './App';

// React Native Web mounts via AppRegistry — same API as the native
// runtime. The third arg points at the `#root` div from index.html.
AppRegistry.registerComponent('MiriEmbed', () => App);
AppRegistry.runApplication('MiriEmbed', {
  rootTag: document.getElementById('root'),
});

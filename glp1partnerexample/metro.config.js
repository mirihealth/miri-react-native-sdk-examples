const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      // Expo modules are not available in bare React Native — return empty modules
      const expoModules = [
        'expo-application',
        'expo-blur',
        'expo-camera',
        'expo-device',
        'expo-file-system',
        'expo-image-picker',
      ];
      if (expoModules.includes(moduleName)) {
        return { type: 'empty' };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

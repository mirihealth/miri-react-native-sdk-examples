const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const defaultResolveResult = context.resolveRequest(
    context,
    moduleName,
    platform,
  );

  // react-native-linear-gradient
  if (moduleName === "react-native-linear-gradient") {
    return {
      filePath: require.resolve("expo-linear-gradient"),
      type: "sourceFile",
    };
  }

  // react-native-svg on web
  if (platform === "web" && moduleName === "react-native-svg") {
    return context.resolveRequest(context, "react-native-svg-web", platform);
  }

  // react-native-blur does not have a web view, disable until it does
  if (platform === "web" && moduleName === "react-native-blur") {
    return { type: "empty" };
  }

  return defaultResolveResult;
};

// Expo 53 workaround
// https://github.com/expo/expo/issues/36588#issuecomment-2848697291
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

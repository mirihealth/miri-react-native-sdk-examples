export default ({ config }) => ({
  ...config,
  extra: {
    googleIOSClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    miriApiKey: process.env.MIRI_API_KEY,
  },
  plugins: [
    ...config.plugins,

    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: process.env.GOOGLE_IOS_URL_SCHEME,
      },
    ],
  ],
});

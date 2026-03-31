export default ({ config }) => ({
  ...config,
  extra: {
    googleIOSClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    miriApiKey: process.env.MIRI_API_KEY,
    // Firebase auth provider config (alternative to Google sign-in)
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    // Which auth provider to use: 'google' or 'firebase'
    authProvider: process.env.AUTH_PROVIDER || 'google',
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

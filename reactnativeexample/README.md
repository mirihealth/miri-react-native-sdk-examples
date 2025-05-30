# reactnativeexample - Miri Example App (COMING SOON)

This is a pure react native example app using `@miri-ai/miri-react-native`

## Prerequisites

You'll need a Miri API Key and a [Google OAuth Client for IOS](https://support.google.com/cloud/answer/15549257?hl=en).

Once you have those, create a .env file in this directory and add `GOOGLE_IOS_CLIENT_ID` and `MIRI_API_KEY` to it. E.g.:

````
GOOGLE_IOS_CLIENT_ID=<Google OAuth Client ID>
MIRI_API_KEY=<Your Miri API Key>
```

To add the IOS Url scheme, see [these docs](https://react-native-google-signin.github.io/docs/setting-up/ios#xcode-configuration)

## Usage

1. Install dependencies

   ```sh
   npm install
   ```

2. Install pods

   ```sh
   npx pod-install
   ```

3. Run!

   ```sh
   npm run ios
   ```

4. Running on device
   Check out the [React Native](https://reactnative.dev/docs/running-on-device) docs
````

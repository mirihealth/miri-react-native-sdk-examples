# expoexample - Miri Example App

This is an Expo-based example app using `@miri-ai/miri-react-native`

## Prerequisites

You'll need a Miri API Key and a [Google OAuth Client for IOS](https://support.google.com/cloud/answer/15549257?hl=en).

Once you have those, create a .env file in this directory and add `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_IOS_URL_SCHEME` and `MIRI_API_KEY` to it. E.g.:

````
GOOGLE_IOS_CLIENT_ID=<Google OAuth Client ID>
GOOGLE_IOS_URL_SCHEME=<Google Auth Client IOS URL Scheme>
MIRI_API_KEY=<Your Miri API Key>
```

## Usage

1. Install dependencies

   ```sh
   npm install
````

1. Prebuild

   ```sh
   npm run prebuild
   ```

1. Run!

   ```sh
   npm run ios
   ```

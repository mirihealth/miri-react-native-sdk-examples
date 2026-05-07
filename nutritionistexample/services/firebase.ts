// Firebase Web SDK init for the staging Firebase project.
//
// This is only used for the dev-phone-login workaround: the server's
// /auth/complete-verification endpoint returns a Firebase *custom* token,
// which clients have to exchange for a real ID token via
// signInWithCustomToken before passing it to MiriAppProvider.
//
// The config below is the public web-SDK config for the `miri-staging`
// Firebase project — same values miri-reactnative ships in app.config.js.

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  // @ts-expect-error getReactNativePersistence is RN-only and not in firebase types.
  // https://stackoverflow.com/q/76914913
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBIwjhv7vHh2MutK5qgVj0aRkJ36bAh8TY',
  authDomain: 'miri-staging.firebaseapp.com',
  projectId: 'miri-staging',
  storageBucket: 'miri-staging.appspot.com',
  messagingSenderId: '1027861089695',
  appId: '1:1027861089695:web:3f73626bbfd67c412201aa',
};

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

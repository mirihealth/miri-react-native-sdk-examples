// glp1partnerexample — MetaPath Health partner-integration demo.
//
// Customer scenario: a fictional virtual GLP-1 clinic ("MetaPath") ships
// a patient-facing app whose UI is fully their own brand: dose tracking,
// clinician visits, refill management, lab review. Patients on
// tirzepatide/semaglutide need clinical care + behavioural coaching, but
// their attention is on their dose schedule and visit cadence — they're
// not opening the app to "go talk to the coach."
//
// So instead of putting Miri behind a single tab (the nutritionistexample
// pattern), MetaPath weaves Miri components inline across the partner's
// own screens. The Coach lives where the patient already is — next to
// today's dose, next to their weight progress, next to side-effect
// questions on the Meds tab.
//
// The integration shape:
//   • One NavigationContainer (partner-themed)
//   • MiriAppProvider mounted at the ROOT (above the tabs) so any
//     partner screen can pull from SDK hooks
//   • Auth bridges silently — partner Firebase/Google token exchanges
//     into Miri without a separate Miri-branded login
//   • Coach Chat opens as a modal sheet, not a tab destination

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MetaPathRoot } from './components/MetaPathRoot';
import { partnerNavigationTheme } from './components/partnerTheme';
import { AuthProvider } from './contexts/AuthContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={partnerNavigationTheme}>
        <AuthProvider>
          <KeyboardProvider>
            <MetaPathRoot />
          </KeyboardProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

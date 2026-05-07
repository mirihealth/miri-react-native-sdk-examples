// nutritionistexample — pretend partner-app integration demo.
//
// Customer scenario: an EHR provider for nutritionists ("NutriPath") ships
// a patient-facing app whose UI is fully their own brand: appointment
// scheduling, supplement refill tracking, account/settings. They want their
// patients to also have access to a wellness coach without redirecting them
// out to a separate app, so they embed Miri behind their own "Coach" tab.
//
// The integration boundary is visible: the partner's bottom-tab nav stays
// at the very bottom of the screen always; tapping Coach swaps the screen
// content to Miri's full surface set, with Miri's own bottom-tab nav stacked
// just above the partner's nav.

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PartnerTabs } from './components/PartnerTabs';
import { partnerNavigationTheme } from './components/partnerTheme';
import { AuthProvider } from './contexts/AuthContext';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={partnerNavigationTheme}>
        <AuthProvider>
          <KeyboardProvider>
            <PartnerTabs />
          </KeyboardProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

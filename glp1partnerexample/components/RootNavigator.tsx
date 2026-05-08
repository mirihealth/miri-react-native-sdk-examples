// Root stack: the partner tabs are the main screen, and the Coach Chat is
// a modal screen. Tapping a chip on Home, the side-effect entry on Meds,
// or the "Talk to your coach" link on any partner card pushes the modal.
//
// Why a modal stack instead of a Chat tab? Patients on GLP-1 are coming
// to the app with a specific need (log a dose, see a visit, ask about a
// side effect). A modal sheet keeps them anchored in their care context
// and dismissable; a tab destination would create a parallel attention
// surface they have to remember to come back from.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FC } from 'react';

import { ChatModal } from './miri/ChatModal';
import { MetaPathTabs } from './MetaPathTabs';
import { partnerColors } from './partnerTheme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: partnerColors.surfaceElevated },
      headerTintColor: partnerColors.text,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen
      name="Tabs"
      component={MetaPathTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChatModal"
      component={ChatModal}
      options={{
        presentation: 'modal',
        headerShown: false,
      }}
    />
  </Stack.Navigator>
);

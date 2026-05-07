// Outer (partner-app) bottom-tab navigator. Owns the single NavigationContainer
// for the whole app — the inner Miri tab navigator (MiriTabs) nests inside the
// "Coach" tab as a child navigator, which keeps both nav bars visible: the
// partner's bottom-tab nav at the very bottom, Miri's bottom-tab nav stacked
// just above it inside the Coach tab.

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FC } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MiriCoachShell } from './MiriCoachShell';
import { Account } from './partner/Account';
import { Refills } from './partner/Refills';
import { Schedule } from './partner/Schedule';
import { partnerColors } from './partnerTheme';

const TabNavigator = createBottomTabNavigator();

export const PartnerTabs: FC = () => (
  <TabNavigator.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: partnerColors.primary,
      tabBarInactiveTintColor: partnerColors.textMuted,
      tabBarStyle: {
        backgroundColor: partnerColors.surfaceElevated,
        borderTopColor: partnerColors.border,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <TabNavigator.Screen
      name="Schedule"
      component={Schedule}
      options={{
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size, focused }) => (
          <Icon
            name="calendar-alt"
            solid={!!focused}
            size={size}
            color={color}
          />
        ),
      }}
    />
    <TabNavigator.Screen
      name="Refills"
      component={Refills}
      options={{
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size, focused }) => (
          <Icon
            name="prescription-bottle-alt"
            solid={!!focused}
            size={size}
            color={color}
          />
        ),
      }}
    />
    <TabNavigator.Screen
      name="Account"
      component={Account}
      options={{
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size, focused }) => (
          <Icon name="user" solid={!!focused} size={size} color={color} />
        ),
      }}
    />
    <TabNavigator.Screen
      name="Coach"
      component={MiriCoachShell}
      options={{
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size, focused }) => (
          <Icon name="leaf" solid={!!focused} size={size} color={color} />
        ),
      }}
    />
  </TabNavigator.Navigator>
);

// Inner Miri bottom-tab navigator — rendered nested inside the partner app's
// outer Coach tab. Mirrors the previous standalone Tabs.tsx but drops the
// NavigationContainer wrapper since the outer partner navigator owns the
// single NavigationContainer for the whole app.
//
// Surfaces all four Miri tabs (Today / Progress / Log / Coach) plus a hidden
// Chat destination, matching the reference multiprogramexample setup.

import {
  Loader,
  ModuleNames,
  useActivationStatus,
  useMiriApp,
} from '@miri-ai/miri-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { FC, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Chat } from './Chat';
import { Coach } from './Coach';
import { Log } from './Log';
import { Progress } from './Progress';
import { Today } from './Today';
import { BottomTabParamList } from './types';

const TabNavigator = createBottomTabNavigator<BottomTabParamList>();

export const MiriTabs: FC = () => {
  const { isLoading, miriUser } = useMiriApp();
  const { isActivationComplete, activationModule } = useActivationStatus();
  const navigation = useNavigation();

  // Redirect to activation flow if not completed.
  useEffect(() => {
    if (isLoading || !miriUser) {
      return;
    }
    if (!isActivationComplete && activationModule?.name) {
      const timer = setTimeout(() => {
        // @ts-expect-error nested-navigator route name typed elsewhere
        navigation.navigate('Chat', {
          moduleName: activationModule.name ?? ModuleNames.ACTIVATION_FLOW,
          sendUserMessage: 'start_assistant',
          hideUserMessage: 'true',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isActivationComplete, activationModule, miriUser, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loader]}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <TabNavigator.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: 'white' },
      }}
    >
      <TabNavigator.Screen
        name="Today"
        component={Today}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="sun" solid={!!focused} size={size} color={color} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="Progress"
        component={Progress}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name="chart-line"
              solid={!!focused}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <TabNavigator.Screen
        name="Log"
        component={Log}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="utensils" solid={!!focused} size={size} color={color} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="Coach"
        component={Coach}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="comment" solid={!!focused} size={size} color={color} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </TabNavigator.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { justifyContent: 'center', alignItems: 'center' },
});

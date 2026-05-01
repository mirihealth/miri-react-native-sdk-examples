// Tab shell for the multi-program example. Mirrors reactnativeexample's
// activation-redirect logic but exposes the multi-program tab set:
//   Today · Progress · Log · Coach (+ hidden Chat route).
//
// The Chat tab is kept as a hidden destination (no tabBarButton) so that
// other tabs can navigate into it via `navigation.navigate('Chat', {...})`
// for module-driven coach conversations (LOG_MEAL, RECIPES, etc.).

import {
  Loader,
  ModuleNames,
  useActivationStatus,
  useMiriApp,
} from '@miri-ai/miri-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  useNavigationContainerRef,
  useTheme,
} from '@react-navigation/native';
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

export const Tabs: FC = () => {
  const { isLoading, miriUser } = useMiriApp();
  const { isActivationComplete, activationModule } = useActivationStatus();
  const theme = useTheme();
  const navigationRef = useNavigationContainerRef<BottomTabParamList>();

  // Redirect to activation flow if not completed.
  useEffect(() => {
    if (isLoading || !miriUser) {
      return;
    }

    if (!isActivationComplete && activationModule?.name) {
      const timer = setTimeout(() => {
        navigationRef.current?.navigate('Chat', {
          moduleName: activationModule.name ?? ModuleNames.ACTIVATION_FLOW,
          sendUserMessage: 'start_assistant',
          hideUserMessage: 'true',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    isLoading,
    isActivationComplete,
    activationModule,
    miriUser,
    navigationRef,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loader]}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      {miriUser && (
        <TabNavigator.Navigator
          screenOptions={{
            headerTitle: 'Miri SDK Multi-Program Example',
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
                <Icon
                  name="utensils"
                  solid={!!focused}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <TabNavigator.Screen
            name="Coach"
            component={Coach}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({ color, size, focused }) => (
                <Icon
                  name="comment"
                  solid={!!focused}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          {/* Chat is a hidden destination — entered via
              navigation.navigate from Coach chip taps and the Log Meal tile. */}
          <TabNavigator.Screen
            name="Chat"
            component={Chat}
            options={{
              tabBarButton: () => null,
              tabBarItemStyle: { display: 'none' },
            }}
          />
        </TabNavigator.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

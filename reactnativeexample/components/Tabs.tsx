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
import { FC, Fragment, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Chat } from './Chat';
import Overview from './Overview';
import { BottomTabParamList } from './types';

const TabNavigator = createBottomTabNavigator<BottomTabParamList>();

export const Tabs: FC = () => {
  const { isLoading, miriUser } = useMiriApp();
  const { isActivationComplete, activationModule, isLoading: isActivationLoading } =
    useActivationStatus();
  const theme = useTheme();
  const navigationRef = useNavigationContainerRef<BottomTabParamList>();

  // Redirect to activation flow if not completed
  useEffect(() => {
    if (isLoading || isActivationLoading || !miriUser) {
      return;
    }

    // If activation is not complete and we have an activation module, navigate to it
    if (!isActivationComplete && activationModule) {
      // Use a small timeout to ensure navigation is ready
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
    isActivationLoading,
    isActivationComplete,
    activationModule,
    miriUser,
    navigationRef,
  ]);

  if (isLoading || isActivationLoading) {
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
            headerTitle: 'Miri SDK React Native Example',
          }}
        >
          <Fragment>
            <TabNavigator.Screen
              name="Overview"
              component={Overview}
              options={{
                // eslint-disable-next-line react/no-unstable-nested-components
                tabBarIcon: ({ color, size, focused }) => (
                  <Icon
                    name="clipboard"
                    solid={!!focused}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <TabNavigator.Screen
              name="Chat"
              component={Chat}
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
          </Fragment>
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

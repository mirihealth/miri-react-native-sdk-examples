import { Loader, useMiriApp } from '@miri-ai/miri-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { FC, Fragment } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Chat } from './Chat';
import Overview from './Overview';
import { BottomTabParamList } from './types';

const TabNavigator = createBottomTabNavigator<BottomTabParamList>();

export const Tabs: FC = () => {
  const { isLoading, miriUser } = useMiriApp();
  const theme = useTheme();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loader]}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={theme}>
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

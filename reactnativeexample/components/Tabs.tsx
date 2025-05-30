import { Loader, useMiriApp } from '@miri-ai/miri-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { FC, Fragment } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
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
      <TabNavigator.Navigator
        screenOptions={{
          headerTitle: 'Miri SDK React Native Example',
        }}
      >
        {miriUser && (
          <Fragment>
            <TabNavigator.Screen name="Overview" component={Overview} />
            <TabNavigator.Screen name="Chat" component={Chat} />
          </Fragment>
        )}
      </TabNavigator.Navigator>
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

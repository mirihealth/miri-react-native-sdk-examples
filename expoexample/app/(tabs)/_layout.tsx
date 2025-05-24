import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Loader, Text, useMiriApp } from '@miri-ai/miri-react-native';
import { useAuth } from '@/contexts/AuthContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isLoading, miriUser } = useMiriApp();
  const { signout } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loader]}>
        <Loader />
      </View>
    );
  }

  if (!miriUser) {
    return (
      <View style={[styles.container, styles.loader]}>
        <Text>Unable to load Miri User</Text>
        <Button onPress={signout} size="sm">
          Sign Out
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Overview',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="clipboard" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="comment" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});

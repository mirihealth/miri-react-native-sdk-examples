// MetaPath's bottom-tab navigator. Four partner-styled tabs (Home / Meds /
// Care / Account) with the SDK's <LogPickerV2> dropped in the center slot.
//
// LogPickerV2 brings its own "+" floating button + portal-rendered grid
// of log options (Meal, Mood, Water, Sleep, Weight, Medication, …).
// Putting it in the tab bar makes logging a partner-native action: from
// the patient's perspective it's "MetaPath's log button"; under the hood
// it's the same SDK component every Miri-powered app uses, so they get
// the rich logging surface for free.
//
// `LogPickerV2` needs weight/body data fed in. We fetch via SDK hooks
// (`useMiriApp().getWeightProgress`, `useActiveMedicationGoal`) — no
// host-context, no shared state.

import {
  ModuleNames,
  ScanFoodModal,
  type CameraImage,
  type ChatSearchParams,
  LogPickerV2,
  useActiveMedicationGoal,
  useMiriApp,
  useProgram,
  type BodyComposition,
  type PlanArtifactWeight,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import {
  type BottomTabBarProps as BottomTabBarRenderProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FC, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { Account } from './Account';
import { Care } from './Care';
import { Home } from './Home';
import { Meds } from './Meds';
import { partnerColors } from './partnerTheme';
import { PartnerTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<PartnerTabParamList>();

interface TabSpec {
  name: keyof PartnerTabParamList;
  label: string;
  icon: string;
}

const LEFT_TABS: TabSpec[] = [
  { name: 'Home', label: 'Home', icon: 'home' },
  { name: 'Meds', label: 'Meds', icon: 'pills' },
];
const RIGHT_TABS: TabSpec[] = [
  { name: 'Care', label: 'Care', icon: 'user-md' },
  { name: 'Account', label: 'Account', icon: 'user' },
];
const ALL_TABS = [...LEFT_TABS, ...RIGHT_TABS];

interface WeightProgressData {
  weightGoal: PlanArtifactWeight | null;
  weightTracking: WeightTracking | null;
}

export const MetaPathTabs: FC = () => {
  const { getWeightProgress, getBodyComposition, setPendingCameraImages } =
    useMiriApp();
  const { program } = useProgram();
  const { medicationGoal, refetch: refetchMedicationGoal } =
    useActiveMedicationGoal();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [weightProgress, setWeightProgress] =
    useState<WeightProgressData | null>(null);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);
  const [showLogMealHub, setShowLogMealHub] = useState(false);
  // Bumped after any logging mutation — Home / Meds use this as a refetch
  // signal so cards refresh inline instead of stale-rendering.
  const [, setLogVersion] = useState(0);
  const bumpLogVersion = useCallback(() => setLogVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    getWeightProgress().then((wp) => {
      if (!cancelled) setWeightProgress(wp);
    });
    getBodyComposition().then((bc) => {
      if (!cancelled) setBodyComposition(bc);
    });
    return () => {
      cancelled = true;
    };
  }, [getWeightProgress, getBodyComposition]);

  const navigateToChat = useCallback(
    (params: ChatSearchParams) => {
      if (!params.moduleName) return;
      navigation.navigate('ChatModal', {
        moduleName: params.moduleName,
        sendUserMessage: params.sendUserMessage,
        hideUserMessage: params.hideUserMessage,
        messageContext: params.messageContext,
        topicLabel: 'Coach',
      });
    },
    [navigation],
  );

  const handleNavigateToLogMeal = useCallback(() => {
    setShowLogMealHub(true);
  }, []);

  const handleLogMealSuccess = useCallback(() => {
    bumpLogVersion();
  }, [bumpLogVersion]);

  const handlePhotoCapture = useCallback(
    (images: CameraImage[]) => {
      if (!images.length || !program?.id) return;
      setPendingCameraImages(images);
      setShowLogMealHub(false);
      navigateToChat({
        moduleName: `${program.id}/${ModuleNames.LOG_MEAL}`,
      });
    },
    [setPendingCameraImages, program?.id, navigateToChat],
  );

  const handleChatTileTap = useCallback(() => {
    if (!program?.id) return;
    setShowLogMealHub(false);
    navigateToChat({
      moduleName: `${program.id}/${ModuleNames.LOG_MEAL}`,
    });
  }, [program?.id, navigateToChat]);

  const handleUpdateTracking = useCallback(async () => {
    bumpLogVersion();
    const [wp, bc] = await Promise.all([
      getWeightProgress(),
      getBodyComposition(),
    ]);
    setWeightProgress(wp);
    setBodyComposition(bc);
  }, [bumpLogVersion, getWeightProgress, getBodyComposition]);

  const renderTabBar = useCallback(
    ({ state, navigation: tabNav }: BottomTabBarRenderProps) => (
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
        <View style={styles.tabBar}>
          {LEFT_TABS.map((spec) => (
            <TabButton
              key={spec.name}
              spec={spec}
              focused={
                state.index === ALL_TABS.findIndex((t) => t.name === spec.name)
              }
              onPress={() => tabNav.navigate(spec.name)}
            />
          ))}

          <View style={styles.centerSlot}>
            <LogPickerV2
              weightProgress={
                weightProgress ?? {
                  weightGoal: null,
                  weightTracking: null,
                }
              }
              bodyComposition={bodyComposition}
              onUpdateTracking={handleUpdateTracking}
              onNavigateToChat={navigateToChat}
              onNavigateToLogMeal={handleNavigateToLogMeal}
              onLogSuccess={() => {
                handleLogMealSuccess();
                refetchMedicationGoal();
              }}
              medicationGoal={medicationGoal}
            />
          </View>

          {RIGHT_TABS.map((spec) => (
            <TabButton
              key={spec.name}
              spec={spec}
              focused={
                state.index === ALL_TABS.findIndex((t) => t.name === spec.name)
              }
              onPress={() => tabNav.navigate(spec.name)}
            />
          ))}
        </View>
      </SafeAreaView>
    ),
    [
      bodyComposition,
      handleLogMealSuccess,
      handleNavigateToLogMeal,
      handleUpdateTracking,
      medicationGoal,
      navigateToChat,
      refetchMedicationGoal,
      weightProgress,
    ],
  );

  return (
    <>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Meds" component={Meds} />
        <Tab.Screen name="Care" component={Care} />
        <Tab.Screen name="Account" component={Account} />
      </Tab.Navigator>

      <ScanFoodModal
        visible={showLogMealHub}
        onClose={() => setShowLogMealHub(false)}
        onLogMeal={handleLogMealSuccess}
        onMealDeleted={handleLogMealSuccess}
        onPhotoCapture={handlePhotoCapture}
        initialMode="search"
        onChatTap={handleChatTileTap}
      />
    </>
  );
};

interface TabButtonProps {
  spec: TabSpec;
  focused: boolean;
  onPress: () => void;
}

const TabButton: FC<TabButtonProps> = ({ spec, focused, onPress }) => (
  <Pressable
    style={styles.tabButton}
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: focused }}
  >
    <Icon
      name={spec.icon}
      size={20}
      color={focused ? partnerColors.primary : partnerColors.textSubtle}
      solid={focused}
    />
    <Text
      style={[
        styles.tabLabel,
        focused ? styles.tabLabelFocused : styles.tabLabelUnfocused,
      ]}
    >
      {spec.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  tabBarSafe: {
    backgroundColor: partnerColors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: partnerColors.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    color: partnerColors.primary,
    fontWeight: '700',
  },
  tabLabelUnfocused: {
    color: partnerColors.textSubtle,
    fontWeight: '500',
  },
  centerSlot: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

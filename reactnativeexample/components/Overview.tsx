import {
  Button,
  CrossIcon,
  DateSelector,
  GearIcon,
  LogOutIcon,
  Meal,
  MealDetail,
  MealList,
  StreakTracking,
  Text,
  TrackingItemsSummary,
  useMiriApp,
  UserSettings,
  WeeklyCheckin,
  WeightProgress,
} from '@miri-ai/miri-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BottomTabParamList } from './types';

function Overview() {
  const {
    activeCoach,
    selectedDate,
    setSelectedDate,
    getMeals,
    getTrackingItemsProgress,
    getWeightProgress,
  } = useMiriApp();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [areMealsLoading, setAreMealsLoading] = useState(true);
  const [progress, setProgress] =
    useState<Awaited<ReturnType<typeof getTrackingItemsProgress>>>(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [weightProgress, setWeightProgress] =
    useState<Awaited<ReturnType<typeof getWeightProgress>>>();
  const [isWeightProgressLoading, setIsWeightProgressLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const theme = useTheme();
  const { signout } = useAuth();

  const closeMealDetail = useCallback(() => {
    setSelectedMeal(undefined);
  }, []);

  const fetchTodaysMeals = useCallback(async () => {
    setAreMealsLoading(true);
    const fetchedMeals = await getMeals(selectedDate);
    setMeals(fetchedMeals);
    setAreMealsLoading(false);
  }, [getMeals, selectedDate]);

  const fetchProgress = useCallback(async () => {
    const fetchedProgress = await getTrackingItemsProgress();
    setProgress(fetchedProgress);
    setIsProgressLoading(false);
  }, [getTrackingItemsProgress]);

  const fetchWeightProgress = useCallback(async () => {
    const fetchedWeightProgress = await getWeightProgress();
    setWeightProgress(fetchedWeightProgress);
    setIsWeightProgressLoading(false);
  }, [getWeightProgress]);

  useEffect(() => {
    fetchTodaysMeals();
  }, [fetchTodaysMeals]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    fetchWeightProgress();
  }, [fetchWeightProgress]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={[
          styles.innerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.intro}>
          {activeCoach && (
            <Text>Hello, your coach is {activeCoach.displayName}!</Text>
          )}
          <View style={styles.introButtons}>
            <Button
              variant="tertiary"
              size="sm"
              onPress={() => setIsSettingsVisible(true)}
              icon={GearIcon}
            />
            <Button
              variant="secondary"
              size="sm"
              onPress={signout}
              icon={LogOutIcon}
            />
          </View>
        </View>

        <WeeklyCheckin
          onNavigateToChat={(params) => navigation.navigate('Chat', params)}
        />

        <View style={styles.controls}>
          <DateSelector
            trackingItemsProgress={progress?.trackingItemsProgress ?? []}
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
          {weightProgress && (
            <WeightProgress
              weightProgress={weightProgress}
              onUpdateWeightTracking={fetchWeightProgress}
              isLoading={isWeightProgressLoading}
            />
          )}
        </View>

        {progress?.streakCards.map((streak) => (
          <StreakTracking streak={streak} key={streak.label} />
        ))}

        <View style={styles.summary}>
          <TrackingItemsSummary
            trackingItemsProgress={progress?.trackingItemsProgress ?? []}
            isLoading={isProgressLoading}
            selectedDate={selectedDate}
          />
        </View>

        <View style={styles.mealList}>
          <View>
            <Text style={styles.mealListHeader}>Today's Meals</Text>
          </View>
          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <MealList
                meals={meals}
                isLoading={areMealsLoading}
                onMealPress={(meal) => setSelectedMeal(meal)}
                allowDelete
              />
            )}
          />
          <Modal
            visible={selectedMeal !== undefined}
            transparent
            animationType="slide"
          >
            <SafeAreaView
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.background },
              ]}
            >
              {selectedMeal && (
                <MealDetail
                  mealId={selectedMeal?.id}
                  onDonePress={closeMealDetail}
                  onSave={async () => {
                    await fetchTodaysMeals();
                    closeMealDetail();
                  }}
                  onNavigateToChat={(params) => {
                    navigation.navigate('Chat', params);
                  }}
                />
              )}
            </SafeAreaView>
          </Modal>
          <Modal visible={isSettingsVisible} transparent animationType="slide">
            <SafeAreaView
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Button
                  size="sm"
                  variant="tertiary"
                  icon={CrossIcon}
                  onPress={() => setIsSettingsVisible(false)}
                />
              </View>
              <View style={styles.modalInnerContent}>
                <UserSettings />
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  intro: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  introButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  controls: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summary: {
    padding: 10,
  },
  mealList: {
    flex: 1,
    gap: 10,
  },
  mealListHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mealDetailContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalInnerContent: {
    flex: 1,
  },
});

export default Overview;

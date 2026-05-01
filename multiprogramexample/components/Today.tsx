// Today screen — multi-program SKU home surface.
//
// Demonstrates SDK components a multi-program tenant typically renders on
// the home tab:
//   • <ScoreCard>            — wellness score + delta pill
//   • <KeySignalsRow>        — Muscle Mass / Hydration / Steps three-up
//   • <PriorityActionCard>   — single most important action for today
//   • <InsightCard>          — Coach Insight (uses the daily_plan scope)
//   • <HabitTracking>        — per-habit streak + progress
//   • <StreakTracking>       — habit streak cards
//
// Data is fetched via SDK hooks: `useWellnessScore`, `usePriorityActionAPI`,
// `useInsights`, `useHabitProgress`, `useMiriApp().getBodyComposition`.
// No host-app imports.

import {
  Button,
  CrossIcon,
  GearIcon,
  HabitProgress,
  HabitTracking,
  InsightCard,
  KeySignalsRow,
  LogOutIcon,
  PriorityActionCard,
  ScoreCard,
  Streak,
  StreakTracking,
  Text,
  UserSettings,
  useHabitProgress,
  useInsights,
  useMiriApp,
  usePriorityActionAPI,
  useWellnessScore,
  type BodyComposition,
  type PriorityActionCompleteResponse,
  type PriorityActionResponse,
} from '@miri-ai/miri-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FC, useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { BottomTabParamList } from './types';

export const Today: FC = () => {
  const theme = useTheme();
  const { signout } = useAuth();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const { data: wellnessScore } = useWellnessScore();
  const { data: insights } = useInsights();
  const { getPriorityAction, completePriorityAction } = usePriorityActionAPI();
  const { getTodayHabitProgress } = useHabitProgress();
  const { getBodyComposition } = useMiriApp();

  const [priorityAction, setPriorityAction] =
    useState<PriorityActionResponse | null>(null);
  const [paReinforcement, setPaReinforcement] = useState<string | null>(null);
  const [isPaSubmitting, setIsPaSubmitting] = useState(false);
  const [habits, setHabits] = useState<HabitProgress[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const fetchPriorityAction = useCallback(async () => {
    const pa = await getPriorityAction();
    setPriorityAction(pa);
  }, [getPriorityAction]);

  const fetchHabits = useCallback(async () => {
    const response = await getTodayHabitProgress();
    setHabits(response?.habits ?? []);
    setStreaks(
      (response?.streak_cards ?? []).map((card) => new Streak(card)),
    );
  }, [getTodayHabitProgress]);

  const fetchBodyComposition = useCallback(async () => {
    const fetched = await getBodyComposition();
    setBodyComposition(fetched);
  }, [getBodyComposition]);

  useEffect(() => {
    fetchPriorityAction();
    fetchHabits();
    fetchBodyComposition();
  }, [fetchPriorityAction, fetchHabits, fetchBodyComposition]);

  const handleMarkPaComplete = useCallback(async () => {
    if (!priorityAction || priorityAction.is_completed) return;
    setIsPaSubmitting(true);
    try {
      const result: PriorityActionCompleteResponse | null =
        await completePriorityAction();
      if (result) {
        setPaReinforcement(result.reinforcement_text);
        setPriorityAction({
          ...priorityAction,
          is_completed: true,
          completed_at: result.completed_at,
        });
      }
    } finally {
      setIsPaSubmitting(false);
    }
  }, [priorityAction, completePriorityAction]);

  const handleHabitPress = useCallback(
    (_habit: HabitProgress) => {
      // Host apps typically navigate to a habit-detail route here. The SDK
      // doesn't ship one yet, so this example just no-ops.
    },
    [],
  );

  // Coach Insight from the daily_plan scope. Multi-program tenants surface
  // the same `daily_plan` insight on Today as the production app does.
  const dailyPlanInsight = insights?.daily_plan;
  const wsDelta = wellnessScore?.wellness_score_delta;
  const change = (() => {
    if (typeof wsDelta !== 'number' || wsDelta === 0) return undefined;
    return {
      value: Math.abs(Math.round(wsDelta)),
      direction: wsDelta > 0 ? ('up' as const) : ('down' as const),
    };
  })();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.intro}>
        <Text>Today</Text>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {wellnessScore && (
          <View style={styles.section}>
            <ScoreCard
              value={wellnessScore.wellness_score}
              label="WELLNESS SCORE"
              change={change}
            />
          </View>
        )}

        <View style={styles.section}>
          <KeySignalsRow
            bodyComposition={bodyComposition}
            leverScores={wellnessScore?.lever_scores}
          />
        </View>

        {priorityAction && (
          <View style={styles.section}>
            <PriorityActionCard
              actionText={priorityAction.action_text}
              rationale={priorityAction.rationale}
              habitCategory={priorityAction.habit_category}
              isCompleted={priorityAction.is_completed}
              generatedAt={priorityAction.generated_at}
              reinforcementText={paReinforcement}
              onMarkComplete={handleMarkPaComplete}
              isSubmitting={isPaSubmitting}
            />
          </View>
        )}

        {dailyPlanInsight && insights && (
          <View style={styles.section}>
            <InsightCard
              subtitle="Daily Plan · Pattern analysis"
              text={dailyPlanInsight.text}
              status={insights.recomputation_status}
              lastUpdatedAt={dailyPlanInsight.generated_at}
              awaitingCheckin={insights.awaiting_checkin}
            />
          </View>
        )}

        {streaks.length > 0 && (
          <View style={styles.section}>
            <StreakTracking streaks={streaks} />
          </View>
        )}

        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Today's Habits</Text>
            <HabitTracking habits={habits} onPress={handleHabitPress} />
          </View>
        )}

        {!wellnessScore && !priorityAction && habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text>
              Complete onboarding and check in to see your wellness score,
              priority action, and habits.
            </Text>
            <Button
              size="sm"
              onPress={() =>
                navigation.navigate('Coach', undefined as never)
              }
            >
              Go to Coach
            </Button>
          </View>
        )}
      </ScrollView>

      <Modal visible={isSettingsVisible} transparent animationType="slide">
        <SafeAreaProvider>
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
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    padding: 10,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
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

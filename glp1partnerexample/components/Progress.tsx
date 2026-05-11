// Progress — replaces the old Meds tab as the second bottom-tab slot.
//
// Layout (top-to-bottom):
//   1. Partner header
//   2. Weight chart (full-width — bigger than the Home version)
//   3. LeverBreakdown — SDK lever-progress rows ranked by signal relevance
//   4. Medication streak — 7-day adherence dots (SDK StreakTracking)
//
// Everything below the header is SDK-powered. The screen demonstrates that
// a partner can hand its Progress surface over to the SDK without losing
// branded chrome (the SafeArea + greeting + theme tokens stay partner-
// owned; lever rows, charts, streak dots are SDK components themed via
// `miriThemeForPartner` from MetaPathRoot).

import {
  LeverBreakdown,
  Streak,
  StreakTracking,
  useMiriApp,
  useProgressRepository,
  useWellnessScore,
  type PlanArtifactWeight,
  type ProgressDashboardResponse,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeWeightChart } from './miri/HomeWeightChart';
import { SectionHeader } from './partner/SectionHeader';
import { partnerColors } from './partnerTheme';

export const Progress: FC = () => {
  const { getWeightProgress } = useMiriApp();
  const { getProgressDashboard } = useProgressRepository();
  const { data: wellnessScore } = useWellnessScore();

  const [dashboard, setDashboard] = useState<ProgressDashboardResponse | null>(
    null,
  );
  const [weightProgress, setWeightProgress] = useState<{
    weightTracking: WeightTracking | null;
    weightGoal: PlanArtifactWeight | null;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const [dash, wp] = await Promise.all([
      getProgressDashboard(),
      getWeightProgress(),
    ]);
    setDashboard(dash);
    setWeightProgress(wp);
  }, [getProgressDashboard, getWeightProgress]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  // Convert the server's medication-streak payload into the SDK's Streak
  // model. Same pattern the production Progress screen uses — the model
  // ctor accepts the raw response and reshapes it for StreakTracking.
  const medicationStreaks = useMemo<Streak[]>(() => {
    if (!dashboard?.medication_streak) return [];
    return [new Streak(dashboard.medication_streak)];
  }, [dashboard]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>
            Your weekly trends across weight, behaviours, and adherence.
          </Text>
        </View>

        <View style={styles.weightSection}>
          <SectionHeader>Weight</SectionHeader>
          <HomeWeightChart
            currentValue={weightProgress?.weightTracking?.current?.value ?? null}
            currentUnit={weightProgress?.weightTracking?.current?.unit ?? null}
            goalValue={weightProgress?.weightGoal?.value ?? null}
            goalUnit={weightProgress?.weightGoal?.unit ?? null}
          />
        </View>

        {dashboard?.levers && dashboard.levers.length > 0 && (
          <View style={styles.leverSection}>
            <SectionHeader>Behaviours</SectionHeader>
            <View style={styles.card}>
              <LeverBreakdown levers={dashboard.levers} />
            </View>
          </View>
        )}

        {medicationStreaks.length > 0 && (
          <View style={styles.streakSection}>
            <SectionHeader>Medication adherence</SectionHeader>
            <StreakTracking streaks={medicationStreaks} />
          </View>
        )}

        {/* Wellness score footer — placeholder to demonstrate the
            useWellnessScore hook is wired even when the screen is
            otherwise empty. Real partners would render their own
            score card here. */}
        {wellnessScore && (
          <View style={styles.scoreFooter}>
            <Text style={styles.scoreLabel}>Wellness Score</Text>
            <Text style={styles.scoreValue}>
              {wellnessScore.wellness_score.toFixed(0)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  scroll: {
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: partnerColors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginTop: 4,
  },
  weightSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  leverSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  streakSection: {
    gap: 12,
    paddingHorizontal: 16,
  },
  scoreFooter: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: partnerColors.primarySoft,
    borderWidth: 1,
    borderColor: partnerColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    fontSize: 13,
    color: partnerColors.textMuted,
    letterSpacing: 0.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: partnerColors.primary,
  },
});

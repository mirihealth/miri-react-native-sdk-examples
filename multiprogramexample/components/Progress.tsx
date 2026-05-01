// Progress screen — multi-program SKU progress surface.
//
// Demonstrates the GLP-1 / multi_program PROGRESS layout (vs. the gut
// trend chart). Surfaces:
//   • <ProgressStatsRow> — 3-up: WELLNESS SCORE / PROTEIN / STEPS
//   • <InsightCard>      — Coach Insight (overview scope)
//   • <StreakTracking>   — medication streak when present
//   • <LeverBreakdown>   — full lever breakdown with In Focus / Others
//
// The host's WeightProgressCard depends on `useWeightHistory` which is in
// the SDK (private hook). We render the mini WEIGHT card from
// `useMiriApp().getWeightProgress` to keep this example self-contained.

import {
  Button,
  InsightCard,
  LeverBreakdown,
  Loader,
  Streak,
  StreakTracking,
  Text,
  useInsights,
  useMiriApp,
  useProgressRepository,
  useWellnessScore,
  type BodyComposition,
  type LeverScore,
  type PlanArtifactWeight,
  type ProgressDashboardResponse,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ProgressStatsRow } from './ProgressStatsRow';
import { WeightProgressCard } from './WeightProgressCard';

interface WeightProgressData {
  weightGoal: PlanArtifactWeight | null;
  weightTracking: WeightTracking | null;
}

export const Progress: FC = () => {
  const theme = useTheme();
  const { getProgressDashboard } = useProgressRepository();
  const { data: wellnessScore } = useWellnessScore();
  const { data: insights } = useInsights();
  const { getWeightProgress, getBodyComposition } = useMiriApp();

  const [dashboard, setDashboard] = useState<ProgressDashboardResponse | null>(
    null,
  );
  const [weightProgress, setWeightProgress] =
    useState<WeightProgressData | null>(null);
  const [bodyComposition, setBodyComposition] = useState<BodyComposition | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [d, wp, bc] = await Promise.all([
        getProgressDashboard(),
        getWeightProgress(),
        getBodyComposition(),
      ]);
      setDashboard(d);
      setWeightProgress(wp);
      setBodyComposition(bc);
    } finally {
      setIsLoading(false);
    }
  }, [getProgressDashboard, getWeightProgress, getBodyComposition]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const medicationStreaks = useMemo<Streak[]>(() => {
    if (!dashboard?.medication_streak) return [];
    return [new Streak(dashboard.medication_streak)];
  }, [dashboard]);

  const overviewInsight = insights?.overview;
  const leverScores: LeverScore[] | undefined = wellnessScore?.lever_scores;

  const handleLeverPress = useCallback((_leverId: string) => {
    // Host apps navigate to a lever-detail screen here.
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Progress</Text>

        {isLoading && (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        )}

        {!isLoading && (
          <>
            {weightProgress && (
              <WeightProgressCard
                weightTracking={weightProgress.weightTracking}
                weightGoal={weightProgress.weightGoal}
              />
            )}

            <ProgressStatsRow
              wellnessScore={wellnessScore?.wellness_score ?? null}
              leverScores={leverScores}
            />

            {overviewInsight && insights && (
              <InsightCard
                subtitle="Wellness Score · Pattern analysis"
                text={overviewInsight.text}
                status={insights.recomputation_status}
                lastUpdatedAt={overviewInsight.generated_at}
                awaitingCheckin={insights.awaiting_checkin}
              />
            )}

            {medicationStreaks.length > 0 && (
              <StreakTracking streaks={medicationStreaks} />
            )}

            {dashboard && (
              <LeverBreakdown
                levers={dashboard.levers}
                onLeverPress={handleLeverPress}
              />
            )}

            {!dashboard && (
              <View style={styles.emptyContainer}>
                <Text>No progress data yet. Check in to start tracking.</Text>
                <Button size="sm" onPress={fetchData}>
                  Refresh
                </Button>
              </View>
            )}

            {/* Body composition surfaced via SDK BodyStatsProgress — kept
                deliberately minimal here so the screen focuses on the
                three primary multi-program surfaces. The host app's
                full BodyStatsProgress card is also available. */}
            {bodyComposition && (
              <Text style={styles.bodyCompHint}>
                Body composition synced from connected health data.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  bodyCompHint: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

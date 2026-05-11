// Home — MetaPath's primary daily surface, refactored around "today's
// actions" rather than clinical context.
//
// Top-to-bottom layout:
//   1. Greeting + day counter            (partner)
//   2. Quick check-in                    (MIRI — 4 cards: medication,
//                                          mood, symptoms, movement)
//   3. Weight chart                      (MIRI — 7-day trend with goal
//                                          projection)
//   4. KeySignalsRow                     (MIRI — 3-stat lever pills)
//   5. Coaching block                    (MIRI — PriorityActionCard +
//                                          InsightCard + CoachChipRail)
//
// Clinical-of-record context (Rx, refill, visits, labs) lives on Care,
// not here. Home is the daily-action surface: log first, see trend,
// see coaching. The patient lands here every morning and either
// completes the check-in or sees what their coach said overnight.

import {
  useCareSeeker,
  useMiriApp,
  useWellnessScore,
  KeySignalsRow,
  type BodyComposition,
  type PlanArtifactWeight,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { FC, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeCoachingBlock } from './miri/HomeCoachingBlock';
import { HomeQuickCheckInBlock } from './miri/HomeQuickCheckInBlock';
import { HomeWeightChart } from './miri/HomeWeightChart';
import { SectionHeader } from './partner/SectionHeader';
import { PARTNER_BRAND, partnerColors } from './partnerTheme';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const Home: FC = () => {
  const { careSeeker } = useCareSeeker();
  const { getWeightProgress, getBodyComposition } = useMiriApp();
  const { data: wellnessScore } = useWellnessScore();

  const firstName =
    careSeeker?.displayName?.trim().split(/\s+/)[0] ||
    PARTNER_BRAND.patientFirstName;
  // Cosmetic — real partners would compute from program enrollment.
  const dayInProgram = 47;

  const [weightProgress, setWeightProgress] = useState<{
    weightTracking: WeightTracking | null;
    weightGoal: PlanArtifactWeight | null;
  } | null>(null);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);

  const fetchProgress = useCallback(async () => {
    const [wp, bc] = await Promise.all([
      getWeightProgress(),
      getBodyComposition(),
    ]);
    setWeightProgress(wp);
    setBodyComposition(bc);
  }, [getWeightProgress, getBodyComposition]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.brand}>{PARTNER_BRAND.name}</Text>
          <Text style={styles.greeting}>
            {getTimeOfDayGreeting()}, {firstName}
          </Text>
          <Text style={styles.subgreeting}>
            Day {dayInProgram} of your wellness journey
          </Text>
        </View>

        {/* MIRI: today's quick check-in (medication / mood / symptoms / movement) */}
        <HomeQuickCheckInBlock onFlowComplete={fetchProgress} />

        {/* MIRI: weight chart */}
        <View style={styles.progressBlock}>
          <SectionHeader>Your progress</SectionHeader>
          <HomeWeightChart
            currentValue={weightProgress?.weightTracking?.current?.value ?? null}
            currentUnit={weightProgress?.weightTracking?.current?.unit ?? null}
            goalValue={weightProgress?.weightGoal?.value ?? null}
            goalUnit={weightProgress?.weightGoal?.unit ?? null}
          />
          <KeySignalsRow
            bodyComposition={bodyComposition}
            leverScores={wellnessScore?.lever_scores}
          />
        </View>

        {/* MIRI: coaching (priority action + insight + chip rail) */}
        <HomeCoachingBlock />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 20,
  },
  greetingBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: partnerColors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: partnerColors.text,
    letterSpacing: -0.4,
  },
  subgreeting: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginTop: 4,
  },
  progressBlock: {
    paddingHorizontal: 16,
    gap: 12,
  },
});

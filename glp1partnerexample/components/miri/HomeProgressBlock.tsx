// HomeProgressBlock — inline Miri progress section on MetaPath's Home tab.
//
// What it shows:
//   • Weight / body-comp progress card  (SDK <BodyStatsProgress>)
//   • Three-stat key signals row         (SDK <KeySignalsRow>)
//
// The partner section header ("YOUR PROGRESS") is rendered by the host;
// only the inner cards come from the SDK. This pattern — partner labels
// the section, SDK fills it — is what makes the integration feel native:
// the patient sees "MetaPath's progress section" with components that
// happen to be Miri-powered, not a Miri tab grafted on.

import {
  BodyStatsProgress,
  KeySignalsRow,
  useMiriApp,
  useWellnessScore,
  type BodyComposition,
  type PlanArtifactWeight,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { FC, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { partnerColors } from '../partnerTheme';
import { SectionHeader } from '../partner/SectionHeader';

export const HomeProgressBlock: FC = () => {
  const { getWeightProgress, getBodyComposition } = useMiriApp();
  const { data: wellnessScore } = useWellnessScore();

  const [weightProgress, setWeightProgress] = useState<{
    weightTracking: WeightTracking | null;
    weightGoal: PlanArtifactWeight | null;
  } | null>(null);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);

  const fetchAll = useCallback(async () => {
    const [wp, bc] = await Promise.all([
      getWeightProgress(),
      getBodyComposition(),
    ]);
    setWeightProgress(wp);
    setBodyComposition(bc);
  }, [getWeightProgress, getBodyComposition]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <View style={styles.block}>
      <SectionHeader>Your progress</SectionHeader>

      <View style={styles.card}>
        <BodyStatsProgress
          weightProgress={
            weightProgress ?? {
              weightTracking: null,
              weightGoal: null,
            }
          }
          bodyComposition={bodyComposition}
          onUpdateWeightTracking={async () => {
            await fetchAll();
          }}
          onUpdateBodyMetrics={async () => {
            await fetchAll();
          }}
        />
      </View>

      <KeySignalsRow
        bodyComposition={bodyComposition}
        leverScores={wellnessScore?.lever_scores}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
});

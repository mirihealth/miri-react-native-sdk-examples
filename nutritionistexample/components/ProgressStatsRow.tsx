// Three-stat row on the Progress tab: WELLNESS SCORE / PROTEIN / STEPS.
// Mirrors the GLP-1 prototype's stats row from the production app's
// ProgressStatsRow but uses only SDK-public types (`LeverScore`).
//
// Protein uses `nutrition_balance` lever as a proxy until a dedicated
// protein lever lands. Steps reads `movement` + `unit === 'steps'`.

import { type LeverScore } from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PLACEHOLDER = '—';

interface ProgressStatsRowProps {
  wellnessScore: number | null;
  leverScores: LeverScore[] | undefined;
}

interface StatCard {
  label: string;
  value: string;
  suffix?: string;
  valueColor?: string;
}

function proteinValue(
  levers: LeverScore[] | undefined,
): { value: string; suffix?: string } {
  if (!levers) return { value: PLACEHOLDER };
  const lever = levers.find((l) => l.lever_id === 'nutrition_balance');
  if (!lever || typeof lever.current_value !== 'number') {
    return { value: PLACEHOLDER };
  }
  const target = lever.target_value;
  if (typeof target === 'number' && target > 0) {
    const pct = Math.round((lever.current_value / target) * 100);
    return { value: `${pct}%` };
  }
  return { value: PLACEHOLDER };
}

function stepsValue(levers: LeverScore[] | undefined): string {
  if (!levers) return PLACEHOLDER;
  const lever = levers.find(
    (l) => l.lever_id === 'movement' && l.unit === 'steps',
  );
  if (!lever || typeof lever.current_value !== 'number') return PLACEHOLDER;
  return Math.round(lever.current_value).toLocaleString();
}

export const ProgressStatsRow: FC<ProgressStatsRowProps> = ({
  wellnessScore,
  leverScores,
}) => {
  const { colors } = useTheme();

  let scoreColor: string | undefined;
  if (typeof wellnessScore === 'number') {
    if (wellnessScore >= 70) scoreColor = '#2E7D32';
    else scoreColor = '#ED6C02';
  }

  const protein = proteinValue(leverScores);
  const cards: StatCard[] = [
    {
      label: 'WELLNESS SCORE',
      value:
        typeof wellnessScore === 'number' ? `${wellnessScore}` : PLACEHOLDER,
      suffix: typeof wellnessScore === 'number' ? '/ 100' : undefined,
      valueColor: scoreColor,
    },
    {
      label: 'PROTEIN',
      value: protein.value,
    },
    {
      label: 'STEPS',
      value: stepsValue(leverScores),
    },
  ];

  return (
    <View style={styles.row}>
      {cards.map((c) => (
        <View
          key={c.label}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, styles.muted, { color: colors.text }]}>
            {c.label}
          </Text>
          <View style={styles.valueRow}>
            <Text
              style={[styles.value, { color: c.valueColor ?? colors.text }]}
            >
              {c.value}
            </Text>
            {c.suffix && (
              <Text
                style={[styles.suffix, styles.muted2, { color: colors.text }]}
              >
                {c.suffix}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 72,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  suffix: {
    fontSize: 11,
    fontWeight: '500',
  },
  muted: {
    opacity: 0.7,
  },
  muted2: {
    opacity: 0.6,
  },
});

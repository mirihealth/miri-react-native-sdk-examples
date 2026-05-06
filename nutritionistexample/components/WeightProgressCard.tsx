// Weight Progress card for the Progress tab — multi-program GLP-1 layout.
//
// Mirrors the production app's WEIGHT card: current weight + delta + goal,
// with an inline 7-day SVG sparkline + dashed projection to the goal.
// The SDK exposes `useWeightHistory()` for the per-day data.

import {
  useWeightHistory,
  type PlanArtifactWeight,
  type WeightHistoryPoint,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { useTheme } from '@react-navigation/native';
import { FC, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface WeightProgressCardProps {
  weightTracking: WeightTracking | null;
  weightGoal: PlanArtifactWeight | null;
}

const UNIT_DISPLAY: Record<string, string> = {
  pound: 'lbs',
  pounds: 'lbs',
  lb: 'lbs',
  kilogram: 'kg',
  kilograms: 'kg',
};

function displayUnit(unit: string | undefined): string {
  if (!unit) return 'lbs';
  return UNIT_DISPLAY[unit.toLowerCase()] ?? unit;
}

function canonicalUnit(unit: string | undefined): string {
  if (!unit) return 'lbs';
  return UNIT_DISPLAY[unit.toLowerCase()] ?? unit.toLowerCase();
}

const CHART_HEIGHT = 80;
const CHART_PAD_TOP = 8;
const CHART_PAD_BOTTOM = 16;
const CHART_PAD_X = 4;
const CHART_DAYS = 7;
const POSITIVE_COLOR = '#2E7D32';
const WARNING_COLOR = '#ED6C02';

interface ChartPaths {
  line: string;
  area: string;
  dots: { x: number; y: number }[];
  goalY: number | null;
  projection: string | null;
}

function buildChartPaths(
  points: WeightHistoryPoint[],
  width: number,
  goalValue: number | null,
): ChartPaths | null {
  if (width <= 0) return null;
  const valid = points
    .map((p, i) => (p.value != null ? { i, v: p.value } : null))
    .filter((x): x is { i: number; v: number } => x !== null);
  if (valid.length < 1) return null;

  const values = valid.map((v) => v.v);
  if (goalValue != null) values.push(goalValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.5);

  const innerW = width - 2 * CHART_PAD_X;
  const innerH = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const xStep = innerW / Math.max(points.length - 1, 1);
  const yFor = (v: number): number =>
    CHART_PAD_TOP + (1 - (v - min) / span) * innerH;

  const coords = valid.map(({ i, v }) => ({
    x: CHART_PAD_X + i * xStep,
    y: yFor(v),
  }));

  const line =
    coords.length === 1
      ? `M${coords[0].x} ${coords[0].y} L${coords[0].x + 0.01} ${coords[0].y}`
      : coords
          .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x} ${c.y}`)
          .join(' ');

  const first = coords[0];
  const last = coords[coords.length - 1];
  const baselineY = CHART_PAD_TOP + innerH;
  const area = `M${first.x} ${baselineY} ${coords
    .map((c) => `L${c.x} ${c.y}`)
    .join(' ')} L${last.x} ${baselineY} Z`;

  const goalY = goalValue != null ? yFor(goalValue) : null;
  const projection =
    goalY != null
      ? `M${last.x} ${last.y} L${width - CHART_PAD_X} ${goalY}`
      : null;

  return { line, area, dots: coords, goalY, projection };
}

export const WeightProgressCard: FC<WeightProgressCardProps> = ({
  weightTracking,
  weightGoal,
}) => {
  const { colors } = useTheme();
  const { data: weightHistory } = useWeightHistory({ days: CHART_DAYS });
  const [chartWidth, setChartWidth] = useState(0);
  const handleChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const chartPaths = useMemo(() => {
    if (!weightHistory?.history) return null;
    const unitsMatch =
      weightGoal != null &&
      canonicalUnit(weightGoal.unit) === canonicalUnit(weightHistory.unit);
    return buildChartPaths(
      weightHistory.history,
      chartWidth,
      unitsMatch ? (weightGoal?.value ?? null) : null,
    );
  }, [weightHistory, chartWidth, weightGoal]);

  if (!weightTracking?.current?.value) return null;

  const current = weightTracking.current;
  const progress = weightTracking.progress;
  const goal = weightGoal;

  const lostWeight = progress?.value != null && progress.value < 0;
  const gainedWeight = progress?.value != null && progress.value > 0;
  const noChange = !lostWeight && !gainedWeight;
  const deltaMagnitude = progress?.value != null ? Math.abs(progress.value) : 0;
  let deltaColor: string = colors.text;
  if (lostWeight) deltaColor = POSITIVE_COLOR;
  else if (gainedWeight) deltaColor = WARNING_COLOR;

  const lbsToGo = goal && current ? Math.abs(current.value - goal.value) : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.flexOne}>
          <Text style={[styles.label, styles.muted, { color: colors.text }]}>
            WEIGHT
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.bigValue, { color: colors.text }]}>
              {current.value.toFixed(1)}
            </Text>
            <Text style={[styles.unit, styles.muted, { color: colors.text }]}>
              {displayUnit(current.unit)}
            </Text>
          </View>
          {!noChange && (
            <Text style={[styles.deltaText, { color: deltaColor }]}>
              {deltaMagnitude.toFixed(1)} {displayUnit(current.unit)}{' '}
              {lostWeight ? 'lost' : 'gained'}
            </Text>
          )}
        </View>

        {goal && (
          <View style={styles.goalCol}>
            <Text style={[styles.label, styles.muted, { color: colors.text }]}>
              GOAL
            </Text>
            <View style={styles.goalValueRow}>
              <Text style={[styles.goalValue, { color: POSITIVE_COLOR }]}>
                {goal.value.toFixed(0)}
              </Text>
              <Text style={[styles.unit, styles.muted, { color: colors.text }]}>
                {displayUnit(goal.unit)}
              </Text>
            </View>
            {lbsToGo != null && lbsToGo > 0 && (
              <Text style={[styles.toGo, styles.muted2, { color: colors.text }]}>
                {lbsToGo.toFixed(1)} {displayUnit(current.unit)} to go
              </Text>
            )}
          </View>
        )}
      </View>

      {chartPaths ? (
        <View
          onLayout={handleChartLayout}
          style={styles.chartContainer}
          accessible
          accessibilityRole="image"
        >
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={POSITIVE_COLOR} stopOpacity="0.3" />
                <Stop offset="1" stopColor={POSITIVE_COLOR} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            {chartPaths.goalY != null && (
              <Path
                d={`M${CHART_PAD_X} ${chartPaths.goalY} L${chartWidth - CHART_PAD_X} ${chartPaths.goalY}`}
                stroke={POSITIVE_COLOR}
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            <Path d={chartPaths.area} fill="url(#weightArea)" />
            <Path
              d={chartPaths.line}
              stroke={POSITIVE_COLOR}
              strokeWidth={2}
              fill="none"
            />
            {chartPaths.projection && (
              <Path
                d={chartPaths.projection}
                stroke={POSITIVE_COLOR}
                strokeOpacity={0.5}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="none"
              />
            )}
            {chartPaths.dots.map((dot, idx) => (
              <Circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={3}
                fill={POSITIVE_COLOR}
              />
            ))}
          </Svg>
        </View>
      ) : (
        <View
          onLayout={handleChartLayout}
          style={styles.chartLayoutMeasure}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  chartContainer: {
    marginTop: 8,
    height: CHART_HEIGHT,
  },
  chartLayoutMeasure: {
    height: 0,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  bigValue: {
    fontSize: 30,
    fontWeight: '900',
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  goalCol: {
    alignItems: 'flex-end',
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  toGo: {
    fontSize: 11,
    marginTop: 2,
  },
  flexOne: {
    flex: 1,
  },
  muted: {
    opacity: 0.7,
  },
  muted2: {
    opacity: 0.6,
  },
});

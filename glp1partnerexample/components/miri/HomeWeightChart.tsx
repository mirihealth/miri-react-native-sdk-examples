// HomeWeightChart — partner-branded 7-day weight chart for Home.
//
// Drops in where BodyStatsProgress's weight strip used to live. Pulls
// per-day points from the SDK's `useWeightHistory` and renders them as a
// small area chart with a dashed projection line to the goal weight.
// Goal projection is drawn only when the goal's unit matches the
// history's unit (otherwise the dashed line would land at the wrong
// numeric position).
//
// Kept intentionally lean: ~150 lines, no edit-weight sheet, no body-comp
// row, no goal-edit flow. Patients edit goals from the SDK LogPickerV2
// (Weight tile) or the Care tab's medication card. This is read-only
// "here's your trend" surface, aligned with what GLP-1 patients want at
// a glance on Home.
//
// Math (`buildPaths`) is the same approach used by the host-app's
// WeightProgressCard, distilled to one function.
import { useWeightHistory, type WeightHistoryPoint } from '@miri-ai/miri-react-native';
import { FC, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { partnerColors } from '../partnerTheme';

const CHART_HEIGHT = 96;
const CHART_PAD_TOP = 8;
const CHART_PAD_BOTTOM = 12;
const CHART_PAD_X = 6;
const CHART_DAYS = 7;

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

interface ChartPaths {
  line: string;
  area: string;
  dots: { x: number; y: number }[];
  goalY: number | null;
  projection: string | null;
}

function buildPaths(
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

interface HomeWeightChartProps {
  goalValue: number | null;
  goalUnit: string | null;
  currentValue: number | null;
  currentUnit: string | null;
}

export const HomeWeightChart: FC<HomeWeightChartProps> = ({
  goalValue,
  goalUnit,
  currentValue,
  currentUnit,
}) => {
  const { data: weightHistory } = useWeightHistory({ days: CHART_DAYS });
  const [chartWidth, setChartWidth] = useState(0);
  const handleLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const chartPaths = useMemo(() => {
    if (!weightHistory?.history) return null;
    const unitsMatch =
      goalValue != null &&
      goalUnit != null &&
      canonicalUnit(goalUnit) === canonicalUnit(weightHistory.unit);
    return buildPaths(
      weightHistory.history,
      chartWidth,
      unitsMatch ? goalValue : null,
    );
  }, [weightHistory, chartWidth, goalValue, goalUnit]);

  // Delta — first non-null vs last non-null point. Surfaced as "Down 2.3 lbs
  // this week" / "Up 0.8 lbs this week" / no delta line if flat or
  // history is too sparse.
  const delta = useMemo(() => {
    if (!weightHistory?.history) return null;
    const valid = weightHistory.history
      .map((p) => p.value)
      .filter((v): v is number => v != null);
    if (valid.length < 2) return null;
    const change = valid[valid.length - 1] - valid[0];
    if (Math.abs(change) < 0.05) return null;
    return { value: change, unit: weightHistory.unit };
  }, [weightHistory]);

  const unit = displayUnit(currentUnit ?? weightHistory?.unit);
  const lbsToGo =
    goalValue != null && currentValue != null
      ? Math.abs(currentValue - goalValue)
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CURRENT</Text>
          {currentValue != null ? (
            <View style={styles.valueRow}>
              <Text style={styles.bigValue}>{currentValue.toFixed(1)}</Text>
              <Text style={styles.unit}>{unit}</Text>
            </View>
          ) : (
            <Text style={styles.emptyValue}>—</Text>
          )}
          {delta && (
            <Text
              style={[
                styles.deltaText,
                {
                  color: delta.value < 0 ? partnerColors.success : partnerColors.warning,
                },
              ]}
            >
              {delta.value < 0 ? '↓' : '↑'} {Math.abs(delta.value).toFixed(1)} {displayUnit(delta.unit)} this week
            </Text>
          )}
        </View>

        {goalValue != null && (
          <View style={styles.goalCol}>
            <Text style={styles.label}>GOAL</Text>
            <View style={styles.valueRow}>
              <Text style={styles.goalValue}>{goalValue.toFixed(0)}</Text>
              <Text style={styles.unit}>{displayUnit(goalUnit ?? unit)}</Text>
            </View>
            {lbsToGo != null && lbsToGo > 0 && (
              <Text style={styles.toGo}>
                {lbsToGo.toFixed(1)} {unit} to go
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Chart — renders only when there's enough history (≥1 point).
          With sparse data the chart slot collapses to keep the card tight
          rather than reserving empty vertical space. */}
      {chartPaths ? (
        <View onLayout={handleLayout} style={styles.chartContainer}>
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                <Stop
                  offset="0"
                  stopColor={partnerColors.primary}
                  stopOpacity="0.25"
                />
                <Stop
                  offset="1"
                  stopColor={partnerColors.primary}
                  stopOpacity="0"
                />
              </LinearGradient>
            </Defs>
            {chartPaths.goalY != null && (
              <Path
                d={`M${CHART_PAD_X} ${chartPaths.goalY} L${chartWidth - CHART_PAD_X} ${chartPaths.goalY}`}
                stroke={partnerColors.success}
                strokeOpacity={0.5}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            <Path d={chartPaths.area} fill="url(#weightArea)" />
            <Path
              d={chartPaths.line}
              stroke={partnerColors.primary}
              strokeWidth={2}
              fill="none"
            />
            {chartPaths.projection && (
              <Path
                d={chartPaths.projection}
                stroke={partnerColors.success}
                strokeOpacity={0.6}
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
                fill={partnerColors.primary}
              />
            ))}
          </Svg>
        </View>
      ) : (
        <View onLayout={handleLayout} style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>Log your weight to see trends</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: partnerColors.border,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: partnerColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bigValue: {
    fontSize: 28,
    fontWeight: '800',
    color: partnerColors.text,
    letterSpacing: -0.6,
  },
  emptyValue: {
    fontSize: 28,
    color: partnerColors.textSubtle,
  },
  unit: {
    fontSize: 14,
    color: partnerColors.textMuted,
    fontWeight: '500',
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  goalCol: {
    alignItems: 'flex-end',
  },
  goalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: partnerColors.success,
    letterSpacing: -0.3,
  },
  toGo: {
    fontSize: 11,
    color: partnerColors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  chartContainer: {
    width: '100%',
  },
  chartPlaceholder: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: partnerColors.surface,
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: partnerColors.textSubtle,
    fontStyle: 'italic',
  },
});

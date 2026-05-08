// LabSnippet — partner-owned. Most recent metabolic-panel lab result inline
// on Home so patients see their cardiometabolic markers without leaving
// the surface. Mocked static data — real partners would pull from their
// LIS / labs integration.

import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { partnerColors } from '../partnerTheme';

interface LabSnippetProps {
  drawnDate?: string;
  hba1c?: { value: number; trend: 'down' | 'up' | 'flat' };
  ldl?: { value: number; trend: 'down' | 'up' | 'flat' };
}

const TREND_GLYPH: Record<'down' | 'up' | 'flat', string> = {
  down: '↓',
  up: '↑',
  flat: '→',
};

const TREND_COLOR_HBA1C = (trend: 'down' | 'up' | 'flat') =>
  trend === 'down'
    ? partnerColors.success
    : trend === 'up'
    ? partnerColors.warning
    : partnerColors.textMuted;

export const LabSnippet: FC<LabSnippetProps> = ({
  drawnDate = 'Apr 18',
  hba1c = { value: 5.7, trend: 'down' },
  ldl = { value: 102, trend: 'down' },
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.eyebrow}>Recent labs</Text>
      <Text style={styles.drawn}>Drawn {drawnDate}</Text>
    </View>

    <View style={styles.markersRow}>
      <View style={styles.marker}>
        <Text style={styles.markerLabel}>HbA1c</Text>
        <View style={styles.markerValueRow}>
          <Text style={styles.markerValue}>{hba1c.value.toFixed(1)}</Text>
          <Text style={styles.markerUnit}>%</Text>
          <Text
            style={[
              styles.markerTrend,
              { color: TREND_COLOR_HBA1C(hba1c.trend) },
            ]}
          >
            {TREND_GLYPH[hba1c.trend]}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.marker}>
        <Text style={styles.markerLabel}>LDL</Text>
        <View style={styles.markerValueRow}>
          <Text style={styles.markerValue}>{ldl.value}</Text>
          <Text style={styles.markerUnit}>mg/dL</Text>
          <Text
            style={[
              styles.markerTrend,
              { color: TREND_COLOR_HBA1C(ldl.trend) },
            ]}
          >
            {TREND_GLYPH[ldl.trend]}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: partnerColors.textMuted,
    textTransform: 'uppercase',
  },
  drawn: {
    fontSize: 12,
    color: partnerColors.textSubtle,
  },
  markersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marker: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: partnerColors.border,
    alignSelf: 'stretch',
    marginHorizontal: 12,
  },
  markerLabel: {
    fontSize: 12,
    color: partnerColors.textMuted,
    fontWeight: '600',
  },
  markerValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  markerValue: {
    fontSize: 22,
    fontWeight: '700',
    color: partnerColors.text,
  },
  markerUnit: {
    fontSize: 12,
    color: partnerColors.textMuted,
  },
  markerTrend: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
});

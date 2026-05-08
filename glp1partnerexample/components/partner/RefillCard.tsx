// RefillCard — partner-owned. Next refill ship date for the GLP-1 medication.
// Mocked static data — real partners would wire to their pharmacy fulfilment.

import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PARTNER_BRAND, partnerColors } from '../partnerTheme';

interface RefillCardProps {
  shipDate?: string;
  supply?: string;
  status?: 'on_track' | 'shipping' | 'delayed';
}

const STATUS_LABEL: Record<NonNullable<RefillCardProps['status']>, string> = {
  on_track: 'On track',
  shipping: 'Shipping',
  delayed: 'Delayed',
};

const STATUS_COLOR: Record<NonNullable<RefillCardProps['status']>, string> = {
  on_track: partnerColors.success,
  shipping: partnerColors.primary,
  delayed: partnerColors.warning,
};

export const RefillCard: FC<RefillCardProps> = ({
  shipDate = 'May 14',
  supply = '30-day supply',
  status = 'on_track',
}) => (
  <View style={styles.card}>
    <View style={styles.iconCol}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>📦</Text>
      </View>
    </View>
    <View style={styles.body}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Refill ships {shipDate}</Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: STATUS_COLOR[status] + '22' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLOR[status] },
            ]}
          />
          <Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }]}>
            {STATUS_LABEL[status]}
          </Text>
        </View>
      </View>
      <Text style={styles.detail}>
        {PARTNER_BRAND.medication.name} · {supply}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
    gap: 12,
  },
  iconCol: {},
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: partnerColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  body: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: partnerColors.text,
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  detail: {
    fontSize: 13,
    color: partnerColors.textMuted,
    marginTop: 4,
  },
});

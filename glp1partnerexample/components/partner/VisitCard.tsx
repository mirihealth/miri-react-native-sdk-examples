// VisitCard — partner-owned. Upcoming clinical visit with the prescriber.
// Mocked static data — real partners would wire to their EHR.

import { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PARTNER_BRAND, partnerColors } from '../partnerTheme';

interface VisitCardProps {
  date?: string;
  time?: string;
  duration?: string;
  type?: string;
  modality?: string;
}

export const VisitCard: FC<VisitCardProps> = ({
  date = 'Friday',
  time = '3:00 PM',
  duration = '15 min',
  type = 'Check-in',
  modality = 'Telehealth',
}) => (
  <View style={styles.card}>
    <View style={styles.iconCol}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>📅</Text>
      </View>
    </View>
    <View style={styles.body}>
      <Text style={styles.title}>
        {type} · {duration}
      </Text>
      <Text style={styles.provider}>{PARTNER_BRAND.prescriber}</Text>
      <Text style={styles.meta}>
        {date} at {time} · {modality}
      </Text>
    </View>
    <Text style={styles.chevron}>›</Text>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: partnerColors.text,
  },
  provider: {
    fontSize: 13,
    color: partnerColors.textMuted,
    marginTop: 1,
  },
  meta: {
    fontSize: 12,
    color: partnerColors.textSubtle,
    marginTop: 4,
  },
  chevron: {
    color: partnerColors.textSubtle,
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 4,
  },
});

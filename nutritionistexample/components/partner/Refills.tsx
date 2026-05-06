// Mock "Refills" tab — supplement / medication refill requests.
// Pure UI; no real refill API integration.

import { FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { partnerColors } from '../partnerTheme';

interface Supplement {
  id: string;
  name: string;
  detail: string;
  daysLeft: number;
  status: 'active' | 'low' | 'pending';
}

const SUPPLEMENTS: Supplement[] = [
  {
    id: '1',
    name: 'Omega-3 (1000mg)',
    detail: '1 softgel · twice daily',
    daysLeft: 4,
    status: 'low',
  },
  {
    id: '2',
    name: 'Magnesium Glycinate',
    detail: '200mg · once daily, evening',
    daysLeft: 21,
    status: 'active',
  },
  {
    id: '3',
    name: 'Probiotic Blend',
    detail: '1 capsule · once daily, AM',
    daysLeft: 12,
    status: 'active',
  },
  {
    id: '4',
    name: 'Vitamin D3 (5000 IU)',
    detail: '1 softgel · once daily',
    daysLeft: 0,
    status: 'pending',
  },
];

const statusColor: Record<Supplement['status'], string> = {
  active: partnerColors.success,
  low: partnerColors.accent,
  pending: partnerColors.danger,
};

const statusLabel: Record<Supplement['status'], string> = {
  active: 'Active',
  low: 'Refill soon',
  pending: 'Refill requested',
};

export const Refills: FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Refills</Text>
        <Text style={styles.subtitle}>
          Recommended by your nutritionist
        </Text>

        {SUPPLEMENTS.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{s.name}</Text>
              <View
                style={[styles.statusPill, { backgroundColor: statusColor[s.status] }]}
              >
                <Text style={styles.statusText}>{statusLabel[s.status]}</Text>
              </View>
            </View>
            <Text style={styles.detail}>{s.detail}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.daysLeft}>
                {s.daysLeft === 0
                  ? 'Out of stock'
                  : `${s.daysLeft} day${s.daysLeft === 1 ? '' : 's'} remaining`}
              </Text>
              {s.status === 'low' && (
                <Text style={styles.action}>Request refill →</Text>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Have a question about a supplement? Ask your nutritionist in your
            next visit, or open the Coach for general guidance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: partnerColors.surface },
  content: { padding: 20, paddingBottom: 40 },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: partnerColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: partnerColors.textMuted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: partnerColors.text,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    color: partnerColors.surfaceElevated,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detail: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysLeft: { fontSize: 13, color: partnerColors.textMuted },
  action: { color: partnerColors.primary, fontSize: 14, fontWeight: '600' },
  footerNote: {
    marginTop: 8,
    padding: 14,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  footerText: {
    fontSize: 13,
    color: partnerColors.textMuted,
    lineHeight: 18,
  },
});

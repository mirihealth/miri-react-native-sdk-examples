// DoseCard — partner-owned. The single highest-attention card in the app
// for a GLP-1 patient: when's my next dose, what's the medication, did I
// log this week's injection?
//
// Sits at the very top of Home, above all Miri-embedded content. The
// adjacency is intentional: the dose card carries clinical authority
// (this patient is here BECAUSE of this medication), so the Miri progress
// card immediately below inherits that authority — patients read them as
// a single "your treatment status" block.

import { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PARTNER_BRAND, partnerColors } from '../partnerTheme';

interface DoseCardProps {
  onLogDose?: () => void;
  onSkipDetails?: () => void;
}

export const DoseCard: FC<DoseCardProps> = ({ onLogDose, onSkipDetails }) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <View style={styles.eyebrowDot} />
      <Text style={styles.eyebrow}>Next dose · tomorrow 8:00 AM</Text>
    </View>

    <View style={styles.medRow}>
      <View style={styles.medIcon}>
        <Text style={styles.medIconText}>💉</Text>
      </View>
      <View style={styles.medMeta}>
        <Text style={styles.medName}>
          {PARTNER_BRAND.medication.name} {PARTNER_BRAND.medication.dose}
        </Text>
        <Text style={styles.medDetail}>
          {PARTNER_BRAND.medication.route} ·{' '}
          {PARTNER_BRAND.medication.frequency}
        </Text>
        <Text style={styles.medPrescriber}>
          Prescribed by {PARTNER_BRAND.prescriber}
        </Text>
      </View>
    </View>

    <View style={styles.actionsRow}>
      <Pressable
        style={[styles.action, styles.primaryAction]}
        onPress={onLogDose}
        accessibilityRole="button"
      >
        <Text style={[styles.actionLabel, styles.primaryActionLabel]}>
          Log today’s dose
        </Text>
      </Pressable>
      <Pressable
        style={[styles.action, styles.secondaryAction]}
        onPress={onSkipDetails}
        accessibilityRole="button"
      >
        <Text style={[styles.actionLabel, styles.secondaryActionLabel]}>
          Dose details
        </Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: partnerColors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: partnerColors.accent,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: partnerColors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  medIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: partnerColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medIconText: {
    fontSize: 24,
  },
  medMeta: {
    flex: 1,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: partnerColors.text,
  },
  medDetail: {
    fontSize: 13,
    color: partnerColors.textMuted,
    marginTop: 2,
  },
  medPrescriber: {
    fontSize: 12,
    color: partnerColors.textSubtle,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  action: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: partnerColors.primary,
  },
  primaryActionLabel: {
    color: partnerColors.surfaceElevated,
  },
  secondaryAction: {
    backgroundColor: partnerColors.surfaceElevated,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  secondaryActionLabel: {
    color: partnerColors.text,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

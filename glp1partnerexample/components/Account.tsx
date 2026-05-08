// Account — partner-owned settings tab. Mostly partner-native (profile,
// billing, prescriber, support), with a single Miri row that opens the
// SDK's <UserSettings> sheet for coach-related preferences. The "Coach
// preferences" row is the only Miri presence on this tab — anywhere
// else the patient might expect to manage Miri-specific things (data
// access, integrations) lives in that one bridge.

import { useCareSeeker, UserSettings } from '@miri-ai/miri-react-native';
import { FC, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { partnerColors, PARTNER_BRAND } from './partnerTheme';
import { SectionHeader } from './partner/SectionHeader';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

const Row: FC<RowProps> = ({ label, value, onPress, destructive }) => (
  <Pressable
    style={({ pressed }) => [
      styles.row,
      pressed && styles.rowPressed,
      !onPress && styles.rowStatic,
    ]}
    onPress={onPress}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <Text
      style={[styles.rowLabel, destructive && { color: partnerColors.danger }]}
    >
      {label}
    </Text>
    {value ? (
      <Text style={styles.rowValue}>{value}</Text>
    ) : onPress ? (
      <Text style={styles.chevron}>›</Text>
    ) : null}
  </Pressable>
);

export const Account: FC = () => {
  const { careSeeker } = useCareSeeker();
  const { signout } = useAuth();
  const [showCoachSettings, setShowCoachSettings] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.h1}>Account</Text>
          <Text style={styles.subtitle}>
            Manage your {PARTNER_BRAND.name} membership
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader>Profile</SectionHeader>
          <View style={styles.card}>
            <Row label="Name" value={careSeeker?.displayName ?? '—'} />
            <View style={styles.divider} />
            <Row label="Email" value={careSeeker?.email ?? '—'} />
            <View style={styles.divider} />
            <Row label="Date of birth" value="Apr 14, 1986" />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader>Care team</SectionHeader>
          <View style={styles.card}>
            <Row
              label="Prescriber"
              value={PARTNER_BRAND.prescriber.split(',')[0]}
            />
            <View style={styles.divider} />
            <Row label="Pharmacy" value="MetaPath mail-order" />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader>Membership</SectionHeader>
          <View style={styles.card}>
            <Row label="Plan" value="Comprehensive" />
            <View style={styles.divider} />
            <Row label="Billing" onPress={() => {}} />
            <View style={styles.divider} />
            <Row label="Insurance" onPress={() => {}} />
          </View>
        </View>

        {/* THE Miri row — embedded as a single bridge to the SDK's
            UserSettings sheet. From the patient's perspective they're
            just opening "MetaPath's coach preferences"; under the hood
            it's the SDK component. */}
        <View style={styles.section}>
          <SectionHeader>Coach preferences</SectionHeader>
          <View style={styles.card}>
            <Row
              label="Coach settings & data"
              onPress={() => setShowCoachSettings(true)}
            />
          </View>
          <Text style={styles.helperText}>
            Manage notifications, data sync, and your coaching profile.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader>Support</SectionHeader>
          <View style={styles.card}>
            <Row label="Contact MetaPath" onPress={() => {}} />
            <View style={styles.divider} />
            <Row label="Help center" onPress={() => {}} />
            <View style={styles.divider} />
            <Row label="Privacy & terms" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Row label="Sign out" onPress={signout} destructive />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCoachSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCoachSettings(false)}
      >
        <SafeAreaView
          edges={['top', 'bottom']}
          style={styles.coachSettingsSheet}
        >
          <View style={styles.coachSettingsHeader}>
            <Pressable
              onPress={() => setShowCoachSettings(false)}
              style={styles.coachSettingsClose}
              accessibilityRole="button"
            >
              <Text style={styles.coachSettingsCloseLabel}>Done</Text>
            </Pressable>
            <Text style={styles.coachSettingsTitle}>Coach settings</Text>
            <View style={styles.coachSettingsClose} />
          </View>
          <UserSettings />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: partnerColors.surface },
  content: { paddingBottom: 32, gap: 20 },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  h1: {
    fontSize: 30,
    fontWeight: '800',
    color: partnerColors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginTop: 4,
  },
  section: { gap: 10 },
  card: {
    marginHorizontal: 16,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowPressed: {
    backgroundColor: partnerColors.surface,
  },
  rowStatic: {
    // No press state styling needed for value rows
  },
  rowLabel: {
    fontSize: 14,
    color: partnerColors.text,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: partnerColors.textMuted,
  },
  chevron: {
    color: partnerColors.textSubtle,
    fontSize: 20,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: partnerColors.border,
    marginLeft: 14,
  },
  helperText: {
    fontSize: 12,
    color: partnerColors.textSubtle,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },

  coachSettingsSheet: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  coachSettingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: partnerColors.border,
    backgroundColor: partnerColors.surfaceElevated,
  },
  coachSettingsClose: {
    minWidth: 60,
  },
  coachSettingsCloseLabel: {
    color: partnerColors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  coachSettingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: partnerColors.text,
  },
});

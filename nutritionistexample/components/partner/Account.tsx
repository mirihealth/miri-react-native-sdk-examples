// Mock "Account" tab — patient profile, care team, and partner-app settings.
// Pure UI; no real account API integration.

import { FC } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { PARTNER_BRAND, partnerColors } from '../partnerTheme';

interface Row {
  label: string;
  value?: string;
  hint?: string;
}

const PROFILE: Row[] = [
  { label: 'Member since', value: 'Jan 2026' },
  { label: 'Date of birth', value: 'Mar 14, 1989' },
  { label: 'Plan', value: 'NutriPath Plus' },
];

const CARE_TEAM: Row[] = [
  {
    label: 'Primary nutritionist',
    value: 'Dr. Adira Cohen, RD',
    hint: 'Specializes in metabolic health',
  },
  {
    label: 'Health coach',
    value: 'Powered by Miri',
    hint: 'Tap "Coach" below to chat',
  },
];

const PREFERENCES: Row[] = [
  { label: 'Notifications', value: 'On — daily reminders' },
  { label: 'Connected apps', value: 'Apple Health' },
  { label: 'Language', value: 'English (US)' },
];

const Section: FC<{ title: string; rows: Row[] }> = ({ title, rows }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.row, i === rows.length - 1 && styles.rowLast]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            {r.hint && <Text style={styles.rowHint}>{r.hint}</Text>}
          </View>
          {r.value && <Text style={styles.rowValue}>{r.value}</Text>}
        </View>
      ))}
    </View>
  </View>
);

export const Account: FC = () => {
  const { signout } = useAuth();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <Text style={styles.name}>Jordan Smith</Text>
          <Text style={styles.email}>jordan.smith@example.com</Text>
        </View>

        <Section title="Profile" rows={PROFILE} />
        <Section title="Care team" rows={CARE_TEAM} />
        <Section title="Preferences" rows={PREFERENCES} />

        <Pressable style={styles.signOut} onPress={signout}>
          <Text style={styles.signOutText}>Sign out of {PARTNER_BRAND.name}</Text>
        </Pressable>

        <Text style={styles.version}>{PARTNER_BRAND.name} · v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: partnerColors.surface },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: partnerColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: partnerColors.surfaceElevated,
    fontSize: 26,
    fontWeight: '700',
  },
  name: { fontSize: 22, fontWeight: '700', color: partnerColors.text },
  email: { fontSize: 14, color: partnerColors.textMuted, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: partnerColors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: partnerColors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: partnerColors.text, fontWeight: '500' },
  rowHint: {
    fontSize: 12,
    color: partnerColors.textMuted,
    marginTop: 2,
  },
  rowValue: { fontSize: 14, color: partnerColors.textMuted },
  signOut: {
    marginTop: 8,
    padding: 14,
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: partnerColors.border,
    alignItems: 'center',
  },
  signOutText: {
    color: partnerColors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: partnerColors.textMuted,
    marginTop: 24,
  },
});

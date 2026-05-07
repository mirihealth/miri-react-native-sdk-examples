// Mock "Schedule" tab — patient-facing list of upcoming nutritionist appointments.
// Pure UI scaffolding; no real data or API integration.

import { FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { partnerColors } from '../partnerTheme';

interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  type: string;
  location: string;
}

const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    date: 'Tomorrow',
    time: '10:30 AM',
    provider: 'Dr. Adira Cohen, RD',
    type: 'Follow-up — GLP-1 review',
    location: 'Telehealth',
  },
  {
    id: '2',
    date: 'May 14',
    time: '2:00 PM',
    provider: 'Dr. Adira Cohen, RD',
    type: '4-week check-in',
    location: 'Telehealth',
  },
  {
    id: '3',
    date: 'May 28',
    time: '9:15 AM',
    provider: 'Dr. Adira Cohen, RD',
    type: 'Quarterly assessment',
    location: 'In-office · Suite 412',
  },
];

export const Schedule: FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Schedule</Text>
        <Text style={styles.subtitle}>Upcoming visits with your care team</Text>

        {APPOINTMENTS.map((appt) => (
          <View key={appt.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{appt.date}</Text>
                <Text style={styles.datePillTime}>{appt.time}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{appt.type}</Text>
                <Text style={styles.cardProvider}>{appt.provider}</Text>
                <Text style={styles.cardLocation}>{appt.location}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.requestRow}>
          <Text style={styles.requestText}>Need a different time?</Text>
          <Text style={styles.requestLink}>Request reschedule →</Text>
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  datePill: {
    backgroundColor: partnerColors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 90,
    alignItems: 'center',
    marginRight: 14,
  },
  datePillText: {
    color: partnerColors.surfaceElevated,
    fontWeight: '700',
    fontSize: 13,
  },
  datePillTime: {
    color: partnerColors.surfaceElevated,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: partnerColors.text,
    marginBottom: 4,
  },
  cardProvider: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginBottom: 2,
  },
  cardLocation: { fontSize: 13, color: partnerColors.textMuted },
  requestRow: {
    marginTop: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: { color: partnerColors.textMuted, fontSize: 14 },
  requestLink: { color: partnerColors.primary, fontSize: 14, fontWeight: '600' },
});

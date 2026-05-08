// Care — 100% partner, no Miri components. Visits, messages, lab results.
// Patients on GLP-1 are seeing prescribers regularly; this tab is the
// clinical-care surface and intentionally Miri-free. Showing the boundary
// is part of the demo: not every partner surface needs the SDK.

import { FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabSnippet } from './partner/LabSnippet';
import { VisitCard } from './partner/VisitCard';
import { partnerColors } from './partnerTheme';
import { SectionHeader } from './partner/SectionHeader';

const PAST_VISITS = [
  {
    date: 'Apr 18',
    title: 'Quarterly review',
    summary: 'Dose increased to 5mg. Labs stable. No new symptoms reported.',
  },
  {
    date: 'Mar 21',
    title: '4-week check-in',
    summary: 'Tolerating 2.5mg well. Mild GI side effects resolving.',
  },
];

const MESSAGES = [
  {
    sender: 'Dr. Lena Patel',
    date: '2d ago',
    preview:
      'Your HbA1c is trending in the right direction. Keep up what you’re doing — see you Friday.',
    unread: true,
  },
  {
    sender: 'MetaPath Pharmacy',
    date: '5d ago',
    preview: 'Your refill is on track to ship May 14. Tracking will be sent.',
    unread: false,
  },
];

export const Care: FC = () => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.h1}>Care</Text>
        <Text style={styles.subtitle}>
          Visits, messages, and lab results from your team
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader>Upcoming visits</SectionHeader>
        <VisitCard />
      </View>

      <View style={styles.section}>
        <SectionHeader>Messages</SectionHeader>
        <View style={styles.messagesList}>
          {MESSAGES.map((m, i) => (
            <View key={i} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.messageSenderWrap}>
                  {m.unread && <View style={styles.unreadDot} />}
                  <Text style={styles.messageSender}>{m.sender}</Text>
                </View>
                <Text style={styles.messageDate}>{m.date}</Text>
              </View>
              <Text style={styles.messagePreview}>{m.preview}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader>Recent labs</SectionHeader>
        <LabSnippet />
      </View>

      <View style={styles.section}>
        <SectionHeader>Past visits</SectionHeader>
        <View style={styles.messagesList}>
          {PAST_VISITS.map((v, i) => (
            <View key={i} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>{v.title}</Text>
                <Text style={styles.messageDate}>{v.date}</Text>
              </View>
              <Text style={styles.messagePreview}>{v.summary}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);

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
  messagesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  messageCard: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messageSenderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: partnerColors.accent,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '700',
    color: partnerColors.text,
  },
  messageDate: {
    fontSize: 12,
    color: partnerColors.textSubtle,
  },
  messagePreview: {
    fontSize: 13,
    color: partnerColors.textMuted,
    lineHeight: 18,
  },
});

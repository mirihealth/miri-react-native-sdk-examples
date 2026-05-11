// Care — consolidated clinical surface. Visits, medication, messages, labs.
//
// Absorbs the old Meds tab's content (Rx card + weekly adherence strip +
// refill timeline) into a single "your clinical care" hub. The patient no
// longer needs two tabs for clinical context — Care holds all of it, and
// the Home tab focuses on today's actions (quick check-in, weight chart,
// coaching).
//
// Layout (clinical priority order):
//   1. Upcoming visits  (next telehealth)
//   2. Medication       (Rx card + adherence strip + refill)
//   3. Messages         (prescriber + pharmacy)
//   4. Recent labs
//   5. Past visits
//
// 100% partner-styled (no Miri components) — Care intentionally
// demonstrates the boundary: clinical-of-record surfaces don't need to be
// SDK-powered.

import { FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LabSnippet } from './partner/LabSnippet';
import { RefillCard } from './partner/RefillCard';
import { SectionHeader } from './partner/SectionHeader';
import { VisitCard } from './partner/VisitCard';
import { PARTNER_BRAND, partnerColors } from './partnerTheme';

const ADHERENCE = [
  { day: 'M', taken: true },
  { day: 'T', taken: true },
  { day: 'W', taken: true },
  { day: 'T', taken: true },
  { day: 'F', taken: true },
  { day: 'S', taken: true },
  { day: 'S', taken: false, isToday: true },
];

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
          Visits, medication, and lab results from your team
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader>Upcoming visits</SectionHeader>
        <VisitCard />
      </View>

      <View style={styles.section}>
        <SectionHeader>Medication</SectionHeader>
        <View style={styles.medGroup}>
          {/* Active prescription */}
          <View style={styles.rxCard}>
            <View style={styles.rxRow}>
              <Text style={styles.rxIcon}>💉</Text>
              <View style={styles.rxBody}>
                <Text style={styles.rxName}>
                  {PARTNER_BRAND.medication.name} {PARTNER_BRAND.medication.dose}
                </Text>
                <Text style={styles.rxDetail}>
                  {PARTNER_BRAND.medication.route} ·{' '}
                  {PARTNER_BRAND.medication.frequency}
                </Text>
                <Text style={styles.rxPrescriber}>
                  Prescribed by {PARTNER_BRAND.prescriber}
                </Text>
              </View>
            </View>
            <View style={styles.rxFooter}>
              <Text style={styles.rxFooterLabel}>NEXT DOSE</Text>
              <Text style={styles.rxFooterValue}>Tomorrow at 8:00 AM</Text>
            </View>
          </View>

          {/* 7-day adherence */}
          <View style={styles.adherenceCard}>
            <Text style={styles.adherenceLabel}>This week</Text>
            <View style={styles.adherenceRow}>
              {ADHERENCE.map((d, i) => (
                <View key={i} style={styles.adherenceDay}>
                  <View
                    style={[
                      styles.adherenceDot,
                      d.taken && styles.adherenceDotTaken,
                      d.isToday && styles.adherenceDotToday,
                    ]}
                  >
                    {d.taken && <Text style={styles.adherenceCheck}>✓</Text>}
                  </View>
                  <Text
                    style={[
                      styles.adherenceDayLabel,
                      d.isToday && styles.adherenceDayLabelToday,
                    ]}
                  >
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Refill timeline */}
          <RefillCard />
        </View>
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
  medGroup: {
    paddingHorizontal: 16,
    gap: 10,
  },
  rxCard: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
    overflow: 'hidden',
  },
  rxRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  rxIcon: { fontSize: 28 },
  rxBody: { flex: 1 },
  rxName: {
    fontSize: 17,
    fontWeight: '700',
    color: partnerColors.text,
  },
  rxDetail: {
    fontSize: 13,
    color: partnerColors.textMuted,
    marginTop: 2,
  },
  rxPrescriber: {
    fontSize: 12,
    color: partnerColors.textSubtle,
    marginTop: 4,
  },
  rxFooter: {
    backgroundColor: partnerColors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rxFooterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: partnerColors.primary,
  },
  rxFooterValue: {
    fontSize: 13,
    fontWeight: '700',
    color: partnerColors.primary,
  },
  adherenceCard: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
  },
  adherenceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: partnerColors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  adherenceDay: {
    alignItems: 'center',
    gap: 6,
  },
  adherenceDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: partnerColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: partnerColors.surface,
  },
  adherenceDotTaken: {
    backgroundColor: partnerColors.success,
    borderColor: partnerColors.success,
  },
  adherenceDotToday: {
    borderColor: partnerColors.accent,
    borderWidth: 2,
  },
  adherenceCheck: {
    color: partnerColors.surfaceElevated,
    fontSize: 13,
    fontWeight: '700',
  },
  adherenceDayLabel: {
    fontSize: 11,
    color: partnerColors.textSubtle,
    fontWeight: '600',
  },
  adherenceDayLabelToday: {
    color: partnerColors.accent,
    fontWeight: '700',
  },
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

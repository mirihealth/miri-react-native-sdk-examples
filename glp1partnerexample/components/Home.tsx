// Home — MetaPath's primary daily surface. The integration showcase.
//
// Top-to-bottom layout:
//   1. Partner greeting + day counter
//   2. PARTNER: DoseCard         — high-trust clinical context anchor
//   3. MIRI:    HomeProgressBlock (BodyStatsProgress + KeySignalsRow)
//   4. MIRI:    HomeCoachingBlock (PriorityActionCard + InsightCard +
//               CoachChipRail)
//   5. PARTNER: VisitCard, RefillCard, LabSnippet  (Upcoming section)
//
// Reading order is deliberate: dose (clinical authority) → progress
// (Miri inherits that authority because it's adjacent) → coaching
// (the answer to "why is my progress what it is + what should I do
// today") → upcoming (operational housekeeping). The patient's
// attention flows clinical → behavioural → operational, mirroring
// how care actually works.

import { useCareSeeker } from '@miri-ai/miri-react-native';
import { FC } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeCoachingBlock } from './miri/HomeCoachingBlock';
import { HomeProgressBlock } from './miri/HomeProgressBlock';
import { DoseCard } from './partner/DoseCard';
import { LabSnippet } from './partner/LabSnippet';
import { RefillCard } from './partner/RefillCard';
import { SectionHeader } from './partner/SectionHeader';
import { VisitCard } from './partner/VisitCard';
import { PARTNER_BRAND, partnerColors } from './partnerTheme';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const Home: FC = () => {
  const { careSeeker } = useCareSeeker();
  const firstName =
    careSeeker?.displayName?.trim().split(/\s+/)[0] ||
    PARTNER_BRAND.patientFirstName;
  // The day counter is purely cosmetic — real partners would compute
  // from program enrollment. Hard-coded here to keep the example self-
  // contained.
  const dayInProgram = 47;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting (partner) */}
        <View style={styles.greetingBlock}>
          <Text style={styles.brand}>{PARTNER_BRAND.name}</Text>
          <Text style={styles.greeting}>
            {getTimeOfDayGreeting()}, {firstName}
          </Text>
          <Text style={styles.subgreeting}>
            Day {dayInProgram} of your wellness journey
          </Text>
        </View>

        {/* PARTNER: Dose */}
        <DoseCard />

        {/* MIRI: progress (weight + key signals) */}
        <HomeProgressBlock />

        {/* MIRI: coaching (priority action + insight + chip rail) */}
        <HomeCoachingBlock />

        {/* PARTNER: upcoming */}
        <View style={styles.upcomingSection}>
          <SectionHeader>Upcoming</SectionHeader>
          <View style={styles.upcomingCards}>
            <VisitCard />
            <RefillCard />
            <LabSnippet />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 20,
  },
  greetingBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    color: partnerColors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: partnerColors.text,
    letterSpacing: -0.4,
  },
  subgreeting: {
    fontSize: 14,
    color: partnerColors.textMuted,
    marginTop: 4,
  },
  upcomingSection: {
    gap: 12,
  },
  upcomingCards: {
    gap: 10,
  },
});

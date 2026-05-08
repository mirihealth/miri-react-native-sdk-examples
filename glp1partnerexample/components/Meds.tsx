// Meds — mixed surface. Partner-owned schedule + refill, with Miri's
// side-effect coach entry and hydration habit woven in. This is the
// strongest "where Miri matters" placement: the patient is on this tab
// because they're asking "did I dose? am I feeling okay? do I need to
// reorder?" — and that's exactly when behavioural coaching has leverage.
//
// Layout:
//   1. Schedule strip          (partner — last 7 doses, this week's dose)
//   2. Active prescription     (partner — full Rx context)
//   3. "How are you feeling?"  (Miri — opens chat scoped to side-effects
//                                with `messageContext`)
//   4. Hydration habit card    (Miri — filtered HabitTracking from
//                                useHabitProgress)
//   5. Refill timeline         (partner)

import {
  HabitTracking,
  ModuleNames,
  useHabitProgress,
  useProgram,
  type HabitProgress,
} from '@miri-ai/miri-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FC, useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RefillCard } from './partner/RefillCard';
import { SectionHeader } from './partner/SectionHeader';
import { PARTNER_BRAND, partnerColors } from './partnerTheme';
import { RootStackParamList } from './types';

// 7-day adherence strip; mocked.
const ADHERENCE = [
  { day: 'M', taken: true },
  { day: 'T', taken: true },
  { day: 'W', taken: true },
  { day: 'T', taken: true },
  { day: 'F', taken: true },
  { day: 'S', taken: true },
  { day: 'S', taken: false, isToday: true },
];

export const Meds: FC = () => {
  const { program } = useProgram();
  const { getTodayHabitProgress } = useHabitProgress();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [hydrationHabits, setHydrationHabits] = useState<HabitProgress[]>([]);

  const fetchHabits = useCallback(async () => {
    const result = await getTodayHabitProgress();
    const habits = result?.habits ?? [];
    // Filter to hydration / fluid-related habits only — surface the slice
    // most relevant to GLP-1 patients here (dehydration drives a lot of
    // GLP-1 side effects: nausea, headache, constipation).
    const filtered = habits.filter((h) =>
      /hydrat|water|fluid/i.test(`${h.category} ${h.habit}`),
    );
    setHydrationHabits(filtered);
  }, [getTodayHabitProgress]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const openSideEffectChat = useCallback(() => {
    if (!program?.id) return;
    navigation.navigate('ChatModal', {
      moduleName: `${program.id}/${ModuleNames.QUICKSTART}`,
      sendUserMessage: 'I want to talk about side effects from my GLP-1 dose.',
      hideUserMessage: 'true',
      topicLabel: 'Side effects',
    });
  }, [program?.id, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.h1}>Meds</Text>
          <Text style={styles.subtitle}>
            Your {PARTNER_BRAND.medication.name} schedule and supply
          </Text>
        </View>

        {/* PARTNER: 7-day adherence */}
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

        {/* PARTNER: Active prescription */}
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

        {/* MIRI: side-effect coach entry */}
        <View style={styles.coachEntryWrap}>
          <SectionHeader>Coach support</SectionHeader>
          <Pressable
            style={styles.coachEntry}
            onPress={openSideEffectChat}
            accessibilityRole="button"
            accessibilityLabel="Talk to your coach about side effects"
          >
            <View style={styles.coachIconWrap}>
              <Text style={styles.coachIcon}>💬</Text>
            </View>
            <View style={styles.coachBody}>
              <Text style={styles.coachTitle}>How are you feeling today?</Text>
              <Text style={styles.coachSub}>
                Talk to your coach about side effects, hunger, or energy.
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* MIRI: hydration habit */}
        {hydrationHabits.length > 0 && (
          <View style={styles.habitWrap}>
            <SectionHeader>Stay hydrated</SectionHeader>
            <View style={styles.habitInner}>
              <Text style={styles.habitContext}>
                Hydration helps with the most common GLP-1 side effects.
              </Text>
              <HabitTracking habits={hydrationHabits} />
            </View>
          </View>
        )}

        {/* PARTNER: Refill */}
        <View style={styles.refillWrap}>
          <SectionHeader>Refill timeline</SectionHeader>
          <RefillCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: partnerColors.surface },
  scrollContent: {
    paddingBottom: 32,
    gap: 20,
  },
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

  adherenceCard: {
    marginHorizontal: 16,
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

  rxCard: {
    marginHorizontal: 16,
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
  rxIcon: {
    fontSize: 28,
  },
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

  coachEntryWrap: { gap: 10 },
  coachEntry: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: partnerColors.accentSoft,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  coachIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: partnerColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIcon: { fontSize: 20 },
  coachBody: { flex: 1 },
  coachTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: partnerColors.text,
  },
  coachSub: {
    fontSize: 13,
    color: partnerColors.textMuted,
    marginTop: 2,
  },
  chevron: {
    color: partnerColors.textSubtle,
    fontSize: 22,
    fontWeight: '300',
  },

  habitWrap: { gap: 10 },
  habitInner: {
    paddingHorizontal: 16,
    gap: 8,
  },
  habitContext: {
    fontSize: 13,
    color: partnerColors.textMuted,
    fontStyle: 'italic',
  },

  refillWrap: { gap: 10 },
});

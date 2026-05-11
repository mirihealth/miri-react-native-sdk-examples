// HomeQuickCheckInBlock — inline quick check-in flow on MetaPath's Home.
//
// Wraps the SDK's <QuickCheckinFlow> with six partner-defined cards:
//   1. Medication adherence (timing + injection site + side effects)
//   2. Mood (5-emoji button select)
//   3. Symptoms (gut/GLP-1 symptom multi-select)
//   4. Movement (activity-level grid)
//   5. Sleep (hours, number input)
//   6. Hydration (water-glass field, default 64oz goal)
//
// Card responses are persisted to the server via the SDK's
// useQuickCheckinRepository.submitQuickCheckinCard — same path the
// production Overview tab uses. The SDK's flow component advances cards
// one-at-a-time with a progress indicator, fires confetti on completion.
//
// The cards are static here (defined client-side rather than fetched from
// the server's quick-checkin endpoint) so the example renders predictably
// regardless of the test account's server-side config. Real partners
// would call `getQuickCheckinCards()` from useQuickCheckinRepository to
// get the user's actual scoped card set.

import {
  QuickCheckinFlow,
  useQuickCheckinRepository,
  type QuickCheckinCardConfig,
  type QuickCheckinCardData,
} from '@miri-ai/miri-react-native';
import { FC, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '../partner/SectionHeader';
import { partnerColors } from '../partnerTheme';

const MEDICATION_CARD: QuickCheckinCardConfig = {
  artifactType: 'medication_tracking_item',
  title: 'Log today’s dose',
  subtitle: 'Tirzepatide 5mg · weekly',
  presentation: {
    mode: 'sheet',
    sheetType: 'fullscreen',
    sheetTitle: 'Medication log',
    triggerLabel: 'Log dose',
    triggerCompletedLabel: 'Dose logged',
    submitLabel: 'Save',
  },
  field: [
    {
      type: 'select',
      layout: 'buttons',
      name: 'timing',
      label: 'When did you take it?',
      options: [
        { value: 'on_time', label: 'On time' },
        { value: 'late', label: 'Late' },
        { value: 'missed', label: 'Missed' },
      ],
    },
    {
      type: 'select',
      layout: 'buttons',
      name: 'injectionSite',
      label: 'Injection site',
      options: [
        { value: 'abdomen', label: 'Abdomen' },
        { value: 'thigh', label: 'Thigh' },
        { value: 'upper_arm', label: 'Upper arm' },
      ],
    },
    {
      type: 'select',
      layout: 'buttons',
      name: 'sideEffects',
      label: 'Any side effects?',
      multiSelect: true,
      options: [
        { value: 'nausea', label: 'Nausea' },
        { value: 'fatigue', label: 'Fatigue' },
        { value: 'headache', label: 'Headache' },
        { value: 'constipation', label: 'Constipation' },
        { value: 'diarrhea', label: 'Diarrhea' },
        { value: 'injection_site_reaction', label: 'Injection-site' },
        { value: 'low_appetite', label: 'Low appetite' },
        { value: 'none', label: 'No side effects', exclusive: true },
      ],
    },
  ],
};

const MOOD_CARD: QuickCheckinCardConfig = {
  artifactType: 'embedded_check_in_flag',
  title: 'How are you feeling today?',
  presentation: { mode: 'inline' },
  field: {
    type: 'select',
    layout: 'buttons',
    name: 'mood',
    label: 'How are you feeling today?',
    options: [
      { value: 'great', label: 'Great', icon: '😄' },
      { value: 'good', label: 'Good', icon: '🙂' },
      { value: 'okay', label: 'Okay', icon: '😐' },
      { value: 'not_great', label: 'Not great', icon: '😕' },
      { value: 'rough', label: 'Rough', icon: '😟' },
    ],
  },
};

const SYMPTOMS_CARD: QuickCheckinCardConfig = {
  artifactType: 'symptom_tracking',
  title: 'Any symptoms today?',
  subtitle: 'Helps your coach personalise your plan',
  presentation: {
    mode: 'sheet',
    sheetTitle: 'Track symptoms',
    triggerLabel: 'Track symptoms',
    triggerCompletedLabel: 'Symptoms tracked',
    submitLabel: 'Save',
  },
  field: {
    type: 'select',
    layout: 'buttons',
    name: 'symptoms',
    label: 'Any of these today?',
    multiSelect: true,
    options: [
      { value: 'nausea', label: 'Nausea' },
      { value: 'bloating', label: 'Bloating' },
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'constipation', label: 'Constipation' },
      { value: 'low_appetite', label: 'Low appetite' },
      { value: 'headache', label: 'Headache' },
      { value: 'none', label: 'None', exclusive: true },
    ],
  },
};

const MOVEMENT_CARD: QuickCheckinCardConfig = {
  artifactType: 'tracking_item_activity',
  title: 'How active were you today?',
  presentation: {
    mode: 'sheet',
    sheetTitle: 'Track movement',
    triggerLabel: 'Track movement',
    triggerCompletedLabel: 'Movement tracked',
    submitLabel: 'Save',
  },
  field: {
    type: 'select',
    layout: 'buttons',
    name: 'activity_level',
    label: 'Activity level today',
    options: [
      { value: 'Sedentary', label: 'Sedentary' },
      { value: 'Lightly Active', label: 'Lightly active' },
      { value: 'Moderately Active', label: 'Moderately active' },
      { value: 'Very Active', label: 'Very active' },
    ],
  },
};

const SLEEP_CARD: QuickCheckinCardConfig = {
  artifactType: 'tracking_item_sleep',
  title: 'How did you sleep last night?',
  subtitle: 'GLP-1 patients often need an extra 30 min to regulate appetite',
  presentation: {
    mode: 'sheet',
    sheetTitle: 'Track sleep',
    triggerLabel: 'Track sleep',
    triggerCompletedLabel: 'Sleep tracked',
    submitLabel: 'Save',
  },
  field: {
    type: 'number',
    name: 'sleep_hours',
    label: 'How many hours did you sleep?',
    min: 0,
    max: 24,
    unit: 'hours',
    placeholder: '7.5',
  },
};

// Goal is hard-coded here for the example. Real partners would pull it
// from the user's hydration goal via `useActiveHabitGoal` or the program
// config. `currentTotalOz` resets to 0 on every render — for a static
// demo this is fine; production would aggregate the day's water artifacts.
const HYDRATION_CARD: QuickCheckinCardConfig = {
  artifactType: 'water_intake_tracking',
  title: 'How much water have you had?',
  subtitle: '64oz/day is a typical target on Tirzepatide',
  presentation: {
    mode: 'sheet',
    sheetTitle: 'Track hydration',
    triggerLabel: 'Track water',
    triggerCompletedLabel: 'Water tracked',
    submitLabel: 'Save',
  },
  field: {
    type: 'water_glass',
    name: 'water_oz',
    label: 'How much water so far today?',
    goalOz: 64,
    currentTotalOz: 0,
  },
};

interface HomeQuickCheckInBlockProps {
  onFlowComplete?: () => void;
}

export const HomeQuickCheckInBlock: FC<HomeQuickCheckInBlockProps> = ({
  onFlowComplete,
}) => {
  const { submitQuickCheckinCard } = useQuickCheckinRepository();

  const cards = useMemo<QuickCheckinCardConfig[]>(
    () => [
      MEDICATION_CARD,
      MOOD_CARD,
      SYMPTOMS_CARD,
      MOVEMENT_CARD,
      SLEEP_CARD,
      HYDRATION_CARD,
    ],
    [],
  );

  // Persist each card as it completes. The flow itself stays
  // optimistic — submission failures don't block advancement (they're
  // logged to the SDK's logError handler). Matches OverviewContext's
  // production behaviour: fire-and-forget per card.
  const handleCardComplete = useCallback(
    async (card: QuickCheckinCardConfig, data: QuickCheckinCardData) => {
      try {
        await submitQuickCheckinCard({
          artifactType: card.artifactType,
          data: data as Record<string, unknown>,
        });
      } catch {
        // SDK's logError handler in MetaPathRoot.tsx already routes errors.
      }
    },
    [submitQuickCheckinCard],
  );

  const handleFlowComplete = useCallback(() => {
    onFlowComplete?.();
  }, [onFlowComplete]);

  return (
    <View style={styles.block}>
      <SectionHeader>Today’s check-in</SectionHeader>
      <View style={styles.cardWrap}>
        <QuickCheckinFlow
          cards={cards}
          onCardComplete={handleCardComplete}
          onFlowComplete={handleFlowComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrap: {
    backgroundColor: partnerColors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: partnerColors.border,
    overflow: 'hidden',
  },
});

// Log screen — multi-program SKU logging surface.
//
// Demonstrates the SDK's:
//   • <LogPickerV2>      — the "+" picker that opens the right log sheet
//                          per category (meal, mood, water, sleep, weight,
//                          medication, …). Medication tile is gated on a
//                          non-null `medicationGoal` artifact (fetched via
//                          `useActiveMedicationGoal`).
//   • <ScanFoodModal>    — 4-tile Log Meal hub (voice / barcode / photo /
//                          chat) that LogPickerV2's Log Meal entry routes
//                          into via `onNavigateToLogMeal`.
//   • <VoiceMealFlow>    — voice capture + meal review, rendered inline via
//                          ScanFoodModal's `renderVoiceCapture` render-prop.
//   • <DateSelector>     — 7-day strip + month-picker
//   • <MealList>         — meals for the selected date

import {
  DateSelector,
  LogPickerV2,
  Meal,
  MealList,
  ModuleNames,
  ScanFoodModal,
  Text,
  VoiceMealFlow,
  useActiveMedicationGoal,
  useMiriApp,
  useProgram,
  type CameraImage,
  type ChatSearchParams,
  type BodyComposition,
  type PlanArtifactWeight,
  type WeightTracking,
} from '@miri-ai/miri-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FC, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabParamList } from './types';

interface WeightProgressData {
  weightGoal: PlanArtifactWeight | null;
  weightTracking: WeightTracking | null;
}

export const Log: FC = () => {
  const theme = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const {
    selectedDate,
    setSelectedDate,
    getMeals,
    getTrackingItemsProgress,
    getWeightProgress,
    getBodyComposition,
    setPendingCameraImages,
  } = useMiriApp();
  const { program } = useProgram();
  const { medicationGoal } = useActiveMedicationGoal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [areMealsLoading, setAreMealsLoading] = useState(true);
  const [progress, setProgress] =
    useState<Awaited<ReturnType<typeof getTrackingItemsProgress>>>(null);
  const [weightProgress, setWeightProgress] =
    useState<WeightProgressData | null>(null);
  const [bodyComposition, setBodyComposition] =
    useState<BodyComposition | null>(null);
  const [showLogMealModal, setShowLogMealModal] = useState(false);

  const fetchMeals = useCallback(async () => {
    setAreMealsLoading(true);
    const fetched = await getMeals(selectedDate);
    setMeals(fetched);
    setAreMealsLoading(false);
  }, [getMeals, selectedDate]);

  const fetchProgress = useCallback(async () => {
    const fetched = await getTrackingItemsProgress();
    setProgress(fetched);
  }, [getTrackingItemsProgress]);

  const fetchWeightProgress = useCallback(async () => {
    const fetched = await getWeightProgress();
    setWeightProgress(fetched);
  }, [getWeightProgress]);

  const fetchBodyComposition = useCallback(async () => {
    const fetched = await getBodyComposition();
    setBodyComposition(fetched);
  }, [getBodyComposition]);

  useEffect(() => {
    fetchMeals();
    fetchProgress();
    fetchWeightProgress();
    fetchBodyComposition();
  }, [fetchMeals, fetchProgress, fetchWeightProgress, fetchBodyComposition]);

  const handleNavigateToChat = useCallback(
    (params: ChatSearchParams) => {
      navigation.navigate('Chat', params);
    },
    [navigation],
  );

  const handleNavigateToLogMeal = useCallback(() => {
    setShowLogMealModal(true);
  }, []);

  const handleChatTileTap = useCallback(() => {
    if (!program?.id) return;
    setShowLogMealModal(false);
    handleNavigateToChat({
      moduleName: `${program.id}/${ModuleNames.LOG_MEAL}`,
    });
  }, [handleNavigateToChat, program?.id]);

  const handlePhotoCapture = useCallback(
    (images: CameraImage[]) => {
      if (!images.length || !program?.id) return;
      setPendingCameraImages(images);
      setShowLogMealModal(false);
      handleNavigateToChat({
        moduleName: `${program.id}/${ModuleNames.LOG_MEAL}`,
      });
    },
    [setPendingCameraImages, handleNavigateToChat, program?.id],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Log</Text>
      </View>

      <View style={styles.controls}>
        <DateSelector
          trackingItemsProgress={progress?.trackingItemsProgress ?? []}
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
        />
      </View>

      <View style={styles.mealsSection}>
        <Text style={styles.sectionHeader}>Meals</Text>
        <MealList
          meals={meals}
          isLoading={areMealsLoading}
          allowDelete
          onDeleteMeal={() => fetchMeals()}
        />
      </View>

      {weightProgress && (
        <View style={styles.pickerBar}>
          <LogPickerV2
            weightProgress={weightProgress}
            bodyComposition={bodyComposition}
            medicationGoal={medicationGoal}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToLogMeal={handleNavigateToLogMeal}
            onUpdateTracking={async () => {
              await fetchWeightProgress();
              await fetchProgress();
              await fetchMeals();
            }}
            onLogSuccess={() => fetchMeals()}
          />
        </View>
      )}

      <ScanFoodModal
        visible={showLogMealModal}
        onClose={() => setShowLogMealModal(false)}
        onLogMeal={() => fetchMeals()}
        onMealDeleted={() => fetchMeals()}
        onPhotoCapture={handlePhotoCapture}
        onChatTap={handleChatTileTap}
        initialMode="search"
        renderVoiceCapture={({ closeVoiceView }) => (
          <VoiceMealFlow
            onClose={closeVoiceView}
            onMealSaved={() => fetchMeals()}
            forDate={selectedDate}
            onError={(message) => console.warn('voice error:', message)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  controls: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  mealsSection: {
    flex: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

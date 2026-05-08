// HomeCoachingBlock — inline Miri coaching section on MetaPath's Home tab.
//
// What it shows:
//   • <PriorityActionCard>  — single most-important action for today, with
//                             rationale + Mark Complete
//   • <InsightCard>         — Coach Insight summarising the user's pattern
//                             across recent days
//   • <CoachChipRail>       — chip rail to start a coach conversation
//
// On a GLP-1 patient's Home tab, this block sits directly under the
// progress block. The patient reads their weight + key signals, then sees
// the most important thing to do today (priority action), an insight
// summarising why, and a chip rail to ask a question. That's the full
// "what / why / what next" flow without leaving Home.

import {
  InsightCard,
  PriorityActionCard,
  useInsights,
  usePriorityActionAPI,
  type PriorityActionResponse,
} from '@miri-ai/miri-react-native';
import { FC, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '../partner/SectionHeader';
import { CoachChipRail } from './CoachChipRail';

export const HomeCoachingBlock: FC = () => {
  const { data: insights } = useInsights();
  const { getPriorityAction, completePriorityAction } = usePriorityActionAPI();

  const [priorityAction, setPriorityAction] =
    useState<PriorityActionResponse | null>(null);
  const [paReinforcement, setPaReinforcement] = useState<string | null>(null);
  const [isPaSubmitting, setIsPaSubmitting] = useState(false);

  const fetchPa = useCallback(async () => {
    const pa = await getPriorityAction();
    setPriorityAction(pa);
  }, [getPriorityAction]);

  useEffect(() => {
    fetchPa();
  }, [fetchPa]);

  const handleMarkComplete = useCallback(async () => {
    if (!priorityAction || priorityAction.is_completed) return;
    setIsPaSubmitting(true);
    try {
      const result = await completePriorityAction();
      if (result) {
        setPaReinforcement(result.reinforcement_text);
        setPriorityAction({
          ...priorityAction,
          is_completed: true,
          completed_at: result.completed_at,
        });
      }
    } finally {
      setIsPaSubmitting(false);
    }
  }, [priorityAction, completePriorityAction]);

  const dailyPlanInsight = insights?.daily_plan;
  const hasAnyContent = priorityAction || dailyPlanInsight;

  if (!hasAnyContent) return null;

  return (
    <View style={styles.block}>
      <SectionHeader>Today’s coaching</SectionHeader>

      <View style={styles.cards}>
        {priorityAction && (
          <PriorityActionCard
            actionText={priorityAction.action_text}
            rationale={priorityAction.rationale}
            habitCategory={priorityAction.habit_category}
            isCompleted={priorityAction.is_completed}
            generatedAt={priorityAction.generated_at}
            reinforcementText={paReinforcement}
            onMarkComplete={handleMarkComplete}
            isSubmitting={isPaSubmitting}
          />
        )}

        {dailyPlanInsight && insights && (
          <InsightCard
            subtitle="Daily plan · Pattern analysis"
            text={dailyPlanInsight.text}
            status={insights.recomputation_status}
            lastUpdatedAt={dailyPlanInsight.generated_at}
            awaitingCheckin={insights.awaiting_checkin}
          />
        )}
      </View>

      <View style={styles.askRail}>
        <CoachChipRail limit={6} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    gap: 12,
  },
  cards: {
    paddingHorizontal: 16,
    gap: 12,
  },
  askRail: {
    marginTop: 4,
  },
});

// CoachChipRail — partner-styled horizontal chip rail fed by the SDK's
// `useCoachChipsAPI`. Server returns SKU-aware chips (e.g. side-effects /
// hunger / plate swaps for the GLP-1 chip set); each chip carries a
// `module_name` + `prompt_text` that we navigate to in ChatModal.
//
// Why surface chips inline on Home instead of behind a "Coach" tab?
// GLP-1 patients open the app for dose & visit info; coaching needs to
// meet them where they are. The chip rail lives directly under the
// Coach Insight card, so the moment a patient reads "your nausea was
// lower on hydration days," they can tap "Side effects" and continue
// the conversation in a modal sheet — without losing their place on
// the home screen.

import {
  Loader,
  useCareSeeker,
  useCoachChipsAPI,
  usePractitioner,
  useProgram,
  type CoachChip,
} from '@miri-ai/miri-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { partnerColors } from '../partnerTheme';
import { RootStackParamList } from '../types';

interface CoachChipRailProps {
  /** Which domains to surface in this rail (e.g. ['nutrition'] on Home). */
  domains?: ReadonlyArray<CoachChip['domain']>;
  /** Optional override: caller can hand-pick chip module_name substrings to keep. */
  moduleFilter?: (chip: CoachChip) => boolean;
  /** How many chips to show, max. Default 6. */
  limit?: number;
}

export const CoachChipRail: FC<CoachChipRailProps> = ({
  domains,
  moduleFilter,
  limit = 6,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { careSeeker } = useCareSeeker();
  const { program } = useProgram();
  const { practitioner } = usePractitioner();
  const { getCoachChips } = useCoachChipsAPI();
  const [chips, setChips] = useState<CoachChip[]>([]);
  const [loading, setLoading] = useState(true);

  // Server returns multi-program / GLP-1 chips when sku is `multi_program`.
  // Fall back to the practitioner's productSku if the program SKU isn't set.
  const sku = useMemo(
    () => program?.productSku ?? practitioner?.productSku ?? 'multi_program',
    [program, practitioner],
  );

  useEffect(() => {
    if (!careSeeker?.id) return;
    let cancelled = false;
    setLoading(true);
    getCoachChips(sku)
      .then((response) => {
        if (cancelled) return;
        const all = response?.chips ?? [];
        let kept = all;
        if (domains && domains.length > 0) {
          kept = kept.filter((c) => domains.includes(c.domain));
        }
        if (moduleFilter) {
          kept = kept.filter(moduleFilter);
        }
        setChips(kept.slice(0, limit));
      })
      .catch(() => {
        if (!cancelled) setChips([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [getCoachChips, careSeeker?.id, sku, domains, moduleFilter, limit]);

  const handleChipPress = useCallback(
    (chip: CoachChip) => {
      if (!program?.id) return;
      navigation.navigate('ChatModal', {
        moduleName: `${program.id}/${chip.module_name}`,
        sendUserMessage: chip.prompt_text,
        topicLabel: chip.label,
      });
    },
    [program?.id, navigation],
  );

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <Loader />
      </View>
    );
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.chip_id}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={() => handleChipPress(chip)}
          accessibilityRole="button"
          accessibilityLabel={chip.label}
        >
          <Text style={styles.chipLabel} numberOfLines={2}>
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: partnerColors.primarySoft,
    borderWidth: 1,
    borderColor: partnerColors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 96,
    maxWidth: 200,
    justifyContent: 'center',
  },
  chipPressed: {
    backgroundColor: partnerColors.primary,
  },
  chipLabel: {
    color: partnerColors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

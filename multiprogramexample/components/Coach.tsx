// Coach screen — multi-program SKU coach surface.
//
// Demonstrates the SDK's coach-chip API. The server returns SKU-aware
// topic + chip lists (cravings / recipes / restaurants / doctor visit
// for the multi_program / GLP-1 chip set). Tapping a chip routes to
// the Chat tab with the chip's `module_name` + `prompt_text`.

import {
  Loader,
  Text,
  useCareSeeker,
  useCoachChipsAPI,
  usePractitioner,
  useProgram,
  type CoachChip,
  type CoachTopic,
} from '@miri-ai/miri-react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabParamList } from './types';

export const Coach: FC = () => {
  const theme = useTheme();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { careSeeker } = useCareSeeker();
  const { program } = useProgram();
  const { practitioner } = usePractitioner();
  const { getCoachChips } = useCoachChipsAPI();

  const [topics, setTopics] = useState<CoachTopic[]>([]);
  const [greeting, setGreeting] = useState('');
  const [welcome, setWelcome] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // The server returns multi-program / GLP-1 chips when sku is `multi_program`.
  // Fall back to the practitioner's productSku if the program SKU isn't set.
  const sku = useMemo(
    () => program?.productSku ?? practitioner?.productSku ?? 'multi_program',
    [program, practitioner],
  );

  useEffect(() => {
    if (!careSeeker?.id) return;
    let cancelled = false;
    const fetchChips = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await getCoachChips(sku);
        if (cancelled) return;
        if (response) {
          setTopics(response.topics ?? []);
          setGreeting(response.greeting ?? '');
          // Prefer the new `subtitle` field when present (added in SDK
          // 1.220.0); fall back to `welcome_message` for older servers.
          setWelcome(response.subtitle ?? response.welcome_message ?? '');
        } else {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchChips();
    return () => {
      cancelled = true;
    };
  }, [getCoachChips, careSeeker?.id, sku]);

  const toggleTopic = useCallback((topicId: string) => {
    setExpandedTopics((prev) => {
      if (prev.has(topicId)) return new Set();
      return new Set([topicId]);
    });
  }, []);

  const handleChipPress = useCallback(
    (chip: CoachChip) => {
      if (!program?.id) return;
      navigation.navigate('Chat', {
        moduleName: `${program.id}/${chip.module_name}`,
        sendUserMessage: chip.prompt_text,
      });
    },
    [program?.id, navigation],
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text>Unable to load coaching options. Please try again.</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(greeting || welcome) && (
          <View style={styles.greeting}>
            {greeting ? (
              <Text style={styles.greetingLabel}>{greeting.toUpperCase()}</Text>
            ) : null}
            {welcome ? (
              <Text style={styles.subtitleText}>{welcome}</Text>
            ) : null}
          </View>
        )}

        <Text style={styles.browseLabel}>BROWSE BY TOPIC</Text>

        <View style={styles.topicGrid}>
          {topics.map((topic) => {
            const isExpanded = expandedTopics.has(topic.topic_id);
            return (
              <TouchableOpacity
                key={topic.topic_id}
                style={[
                  styles.topicPill,
                  {
                    backgroundColor: isExpanded
                      ? theme.colors.primary
                      : theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => toggleTopic(topic.topic_id)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.topicLabel,
                    {
                      color: isExpanded
                        ? theme.colors.background
                        : theme.colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {topic.label}
                </Text>
                <Text
                  style={[
                    styles.topicArrow,
                    {
                      color: isExpanded
                        ? theme.colors.background
                        : theme.colors.text,
                    },
                  ]}
                >
                  {isExpanded ? '\u25B2' : '\u25BC'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {topics.map((topic) => {
          if (!expandedTopics.has(topic.topic_id)) return null;
          return (
            <View key={topic.topic_id} style={styles.expandedSection}>
              <Text style={styles.sectionHeader}>
                {topic.label.toUpperCase()}
              </Text>
              <View style={styles.chipList}>
                {topic.chips.map((chip) => (
                  <Pressable
                    key={chip.chip_id}
                    style={[
                      styles.chipButton,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleChipPress(chip)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.chipLabel, { color: theme.colors.text }]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  greeting: {
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.7,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  browseLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    marginBottom: 8,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  topicArrow: {
    fontSize: 9,
    marginLeft: 4,
  },
  expandedSection: {
    gap: 8,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  chipList: {
    gap: 6,
  },
  chipButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

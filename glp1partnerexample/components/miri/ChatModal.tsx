// ChatModal — full-screen modal sheet wrapping the SDK's <Chat>.
//
// Tap a coach chip on Home or the side-effect entry on Meds → this opens.
// The chat session is module-scoped (LOG_MEAL, RECIPES, etc.) and the
// chip's prompt_text is sent as the first user message so the chat opens
// with momentum, not a blank input field.

import {
  ChatInput,
  ChevronLeftIcon,
  MessagesList,
  Chat as MiriChat,
  ModuleNames,
  toTitleCase,
  useMiriApp,
} from '@miri-ai/miri-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FC, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { partnerColors } from '../partnerTheme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatModal'>;

export const ChatModal: FC<Props> = ({ route, navigation }) => {
  const { activeCoach } = useMiriApp();
  const {
    moduleName,
    sendUserMessage,
    hideUserMessage,
    messageContext,
    topicLabel,
  } = route.params;

  const headerLabel = useMemo(() => {
    if (topicLabel) return topicLabel;
    // Fall back to humanising the module name (e.g. log_meal → Log Meal).
    const matchedKey = Object.keys(ModuleNames).find(
      (key) => ModuleNames[key as keyof typeof ModuleNames] === moduleName,
    );
    return toTitleCase(
      (matchedKey || 'Coach').split('_').join(' ').toLowerCase(),
    );
  }, [topicLabel, moduleName]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close coach"
        >
          <ChevronLeftIcon color={partnerColors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>MetaPath Coach</Text>
          <Text style={styles.headerTitle}>{headerLabel}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.chat}>
        <MiriChat
          moduleName={moduleName}
          sendUserMessage={sendUserMessage}
          hideUserMessage={hideUserMessage}
          messageContext={messageContext}
          introMessage={
            moduleName === ModuleNames.QUICKSTART && activeCoach
              ? `Hi from ${activeCoach.displayName}. What can I help you with today?`
              : undefined
          }
          onEndChat={async () => navigation.goBack()}
          endChatLabel="Close"
        >
          <MessagesList />
          <ChatInput />
        </MiriChat>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: partnerColors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: partnerColors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: partnerColors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: partnerColors.textSubtle,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: partnerColors.text,
    marginTop: 2,
  },
  headerSpacer: { width: 36 },
  chat: { flex: 1 },
});

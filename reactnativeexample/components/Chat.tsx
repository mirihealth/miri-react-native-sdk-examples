import {
  Button,
  ChatInput,
  ChevronLeftIcon,
  MessagesList,
  Chat as MiriChat,
  ModuleNames,
  Text,
  theme,
  toTitleCase,
  useMiriApp,
} from '@miri-ai/miri-react-native';
import {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { FC, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomTabParamList } from './types';

const MODULE_BUTTONS: { label: string; module: ModuleNames }[] = [
  { label: 'Log Meal', module: ModuleNames.LOG_MEAL },
  { label: 'Restaurants', module: ModuleNames.RESTAURANTS },
  { label: 'Recipes', module: ModuleNames.RECIPES },
  { label: 'Cravings', module: ModuleNames.CRAVINGS },
  { label: 'Onboarding', module: ModuleNames.ACTIVATION_FLOW },
  { label: 'QuickStart', module: ModuleNames.QUICKSTART },
];

export const Chat: FC<BottomTabScreenProps<BottomTabParamList, 'Chat'>> = ({
  route,
}) => {
  const { params } = route;
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { activeCoach } = useMiriApp();
  const [moduleName, setModuleName] = useState<string>();
  const [chatSessionId, setChatSessionId] = useState<string>();
  const [hideUserMessage, setHideUserMessage] = useState<string>();
  const [messageContext, setMessageContext] = useState<string>();
  const [sendUserMessage, setSendUserMessage] = useState<string>();
  const humanReadableModuleName = useMemo(
    () =>
      toTitleCase(
        (
          Object.keys(ModuleNames).find(
            (key) =>
              ModuleNames[key as keyof typeof ModuleNames] === moduleName,
          ) || ''
        )
          .split('_')
          .join(' ')
          .toLowerCase(),
      ),
    [moduleName],
  );
  useEffect(() => {
    if (params?.moduleName) {
      setModuleName(params.moduleName);
    }

    if (params?.chatSessionId) {
      setChatSessionId(params.chatSessionId);
    }

    if (params?.hideUserMessage) {
      setHideUserMessage(params.hideUserMessage);
    }

    if (params?.messageContext) {
      setMessageContext(params.messageContext);
    }

    if (params?.sendUserMessage) {
      setSendUserMessage(params.sendUserMessage);
    }
  }, [navigation, params]);

  return (
    <View style={styles.container}>
      {!moduleName && (
        <View style={styles.buttonContainer}>
          {MODULE_BUTTONS.map(({ label, module }) => (
            <Button
              key={label}
              size="sm"
              onPress={() => {
                setModuleName(module);
                setChatSessionId(undefined);
                setHideUserMessage(undefined);
                setMessageContext(undefined);
                setSendUserMessage(undefined);
              }}
            >
              {label}
            </Button>
          ))}
        </View>
      )}

      {activeCoach && moduleName && (
        <View style={styles.chat}>
          <View style={styles.header}>
            <Pressable onPress={() => setModuleName(undefined)}>
              <ChevronLeftIcon color={theme.colors.foreground} />
            </Pressable>
            <Text style={styles.headerText}>{humanReadableModuleName}</Text>
          </View>
          <MiriChat
            moduleName={moduleName}
            chatSessionId={chatSessionId}
            hideUserMessage={hideUserMessage}
            sendUserMessage={sendUserMessage}
            messageContext={messageContext}
            introMessage={
              moduleName === ModuleNames.QUICKSTART
                ? `Hello from ${activeCoach.displayName}! What would you like to talk about?`
                : undefined
            }
            onEndChat={() => setModuleName(undefined)}
            endChatLabel="Close"
          >
            <MessagesList />
            <ChatInput />
          </MiriChat>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  chat: {
    flex: 1,
  },
});

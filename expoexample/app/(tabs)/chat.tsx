import {
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  ChatInput,
  MessagesList,
  ModuleNames,
  useMiriApp,
  Chat,
  ChevronLeftIcon,
  Text,
  toTitleCase,
} from "@miri-ai/miri-react-native";

import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

const MODULE_BUTTONS: { label: string; module: ModuleNames }[] = [
  { label: "Log Meal", module: ModuleNames.LOG_MEAL },
  { label: "Restaurants", module: ModuleNames.RESTAURANTS },
  { label: "Recipes", module: ModuleNames.RECIPES },
  { label: "Cravings", module: ModuleNames.CRAVINGS },
  { label: "Onboarding", module: ModuleNames.ACTIVATION_FLOW },
  { label: "QuickStart", module: ModuleNames.QUICKSTART },
];

function ChatTab() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [moduleName, setModuleName] = useState<ModuleNames>();
  const [chatSessionId, setChatSessionId] = useState<string>();
  const [sendUserMessage, setSendUserMessage] = useState<string>();
  const [hideUserMessage, setHideUserMessage] = useState<string>();
  const [messageContext, setMessageContext] = useState<string>();
  const { activeCoach } = useMiriApp();

  const humanReadableModuleName = useMemo(
    () =>
      toTitleCase(
        (
          Object.keys(ModuleNames).find(
            (key) =>
              ModuleNames[key as keyof typeof ModuleNames] === moduleName,
          ) || ""
        )
          .split("_")
          .join(" ")
          .toLowerCase(),
      ),
    [moduleName],
  );

  useEffect(() => {
    if (params.moduleName) {
      setModuleName(params.moduleName as ModuleNames);
    }

    if (params.chatSessionId) {
      setChatSessionId(params.chatSessionId.toString());
    }
    if (params.sendUserMessage) {
      setSendUserMessage(params.sendUserMessage.toString());
    }
    if (params.hideUserMessage) {
      setHideUserMessage(params.hideUserMessage.toString());
    }
    if (params.messageContext) {
      setMessageContext(params.messageContext.toString());
    }

    if (Object.keys(params).length) {
      router.replace({ pathname: "/chat" });
    }
  }, [params, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.innerContainer}>
        {!moduleName && (
          <View style={styles.buttonContainer}>
            {MODULE_BUTTONS.map(({ label, module }) => (
              <Button
                key={label}
                size="sm"
                onPress={() => setModuleName(module)}
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
                <ChevronLeftIcon />
              </Pressable>
              <Text style={styles.headerText}>{humanReadableModuleName}</Text>
            </View>
            <Chat
              moduleName={moduleName}
              chatSessionId={chatSessionId}
              sendUserMessage={sendUserMessage}
              hideUserMessage={hideUserMessage}
              messageContext={messageContext}
              introMessage={
                moduleName === ModuleNames.QUICKSTART
                  ? `Hello from ${activeCoach.displayName}! What would you like to talk about?`
                  : undefined
              }
              onEndChat={() => {
                setModuleName(undefined);
                setChatSessionId(undefined);
                setSendUserMessage(undefined);
                setHideUserMessage(undefined);
                setMessageContext(undefined);
              }}
              endChatLabel="Back"
            >
              <MessagesList />
              <ChatInput />
            </Chat>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  headerText: {
    fontSize: 20,
  },
  buttonContainer: {
    justifyContent: "center",
    gap: 10,
    padding: 10,
  },
  chat: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
});

export default ChatTab;

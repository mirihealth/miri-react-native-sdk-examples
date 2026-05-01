// Tab + chat-route param shapes. The Coach + Log tabs both navigate into
// the shared <Chat /> screen with a moduleName, so we hang the chat params
// off a single tab name to mirror reactnativeexample's approach.
export type BottomTabParamList = {
  Auth: undefined;
  Today: undefined;
  Progress: undefined;
  Log: undefined;
  Coach: undefined;
  Chat: {
    moduleName?: string;
    chatSessionId?: string;
    hideUserMessage?: string;
    sendUserMessage?: string;
    messageContext?: string;
  };
};

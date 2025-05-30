export type BottomTabParamList = {
  Auth: undefined;
  Overview: undefined;
  Chat: {
    moduleName?: string;
    chatSessionId?: string;
    hideUserMessage?: string;
    sendUserMessage?: string;
    messageContext?: string;
  };
};

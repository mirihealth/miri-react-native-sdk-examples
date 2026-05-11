// Tab + stack types for MetaPath's partner-app navigator.

import { NavigatorScreenParams } from '@react-navigation/native';

export interface ChatModalParams {
  moduleName: string;
  sendUserMessage?: string;
  hideUserMessage?: string;
  messageContext?: string;
  /** Used to seed the modal title — falls back to the chip label or a default. */
  topicLabel?: string;
}

export type PartnerTabParamList = {
  Home: undefined;
  Progress: undefined;
  Care: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<PartnerTabParamList> | undefined;
  ChatModal: ChatModalParams;
};

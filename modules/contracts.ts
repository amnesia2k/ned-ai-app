export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorPayload = {
  success: boolean;
  message: string;
  data?: Record<string, unknown> | unknown[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
};

export type MessageSource = {
  subject: string;
  lessonTitle: string;
  sourcePath: string;
  pageNumber?: number;
};

export type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  deliveryState?: "pending" | "failed";
  grounded?: boolean;
  usedGeneralKnowledge?: boolean;
  sources?: MessageSource[];
};

export type ServerAuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ServerCurrentUserResponse = {
  user: AuthUser;
};

export type ServerListChatsResponse = {
  chats: ChatThread[];
};

export type ServerGetChatMessagesResponse = {
  chat: ChatThread;
  messages: ChatMessage[];
};

export type ServerSendMessageResponse = {
  chat: ChatThread;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  answer: {
    answer: string;
    grounded: boolean;
    usedGeneralKnowledge: boolean;
    sources: MessageSource[];
  };
};

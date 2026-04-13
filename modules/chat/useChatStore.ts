import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isApiClientError } from "@/lib/http";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import * as ChatApi from "@/modules/chat/chat.api";
import type {
  ChatMessage,
  ChatThread,
  SendChatMessagePayload,
} from "@/modules/contracts";
import { useSyncStore } from "@/modules/sync/useSyncStore";

const EMPTY_ARRAY: any[] = [];

type PersistedChatStore = Partial<Pick<ChatStore, "activeThreadId">>;

type ChatStore = {
  hydrated: boolean;
  activeThreadId: string | null;
  status: "idle" | "loading" | "sending" | "error";
  errorMessage: string | null;
  threads: ChatThread[];
  draftMessages: ChatMessage[];
  messagesByChatId: Record<string, ChatMessage[]>;
  loadedChatIds: string[];
  contextUsageByChatId: Record<string, number>;
  loadChats: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  selectThread: (threadId: string) => Promise<void>;
  startFreshChat: () => void;
  sendMessage: (payload: SendChatMessagePayload) => Promise<void>;
  clearChatHistory: () => Promise<void>;
  messagesForActiveThread: () => ChatMessage[];
  clearError: () => void;
  reset: () => void;
  markHydrated: () => void;
};

function sortThreads(threads: ChatThread[]) {
  return [...threads].sort(
    (left, right) =>
      new Date(right.lastMessageAt).getTime() -
      new Date(left.lastMessageAt).getTime(),
  );
}

function mergeThread(threads: ChatThread[], chat: ChatThread) {
  const nextThreads = threads.filter((thread) => thread.id !== chat.id);
  return sortThreads([chat, ...nextThreads]);
}

function mergeMessages(
  existingMessages: ChatMessage[],
  nextMessages: ChatMessage[],
) {
  const messagesById = new Map<string, ChatMessage>();

  for (const message of existingMessages) {
    messagesById.set(message.id, message);
  }

  for (const message of nextMessages) {
    messagesById.set(message.id, message);
  }

  return [...messagesById.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function removeMessagesById(messages: ChatMessage[], messageIds: string[]) {
  const ids = new Set(messageIds);
  return messages.filter((message) => !ids.has(message.id));
}

function replaceMessageDeliveryState(
  messages: ChatMessage[],
  messageId: string,
  deliveryState: ChatMessage["deliveryState"],
) {
  return messages.map((message) =>
    message.id === messageId ? { ...message, deliveryState } : message,
  );
}

function createOptimisticMessage({
  id,
  chatId,
  role,
  content,
  createdAt,
}: Pick<ChatMessage, "id" | "chatId" | "role" | "content" | "createdAt">) {
  return {
    id,
    chatId,
    role,
    content,
    createdAt,
    documentId: (content as any).documentId, // dummy check or pass as obj
    deliveryState: "pending" as const,
  };
}

function buildChatErrorMessage(error: unknown) {
  if (isApiClientError(error)) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function requireAccessToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("Missing access token");
  }

  return token;
}

function handleChatError(error: unknown) {
  if (isApiClientError(error) && error.status === 401) {
    useAuthStore.getState().logout();
  }

  return buildChatErrorMessage(error);
}

export const useChatStore = create<ChatStore>()(
  persist<ChatStore, [], [], PersistedChatStore>(
    (set, get) => ({
      hydrated: false,
      activeThreadId: null,
      status: "idle",
      errorMessage: null,
      threads: [],
      draftMessages: [],
      messagesByChatId: {},
      loadedChatIds: [],
      contextUsageByChatId: {},
      loadChats: async () => {
        set({
          status: "loading",
          errorMessage: null,
        });
        useSyncStore.getState().startSync();

        try {
          const token = requireAccessToken();
          const response = await ChatApi.listChats(token);
          const currentActiveThreadId = get().activeThreadId;
          const hasActiveThread = response.chats.some(
            (thread) => thread.id === currentActiveThreadId,
          );
          const nextActiveThreadId =
            currentActiveThreadId && hasActiveThread
              ? currentActiveThreadId
              : currentActiveThreadId === null
                ? null
                : (response.chats[0]?.id ?? null);

          set({
            threads: response.chats,
            activeThreadId: nextActiveThreadId,
            draftMessages: nextActiveThreadId ? [] : get().draftMessages,
            status: "idle",
            errorMessage: null,
          });
          useSyncStore.getState().setChatCount(response.chats.length);
          useSyncStore.getState().markSynced();

          if (
            nextActiveThreadId &&
            !get().loadedChatIds.includes(nextActiveThreadId)
          ) {
            await get().loadChatMessages(nextActiveThreadId);
          }
        } catch (error) {
          const errorMessage = handleChatError(error);

          set({
            status: "error",
            errorMessage,
          });
          useSyncStore.getState().markError(errorMessage);
        }
      },
      loadChatMessages: async (chatId) => {
        set({
          status: "loading",
          errorMessage: null,
          draftMessages: [],
        });
        useSyncStore.getState().startSync();

        try {
          const token = requireAccessToken();
          const response = await ChatApi.getChatMessages(token, chatId);

          set((state) => ({
            activeThreadId: chatId,
            threads: mergeThread(state.threads, response.chat),
            messagesByChatId: {
              ...state.messagesByChatId,
              [chatId]: response.messages,
            },
            loadedChatIds: state.loadedChatIds.includes(chatId)
              ? state.loadedChatIds
              : [...state.loadedChatIds, chatId],
            status: "idle",
            errorMessage: null,
          }));
          useSyncStore.getState().setChatCount(get().threads.length);
          useSyncStore.getState().markSynced();
        } catch (error) {
          const errorMessage = handleChatError(error);

          set({
            status: "error",
            errorMessage,
          });
          useSyncStore.getState().markError(errorMessage);
        }
      },
      selectThread: async (threadId) => {
        set({
          activeThreadId: threadId,
          errorMessage: null,
          draftMessages: [],
        });

        if (!get().loadedChatIds.includes(threadId)) {
          await get().loadChatMessages(threadId);
        }
      },
      startFreshChat: () =>
        set({
          activeThreadId: null,
          draftMessages: [],
          errorMessage: null,
          status: "idle",
        }),
      sendMessage: async (payload) => {
        const trimmed = payload.content.trim();

        if (!trimmed) {
          return;
        }

        const activeThreadId = get().activeThreadId;
        const optimisticChatId = activeThreadId ?? "__draft__";
        const timestamp = Date.now();
        const optimisticUserMessage = createOptimisticMessage({
          id: `temp-user-${timestamp}`,
          chatId: optimisticChatId,
          role: "user",
          content: trimmed,
          createdAt: new Date(timestamp).toISOString(),
        });
        (optimisticUserMessage as any).documentId = payload.documentId;

        const optimisticAssistantMessage = createOptimisticMessage({
          id: `temp-assistant-${timestamp}`,
          chatId: optimisticChatId,
          role: "assistant",
          content: "",
          createdAt: new Date(timestamp + 1).toISOString(),
        });

        set((state) => {
          if (activeThreadId) {
            const existingMessages =
              state.messagesByChatId[activeThreadId] ?? [];

            return {
              status: "sending" as const,
              errorMessage: null,
              messagesByChatId: {
                ...state.messagesByChatId,
                [activeThreadId]: mergeMessages(existingMessages, [
                  optimisticUserMessage,
                  optimisticAssistantMessage,
                ]),
              },
            };
          }

          return {
            status: "sending" as const,
            errorMessage: null,
            draftMessages: mergeMessages(state.draftMessages, [
              optimisticUserMessage,
              optimisticAssistantMessage,
            ]),
          };
        });
        useSyncStore.getState().startSync();

        try {
          const token = requireAccessToken();
          const response = await ChatApi.sendMessage(token, {
            ...(activeThreadId ? { chatId: activeThreadId } : {}),
            content: trimmed,
            ...(payload.documentId ? { documentId: payload.documentId } : {}),
          });

          set((state) => {
            const optimisticMessageIds = [
              optimisticUserMessage.id,
              optimisticAssistantMessage.id,
            ];
            const remainingDraftMessages = removeMessagesById(
              state.draftMessages,
              optimisticMessageIds,
            );
            const existingMessages = activeThreadId
              ? removeMessagesById(
                  state.messagesByChatId[response.chat.id] ??
                    state.messagesByChatId[activeThreadId] ??
                    [],
                  optimisticMessageIds,
                )
              : remainingDraftMessages;

            return {
              activeThreadId: response.chat.id,
              threads: mergeThread(state.threads, response.chat),
              draftMessages: [],
              messagesByChatId: {
                ...state.messagesByChatId,
                [response.chat.id]: mergeMessages(existingMessages, [
                  response.userMessage,
                  response.assistantMessage,
                ]),
              },
              loadedChatIds: state.loadedChatIds.includes(response.chat.id)
                ? state.loadedChatIds
                : [...state.loadedChatIds, response.chat.id],
              contextUsageByChatId: {
                ...state.contextUsageByChatId,
                [response.chat.id]: response.contextUsage ?? 0,
              },
              status: "idle",
              errorMessage: null,
            };
          });
          useSyncStore.getState().setChatCount(get().threads.length);
          useSyncStore.getState().markSynced();
        } catch (error) {
          const errorMessage = handleChatError(error);

          set((state) => {
            if (activeThreadId) {
              const existingMessages =
                state.messagesByChatId[activeThreadId] ?? [];
              const withoutAssistantPlaceholder = removeMessagesById(
                existingMessages,
                [optimisticAssistantMessage.id],
              );

              return {
                status: "error" as const,
                errorMessage,
                messagesByChatId: {
                  ...state.messagesByChatId,
                  [activeThreadId]: replaceMessageDeliveryState(
                    withoutAssistantPlaceholder,
                    optimisticUserMessage.id,
                    "failed",
                  ),
                },
              };
            }

            const withoutAssistantPlaceholder = removeMessagesById(
              state.draftMessages,
              [optimisticAssistantMessage.id],
            );

            return {
              status: "error" as const,
              errorMessage,
              draftMessages: replaceMessageDeliveryState(
                withoutAssistantPlaceholder,
                optimisticUserMessage.id,
                "failed",
              ),
            };
          });
          useSyncStore.getState().markError(errorMessage);
          throw error;
        }
      },
      clearChatHistory: async () => {
        set({
          status: "loading",
          errorMessage: null,
        });
        useSyncStore.getState().startSync();

        try {
          const token = requireAccessToken();
          await ChatApi.clearChatHistory(token);

          set({
            activeThreadId: null,
            threads: [],
            draftMessages: [],
            messagesByChatId: {},
            loadedChatIds: [],
            status: "idle",
            errorMessage: null,
          });
          useSyncStore.getState().setChatCount(0);
          useSyncStore.getState().markSynced();
        } catch (error) {
          const errorMessage = handleChatError(error);

          set({
            status: "error",
            errorMessage,
          });
          useSyncStore.getState().markError(errorMessage);
          throw error;
        }
      },
      messagesForActiveThread: () => {
        const state = get();
        const threadId = state.activeThreadId;

        if (!threadId) {
          return state.draftMessages;
        }

        return state.messagesByChatId[threadId] ?? EMPTY_ARRAY;
      },
      clearError: () => set({ errorMessage: null, status: "idle" }),
      reset: () => {
        set({
          activeThreadId: null,
          status: "idle",
          errorMessage: null,
          threads: [],
          draftMessages: [],
          messagesByChatId: {},
          loadedChatIds: [],
        });
        useSyncStore.getState().reset();
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "nedai-chat-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // We purposefully don't persist activeThreadId to ensure that the app
        // starts with a fresh chat session on every cold start.
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

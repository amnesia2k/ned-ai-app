import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isApiClientError } from "@/lib/http";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import * as ChatApi from "@/modules/chat/chat.api";
import type { ChatMessage, ChatThread } from "@/modules/contracts";
import { useSyncStore } from "@/modules/sync/useSyncStore";

type PersistedChatStore = Pick<ChatStore, "activeThreadId">;

type ChatStore = {
  hydrated: boolean;
  activeThreadId: string | null;
  status: "idle" | "loading" | "sending" | "error";
  errorMessage: string | null;
  threads: ChatThread[];
  messagesByChatId: Record<string, ChatMessage[]>;
  loadedChatIds: string[];
  loadChats: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  selectThread: (threadId: string) => Promise<void>;
  startFreshChat: () => void;
  sendMessage: (content: string) => Promise<void>;
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
      messagesByChatId: {},
      loadedChatIds: [],
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
            hasActiveThread || !response.chats.length
              ? currentActiveThreadId
              : response.chats[0]?.id ?? null;

          set({
            threads: response.chats,
            activeThreadId: nextActiveThreadId,
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
        });

        if (!get().loadedChatIds.includes(threadId)) {
          await get().loadChatMessages(threadId);
        }
      },
      startFreshChat: () =>
        set({
          activeThreadId: null,
          errorMessage: null,
          status: "idle",
        }),
      sendMessage: async (content) => {
        const trimmed = content.trim();

        if (!trimmed) {
          return;
        }

        set({
          status: "sending",
          errorMessage: null,
        });
        useSyncStore.getState().startSync();

        try {
          const token = requireAccessToken();
          const activeThreadId = get().activeThreadId;
          const response = await ChatApi.sendMessage(token, {
            ...(activeThreadId ? { chatId: activeThreadId } : {}),
            content: trimmed,
          });

          set((state) => {
            const existingMessages =
              state.messagesByChatId[response.chat.id] ?? [];

            return {
              activeThreadId: response.chat.id,
              threads: mergeThread(state.threads, response.chat),
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
              status: "idle",
              errorMessage: null,
            };
          });
          useSyncStore.getState().setChatCount(get().threads.length);
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
        const threadId = get().activeThreadId;

        if (!threadId) {
          return [];
        }

        return get().messagesByChatId[threadId] ?? [];
      },
      clearError: () => set({ errorMessage: null, status: "idle" }),
      reset: () => {
        set({
          activeThreadId: null,
          status: "idle",
          errorMessage: null,
          threads: [],
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
        activeThreadId: state.activeThreadId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

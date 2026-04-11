import { request } from "@/lib/http";
import type {
  SendChatMessagePayload,
  ServerGetChatMessagesResponse,
  ServerListChatsResponse,
  ServerSendMessageResponse,
} from "@/modules/contracts";

export function listChats(token: string) {
  return request<ServerListChatsResponse>("/chats", {
    token,
  });
}

export function getChatMessages(token: string, chatId: string) {
  return request<ServerGetChatMessagesResponse>(`/chats/${chatId}/messages`, {
    token,
  });
}

export function sendMessage(token: string, payload: SendChatMessagePayload) {
  return request<ServerSendMessageResponse>("/chats/messages", {
    method: "POST",
    token,
    body: payload,
  });
}

export function clearChatHistory(token: string) {
  return request<Record<string, never>>("/chats", {
    method: "DELETE",
    token,
  });
}

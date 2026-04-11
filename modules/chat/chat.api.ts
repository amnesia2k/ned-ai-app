import { request } from "@/lib/http";
import type {
  ServerGetChatMessagesResponse,
  ServerListChatsResponse,
  ServerSendMessageResponse,
} from "@/modules/contracts";

type SendMessagePayload = {
  chatId?: string;
  content: string;
};

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

export function sendMessage(token: string, payload: SendMessagePayload) {
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

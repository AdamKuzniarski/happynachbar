import { apiFetch } from "./client";

export type ConversationListItem = {
  id: string;
  participantId: string;
  participantDisplayName: string;
  participantAvatarUrl: string | null;
  activityId: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export async function listConversations() {
  return apiFetch<{ items: ConversationListItem[] }>("/chat/conversations");
}

export async function listMessages(conversationId: string) {
  return apiFetch<{ items: Message[]; nextCursor: string | null }>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
}

export async function markConversationRead(conversationId: string) {
  return apiFetch(`/chat/conversations/${encodeURIComponent(conversationId)}/read`, {
    method: "POST",
  });
}

export async function getUnreadCount() {
  return apiFetch<{ count: number }>(`/chat/unread-count`);
}

export async function deleteConversation(conversationId: string) {
  return apiFetch(`/chat/conversations/${encodeURIComponent(conversationId)}`, {
    method: "DELETE",
  });
}

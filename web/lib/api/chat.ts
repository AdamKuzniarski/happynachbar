import { apiFetch } from "./client";

export type ConversationListItem = {
  id: string;
  participantId: string;
  participantDisplayName: string;
  participantAvatarUrl: string | null;
  activityId: string | null;
  activityTitle: string | null;
  hasUnread: boolean;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
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

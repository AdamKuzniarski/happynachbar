"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { getUnreadCount, listConversations } from "@/lib/api/chat";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ChatUnreadBadge() {
  const [hasUnread, setHasUnread] = React.useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const joinedRef = React.useRef<Set<string>>(new Set());

  async function refreshUnread() {
    try {
      const res = await getUnreadCount();
      setHasUnread((res?.count ?? 0) > 0);
    } catch {
      setHasUnread(false);
    }
  }

  async function joinConversations(socket: Socket) {
    const res = await listConversations();
    const items = res?.items ?? [];
    items.forEach((c) => {
      if (joinedRef.current.has(c.id)) return;
      joinedRef.current.add(c.id);
      socket.emit("chat:join", { conversationId: c.id });
    });
  }

  React.useEffect(() => {
    let alive = true;
    refreshUnread();

    const socket = io(`${API_BASE_URL}/chat`, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      joinConversations(socket).catch(() => {});
    });

    socket.on("message:new", () => {
      refreshUnread();
    });

    const interval = window.setInterval(() => {
      if (!alive) return;
      refreshUnread();
    }, 20000);

    return () => {
      alive = false;
      window.clearInterval(interval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  if (!hasUnread) return null;

  return (
    <span
      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-fern"
      aria-label="Neue Nachrichten"
    />
  );
}

"use client";

import Link from "next/link";
import * as React from "react";
import { io, type Socket } from "socket.io-client";
import {
  listConversations,
  type Message,
} from "@/lib/api/chat";
import { FormError } from "@/components/ui/FormError";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ChatInbox() {
  type ConversationList = NonNullable<
    Awaited<ReturnType<typeof listConversations>>
  >;
  type ConversationListItem = ConversationList["items"][number];

  const [items, setItems] = React.useState<ConversationListItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [socketConnected, setSocketConnected] = React.useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const joinedRef = React.useRef<Set<string>>(new Set());

  type SocketMessage = Message;

  const refreshConversations = React.useCallback(
    async ({ silent }: { silent?: boolean } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await listConversations();
        const nextItems = res?.items ?? [];
        setItems(nextItems);
        setError(null);
        const socket = socketRef.current;
        if (socket) {
          nextItems.forEach((c) => {
            if (joinedRef.current.has(c.id)) return;
            joinedRef.current.add(c.id);
            socket.emit("chat:join", { conversationId: c.id });
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    refreshConversations().catch(() => {});
  }, [refreshConversations]);

  React.useEffect(() => {
    let alive = true;
    fetch(`${API_BASE_URL}/users/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive) return;
        const id = typeof data?.id === "string" ? data.id : null;
        setCurrentUserId(id);
      })
      .catch(() => {
        if (!alive) return;
        setCurrentUserId(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    const socket = io(`${API_BASE_URL}/chat`, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      refreshConversations({ silent: true }).catch(() => {});
    });
    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("message:new", (msg: SocketMessage) => {
      if (msg.senderId && currentUserId && msg.senderId === currentUserId) {
        return;
      }
      setItems((prev) => {
        const idx = prev.findIndex((item) => item.id === msg.conversationId);
        if (idx === -1) {
          refreshConversations({ silent: true }).catch(() => {});
          return prev;
        }
        const next = [...prev];
        next[idx] = { ...next[idx], hasUnread: true };
        return next;
      });
    });

    function handleMessageUpdate() {
      refreshConversations({ silent: true }).catch(() => {});
    }

    socket.on("message:updated", handleMessageUpdate);
    socket.on("message:deleted", handleMessageUpdate);

    function handleRead() {
      refreshConversations({ silent: true }).catch(() => {});
    }

    function handleUnread() {
      refreshConversations({ silent: true }).catch(() => {});
    }

    window.addEventListener("chat:read", handleRead);
    window.addEventListener("chat:unread", handleUnread);

    return () => {
      window.removeEventListener("chat:read", handleRead);
      window.removeEventListener("chat:unread", handleUnread);
      socket.off("message:updated", handleMessageUpdate);
      socket.off("message:deleted", handleMessageUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, refreshConversations]);

  React.useEffect(() => {
    if (!socketConnected) return;
    const socket = socketRef.current;
    if (!socket) return;
    items.forEach((c) => {
      if (joinedRef.current.has(c.id)) return;
      joinedRef.current.add(c.id);
      socket.emit("chat:join", { conversationId: c.id });
    });
  }, [items, socketConnected]);

  if (loading) {
    return <p className="mt-4 text-sm opacity-70">Lädt…</p>;
  }

  return (
    <div className="mt-4">
      <FormError message={error} />
      {items.length === 0 ? (
        <p className="text-sm opacity-70">Noch keine Chats.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${encodeURIComponent(c.id)}`}
                className={`block rounded-xl border-2 px-4 py-3 ${
                  c.hasUnread
                    ? "border-fern bg-limecream text-evergreen hover:bg-limecream/80 dark:hover:bg-limecream/90 hover:text-evergreen"
                    : "border-fern bg-surface hover:bg-surface-strong"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-fern/10 flex items-center justify-center text-sm font-semibold">
                    {c.participantDisplayName?.trim()?.[0] ?? "N"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {c.participantDisplayName || "Neighbor"}
                      {c.activityTitle ? (
                        <span className="text-xs font-normal opacity-70">
                          {" "}
                          · zur Aktivität: {c.activityTitle}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

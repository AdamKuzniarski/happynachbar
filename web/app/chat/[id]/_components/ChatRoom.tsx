"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";
import {
  listConversations,
  listMessages,
  markConversationRead,
  type Message,
} from "@/lib/api/chat";
import { FormError } from "@/components/ui/FormError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type SocketMessage = Message;

export function ChatRoom({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [text, setText] = React.useState("");
  const [participantName, setParticipantName] = React.useState<string | null>(
    null,
  );
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const socketRef = React.useRef<Socket | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    listMessages(conversationId)
      .then((res) => {
        if (!alive) return;
        const items = res?.items ?? [];
        setMessages(items.slice().reverse());
        setError(null);
        markConversationRead(conversationId).catch(() => {});
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [conversationId]);

  React.useEffect(() => {
    let alive = true;
    listConversations()
      .then((res) => {
        if (!alive) return;
        const item = res?.items?.find((c) => c.id === conversationId);
        setParticipantName(item?.participantDisplayName ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setParticipantName(null);
      });

    return () => {
      alive = false;
    };
  }, [conversationId]);

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
    const socket = io(`${API_BASE_URL}/chat`, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join", { conversationId });
    });

    socket.on("message:new", (msg: SocketMessage) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
      markConversationRead(conversationId).catch(() => {});
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    socketRef.current?.emit("message:send", {
      conversationId,
      body,
    });
    setText("");
  }

  return (
    <section className="rounded-2xl bg-surface/60 p-4 shadow-sm ring-1 ring-fern/25">
      <h1 className="text-lg font-semibold">
        Chat Nachricht an{" "}
        {participantName?.trim() ? participantName : "Ersteller"}
      </h1>
      <FormError message={error} />

      {loading ? (
        <p className="mt-4 text-sm opacity-70">Lädt…</p>
      ) : (
        <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm opacity-70">Noch keine Nachrichten.</p>
          ) : (
            messages.map((m) => {
              const isMine = !!currentUserId && m.senderId === currentUserId;
              const authorLabel = isMine
                ? "Du"
                : participantName?.trim() || "Ersteller";
              return (
                <div
                  key={m.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    isMine
                      ? "bg-fern/15 text-foreground ml-auto"
                      : "bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-80">
                    <span>{authorLabel}</span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 break-words">{m.body}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nachricht…"
        />
        <Button type="submit">Senden</Button>
      </form>
    </section>
  );
}

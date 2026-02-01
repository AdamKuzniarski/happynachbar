"use client";

import Link from "next/link";
import * as React from "react";
import { deleteConversation, listConversations } from "@/lib/api/chat";
import { FormError } from "@/components/ui/FormError";
import { Button } from "@/components/ui/Button";

export function ChatInbox() {
  type ConversationList = NonNullable<
    Awaited<ReturnType<typeof listConversations>>
  >;
  type ConversationListItem = ConversationList["items"][number];

  const [items, setItems] = React.useState<ConversationListItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    listConversations()
      .then((res) => {
        if (!alive) return;
        setItems(res?.items ?? []);
        setError(null);
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
  }, []);

  if (loading) {
    return <p className="mt-4 text-sm opacity-70">Lädt…</p>;
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diesen Chat wirklich löschen?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteConversation(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setDeletingId((current) => (current === id ? null : current));
    }
  };

  return (
    <div className="mt-4">
      <FormError message={error} />
      {items.length === 0 ? (
        <p className="text-sm opacity-70">Noch keine Chats.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id}>
              <div className="flex items-stretch gap-2">
                <Link
                  href={`/chat/${encodeURIComponent(c.id)}`}
                  className="flex-1 rounded-xl border-2 border-fern bg-surface px-4 py-3 hover:bg-surface-strong"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-fern/10 flex items-center justify-center text-sm font-semibold">
                      {c.participantDisplayName?.trim()?.[0] ?? "N"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">
                        {c.participantDisplayName || "Neighbor"}
                      </div>
                      <div className="truncate text-xs opacity-70">
                        {c.lastMessageBody ?? "Noch keine Nachrichten"}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3"
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  aria-label="Chat löschen"
                >
                  {deletingId === c.id ? "…" : "Löschen"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

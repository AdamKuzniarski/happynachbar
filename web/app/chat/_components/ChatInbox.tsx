"use client";

import Link from "next/link";
import * as React from "react";
import { listConversations } from "@/lib/api/chat";
import { FormError } from "@/components/ui/FormError";

export function ChatInbox() {
  const [items, setItems] = React.useState<
    Awaited<ReturnType<typeof listConversations>>["items"]
  >([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

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
                className="block rounded-xl border-2 border-fern bg-surface px-4 py-3 hover:bg-surface-strong"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

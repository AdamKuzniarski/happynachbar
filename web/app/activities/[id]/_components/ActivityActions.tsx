"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { deleteActivity } from "@/lib/api/activities";

export function ActivityActions({
  id,
  createdById,
  currentUserId,
}: {
  id: string;
  createdById?: string;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const canManage =
    !createdById || !currentUserId ? true : createdById === currentUserId;

  function onEdit() {
    if (deleting) return;
    if (createdById && currentUserId && createdById !== currentUserId) {
      setError(
        "Du kannst nur Aktivitäten bearbeiten/löschen, die du auch erstellt hast",
      );
      return;
    }
    setError(null);
    router.push(`/activities/${encodeURIComponent(id)}/edit`);
  }

  async function onDelete() {
    if (deleting) return;
    if (createdById && currentUserId && createdById !== currentUserId) {
      setError(
        "Du kannst nur Aktivitäten bearbeiten/löschen, die du auch erstellt hast",
      );
      return;
    }
    setError(null);
    const ok = window.confirm("Aktivitaet wirklich löschen?");
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await deleteActivity(id);
      if (!res.ok) {
        const msg = Array.isArray(res.message)
          ? res.message.join(", ")
          : res.message ?? "Löschen fehlgeschlagen.";
        setError(msg);
        return;
      }
      router.push("/homepage");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {canManage ? (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="hover:bg-fern/20 hover:text-foreground"
            onClick={onEdit}
            disabled={deleting}
          >
            Bearbeiten
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="hover:bg-fern/20 hover:text-foreground"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Löschen…" : "Löschen"}
          </Button>
        </div>
      ) : null}
      <FormError message={error} />
    </div>
  );
}

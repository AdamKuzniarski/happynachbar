"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { deleteActivity } from "@/lib/api/activities";

export function ActivityActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);

  function onEdit() {
    router.push(`/activities/${encodeURIComponent(id)}/edit`);
  }

  async function onDelete() {
    if (deleting) return;
    const ok = window.confirm("Aktivitaet wirklich löschen?");
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await deleteActivity(id);
      if (!res.ok) {
        const msg = Array.isArray(res.message)
          ? res.message.join(", ")
          : res.message ?? "Löschen fehlgeschlagen.";
        alert(msg);
        return;
      }
      router.push("/homepage");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 flex gap-2">
      <Button
        type="button"
        variant="secondary"
        className="hover:bg-blue-600 hover:text-white"
        onClick={onEdit}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="hover:bg-red-600 hover:text-white"
        onClick={onDelete}
        disabled={deleting}
      >
        {deleting ? "Loeschen…" : "Delete"}
      </Button>
    </div>
  );
}

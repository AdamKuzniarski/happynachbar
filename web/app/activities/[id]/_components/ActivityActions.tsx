"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { deleteActivity } from "@/lib/api/activities";
import { notifySuccess } from "@/lib/toast";

export function ActivityActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function onEdit() {
    if (deleting) return;
    router.push(`/activities/${encodeURIComponent(id)}/edit`);
  }

  async function onDelete() {
    if (deleting) return;
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
      notifySuccess("Aktivität gelöscht.");
      router.push("/homepage");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="hover:bg-blue-600 hover:text-white"
          onClick={onEdit}
          disabled={deleting}
        >
          Bearbeiten
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="hover:bg-red-600 hover:text-white"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? "Löschen…" : "Löschen"}
        </Button>
      </div>
      <FormError message={error} />
    </div>
  );
}

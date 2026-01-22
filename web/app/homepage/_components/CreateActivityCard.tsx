"use client";

import { Button } from "@/components/ui/Button";

export function CreateActivityCard({
  creating,
  onCreate,
}: {
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onCreate}
      disabled={creating}
      variant="secondary"
      className="min-h-[96px] w-full rounded-md border-0 bg-surface p-3 shadow-sm hover:shadow-md hover:bg-surface-strong transition-all no-underline"
      aria-label="Neue Aktivität erstellen"
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-4xl font-bold leading-none text-foreground">
          {creating ? "…" : "+"}
        </div>
        <div className="mt-1 text-xs font-medium text-foreground">Neu</div>
      </div>
    </Button>
  );
}

"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { startChatWithActivity } from "./actions";
import { FormError } from "@/components/ui/FormError";
import { Mail } from "lucide-react";

function SubmitButton({ variant }: { variant: "button" | "icon" }) {
  const { pending } = useFormStatus();
  if (variant === "icon") {
    return (
      <button
        type="submit"
        disabled={pending}
        aria-label="Kontaktieren"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-fern/50 text-foreground/80 hover:bg-fern/10 hover:text-foreground"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md border-2 border-fern bg-surface px-4 py-1.5 text-sm font-semibold text-foreground"
    >
      {pending ? "…" : "Kontaktieren"}
    </button>
  );
}

export function StartChatButton({
  activityId,
  variant = "button",
}: {
  activityId: string;
  variant?: "button" | "icon";
}) {
  const [state, action] = React.useActionState(startChatWithActivity, null);

  return (
    <form action={action} className="flex flex-col items-center gap-2">
      <input type="hidden" name="activityId" value={activityId} />
      <SubmitButton variant={variant} />
      {variant === "icon" ? null : <FormError message={state?.error ?? null} />}
    </form>
  );
}

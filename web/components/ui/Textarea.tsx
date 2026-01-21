import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"textarea">) {
  const base =
    "w-full rounded-md border-2 border-fern bg-white px-3 py-2 text-sm outline-none focus:ring-palm/40 min-h-25";

  return <textarea className={cn(base, className)} {...props} />;
}

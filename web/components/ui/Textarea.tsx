import * as React from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"label">) {
  return (
    <label className={cn("block text-sm font-medium", className)} {...props} />
  );
}

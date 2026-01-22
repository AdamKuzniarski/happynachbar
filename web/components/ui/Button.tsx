import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary: "bg-palm text-white hover:bg-hunter",
    secondary: "border-2 border-fern bg-surface text-foreground",
    ghost: "text-foreground underline hover:opacity-80",
  };
  return <button className={cn(base, styles[variant], className)} {...props} />;
}

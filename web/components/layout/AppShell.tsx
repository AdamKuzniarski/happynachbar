import * as React from "react";
import { AppHeader, type HeaderVariant } from "./AppHeader";

export function AppShell({
  variant,
  children,
}: {
  variant: HeaderVariant;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-evergreen">
      <AppHeader variant={variant} />
      {children}
    </div>
  );
}

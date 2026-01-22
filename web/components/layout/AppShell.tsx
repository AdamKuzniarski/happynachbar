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
    <>
      <AppHeader variant={variant} />
      {children}
    </>
  );
}

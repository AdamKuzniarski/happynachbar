import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell variant="app">{children}</AppShell>;
}

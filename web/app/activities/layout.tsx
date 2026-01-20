import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function ActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell variant="auth">{children}</AppShell>;
}

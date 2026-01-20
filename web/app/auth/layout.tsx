import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell variant="logout">{children}</AppShell>;
}

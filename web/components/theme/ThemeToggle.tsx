"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

const options = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-foreground">
      <span className="hidden sm:inline">Theme</span>
      <select
        className="h-9 rounded-md border-2 border-fern bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-palm/40"
        value={theme}
        onChange={(event) =>
          setTheme(event.target.value as "system" | "light" | "dark")
        }
        aria-label="Theme"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

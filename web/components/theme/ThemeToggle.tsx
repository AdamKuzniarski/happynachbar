"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const options = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target || !menuRef.current) return;
      if (!menuRef.current.contains(target)) setOpen(false);
    }

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("pointerdown", onPointerDown);
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (!mounted) return null;

  const current = options.find((option) => option.value === theme) ?? options[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-fern bg-surface text-foreground transition-colors hover:bg-fern/20 sm:h-10 sm:w-10"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Theme auswählen"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CurrentIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border-2 border-fern bg-surface p-2 shadow-sm">
          <div className="flex gap-2">
            {options.map((option) => {
              const Icon = option.icon;
              const active = option.value === theme;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    active
                      ? "border-fern bg-fern/25 text-foreground"
                      : "border-fern/50 text-foreground/70 hover:bg-fern/15 hover:text-foreground"
                  }`}
                  onClick={() => {
                    setTheme(option.value);
                    setOpen(false);
                  }}
                  aria-label={option.label}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-center text-[11px] opacity-70">
            {current.label}
          </div>
        </div>
      ) : null}
    </div>
  );
}

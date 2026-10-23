"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Device", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const CurrentIcon = !mounted
    ? Monitor
    : theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change theme"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-stone-600 transition hover:border-brand/30 hover:text-ink"
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-xl shadow-black/10"
        >
          {options.map((option) => {
            const active = mounted && theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-stone-600 hover:bg-ink/5 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{option.label}</span>
                {active ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

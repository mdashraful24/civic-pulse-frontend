"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

const controlClasses =
  "w-full rounded-xl border border-line bg-surface text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500 sm:text-sm";

export type SelectOption<T extends string> = {
  value: T | "";
  label: string;
};

export function CustomSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  ariaLabel,
}: {
  label?: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
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

  const current = options.find((o) => o.value === value);
  const display = current ? current.label : (placeholder ?? "Select");

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        className={cn(
          controlClasses,
          "flex h-11 items-center justify-between gap-2 px-3.5 pr-9 text-left",
          disabled && "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            !current && !placeholder && !value ? "text-stone-400" : "",
          )}
        >
          {display}
        </span>
      </button>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 origin-top overflow-auto rounded-xl border border-line bg-surface p-1 shadow-xl shadow-black/10 transition data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {placeholder !== undefined ? (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => {
                onChange("" as T);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition",
                value === ""
                  ? "bg-brand-soft text-brand"
                  : "text-stone-600 hover:bg-ink/5 hover:text-ink",
              )}
            >
              <span className="flex-1">{placeholder}</span>
              {value === "" ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
          ) : null}
          {options.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-stone-600 hover:bg-ink/5 hover:text-ink",
                )}
              >
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

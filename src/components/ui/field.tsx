import { ChevronDown } from "lucide-react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/format";

const controlClasses =
  "w-full rounded-xl border border-line bg-surface text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500 sm:text-sm";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold text-ink/80"
        >
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
        {hint ? (
          <span className="text-[11px] text-stone-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-[12px] font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(controlClasses, "h-11 px-3.5", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(controlClasses, "min-h-32 resize-y px-3.5 py-3", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlClasses,
          "h-11 appearance-none px-3.5 pr-9",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
    </div>
  );
}

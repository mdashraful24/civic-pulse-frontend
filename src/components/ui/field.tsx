"use client";

import { ChevronDown } from "lucide-react";
import {
  createContext,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useContext,
  useId,
} from "react";
import { cn } from "@/lib/format";

const controlClasses =
  "w-full rounded-xl border border-line bg-surface text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500 sm:text-sm";

type FieldContextValue = {
  id: string;
  label: string;
  describedBy?: string;
  invalid?: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldControl = () => useContext(FieldContext);

export const mergeAriaDescribedBy = (
  ...values: Array<string | undefined>
): string | undefined => values.filter(Boolean).join(" ") || undefined;

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
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const describedBy = mergeAriaDescribedBy(
    hint ? hintId : undefined,
    error ? errorId : undefined,
  );

  return (
    <FieldContext.Provider
      value={{
        id: controlId,
        label,
        describedBy,
        invalid: Boolean(error),
      }}
    >
      <div className={cn("space-y-1.5", className)}>
        {label ? (
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={controlId}
              className="text-[13px] font-semibold text-ink/80"
            >
              {label}
              {required ? (
                <span className="ml-0.5 text-rose-500">*</span>
              ) : null}
            </label>
            {hint ? (
              <span id={hintId} className="text-[11px] text-stone-400">
                {hint}
              </span>
            ) : null}
          </div>
        ) : null}
        {children}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-[12px] font-medium text-rose-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export function Input({
  className,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldControl();

  return (
    <input
      {...props}
      className={cn(controlClasses, "h-11 px-3.5", className)}
      id={id ?? field?.id}
      aria-describedby={mergeAriaDescribedBy(
        ariaDescribedBy,
        field?.describedBy,
      )}
      aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
    />
  );
}

export function Textarea({
  className,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldControl();

  return (
    <textarea
      {...props}
      className={cn(controlClasses, "min-h-32 resize-y px-3.5 py-3", className)}
      id={id ?? field?.id}
      aria-describedby={mergeAriaDescribedBy(
        ariaDescribedBy,
        field?.describedBy,
      )}
      aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
    />
  );
}

export function Select({
  className,
  id,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const field = useFieldControl();

  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          controlClasses,
          "h-11 appearance-none px-3.5 pr-9",
          className,
        )}
        id={id ?? field?.id}
        aria-describedby={mergeAriaDescribedBy(
          ariaDescribedBy,
          field?.describedBy,
        )}
        aria-invalid={ariaInvalid ?? (field?.invalid ? true : undefined)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
    </div>
  );
}

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/format";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "soft";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-solid text-white shadow-sm shadow-brand/20 hover:bg-brand-solid-hover active:translate-y-px",
  secondary:
    "bg-accent text-accent-ink shadow-sm shadow-accent/20 hover:bg-accent-strong active:translate-y-px",
  outline:
    "border border-line bg-surface text-ink shadow-sm hover:border-brand/30 hover:bg-brand-soft/60",
  ghost: "text-ink hover:bg-ink/5",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 active:translate-y-px",
  soft: "bg-brand-soft text-brand hover:bg-brand/15",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-lg px-3 text-[13px]",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-12 rounded-xl px-6 text-[15px]",
  icon: "h-10 w-10 rounded-xl",
};

export const buttonStyles = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

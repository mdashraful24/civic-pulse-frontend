"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { getApiErrorMessage } from "@/lib/api";
import type { Role } from "@/lib/types";
import { loginSchema } from "@/lib/validation";

type Errors = { email?: string; password?: string };

const quickLogins = [
  {
    role: "CITIZEN" as Role,
    label: "Citizen",
    icon: UserRound,
    email: process.env.NEXT_PUBLIC_QUICK_LOGIN_CITIZEN_EMAIL,
    password: process.env.NEXT_PUBLIC_QUICK_LOGIN_CITIZEN_PASSWORD,
  },
  {
    role: "PERSONNEL" as Role,
    label: "Personnel",
    icon: Wrench,
    email: process.env.NEXT_PUBLIC_QUICK_LOGIN_PERSONNEL_EMAIL,
    password: process.env.NEXT_PUBLIC_QUICK_LOGIN_PERSONNEL_PASSWORD,
  },
  {
    role: "ADMIN" as Role,
    label: "Admin",
    icon: ShieldCheck,
    email: process.env.NEXT_PUBLIC_QUICK_LOGIN_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_QUICK_LOGIN_ADMIN_PASSWORD,
  },
].filter((item) => item.email && item.password);

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setErrors({});
    setFormError("");
  }, []);

  const submit = async (
    credentials: { email: string; password: string },
    key: string,
  ) => {
    setErrors({});
    setFormError("");

    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setPending(key);

    try {
      const nextUser = await login(parsed.data.email, parsed.data.password);
      toast.success(`Welcome back, ${nextUser.name.split(" ")[0]}.`);
      router.push("/dashboard");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setPending(null);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to report an issue, track progress or manage your field work."
      footer={
        <p className="text-center text-sm">
          New to CivicPulse?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form
        className="grid gap-4"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          void submit({ email, password }, "form");
        }}
      >
        <FormField
          label="Email address"
          htmlFor="email"
          error={errors.email}
          required
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            maxLength={254}
            disabled={pending !== null}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password}
          required
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="pr-11"
              maxLength={128}
              disabled={pending !== null}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-ink disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={pending !== null}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        {formError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {formError}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          loading={pending === "form"}
          disabled={pending !== null}
          className="mt-1 w-full"
        >
          {pending === "form" ? "Signing in…" : "Sign in"}
          {pending === "form" ? null : <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      {quickLogins.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Quick logins
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            {quickLogins.map((item) => (
              <Button
                key={item.role}
                variant="outline"
                size="sm"
                loading={pending === item.role}
                disabled={pending !== null}
                onClick={() =>
                  void submit(
                    {
                      email: item.email as string,
                      password: item.password as string,
                    },
                    item.role,
                  )
                }
                className="flex items-center gap-1.5 cursor-pointer"
              >
                {pending === item.role ? null : (
                  <item.icon className="h-4 w-4 text-brand" />
                )}
                {pending === item.role ? "Signing in…" : item.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {/* <div className="mt-6 rounded-xl bg-stone-100/70 px-3.5 py-3">
        <p className="text-[11px] leading-5 text-stone-500">
          Credentials are sent over a secure cookie session. CivicPulse does not
          use social login.
        </p>
      </div> */}

      {/* <Link
        href="/issues"
        className={buttonStyles({
          variant: "ghost",
          size: "sm",
          className: "mt-5 w-full",
        })}
      >
        Just browsing? Explore public issues
      </Link> */}
    </AuthShell>
  );
}

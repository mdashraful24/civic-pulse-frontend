"use client";

import { ArrowRight, KeyRound, MailCheck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { resendOtpSchema, verifyEmailSchema } from "@/lib/validation";

const formatCountdown = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [authLoading, user, router]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("civicpulse:pending-email");
    if (savedEmail) setEmail(savedEmail);

    const expiry = sessionStorage.getItem("civicpulse:pending-expiry");
    if (expiry) setExpiresAt(new Date(expiry).getTime());
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(null);
      return;
    }
    const update = () =>
      setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = verifyEmailSchema.safeParse({ email, otp });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      await api.auth.verifyEmail(parsed.data);
      sessionStorage.removeItem("civicpulse:pending-email");
      sessionStorage.removeItem("civicpulse:pending-expiry");
      toast.success("Email verified. You can sign in now.");
      router.push("/login");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setErrors({});
    setFormError("");

    const parsed = resendOtpSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.flatten().fieldErrors.email?.[0] });
      return;
    }

    setResending(true);
    try {
      const response = await api.auth.resendOtp(parsed.data.email);
      if (response.data?.expiresAt) {
        sessionStorage.setItem(
          "civicpulse:pending-expiry",
          response.data.expiresAt,
        );
        setExpiresAt(new Date(response.data.expiresAt).getTime());
      }
      toast.success("A new verification code has been sent.");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Check your email."
      description="Enter the 6-digit code we sent to your inbox to finish creating your account."
      footer={
        <p className="text-center text-sm text-stone-500">
          Wrong email?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            Start again
          </Link>
        </p>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-soft/60 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand">
          <MailCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">
            Code sent to {email || "your email"}
          </p>
          <p className="mt-0.5 text-[11px] text-stone-500">
            {secondsLeft === null
              ? "The code expires in a few minutes."
              : secondsLeft > 0
                ? `Code expires in ${formatCountdown(secondsLeft)}.`
                : "This code has expired. Request a new one."}
          </p>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={submit}>
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
            disabled={loading || resending}
          />
        </FormField>

        <FormField
          label="Verification code"
          htmlFor="otp"
          error={errors.otp}
          hint="6 digits"
          required
        >
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="pl-10 text-center font-mono text-lg tracking-[0.4em]"
              disabled={loading || resending}
            />
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
          loading={loading}
          disabled={loading || resending}
          className="mt-1 w-full"
        >
          {loading ? "Verifying…" : "Verify email"}
          {loading ? null : <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          loading={resending}
          disabled={loading || resending}
          onClick={() => void resend()}
        >
          {resending ? null : <RefreshCw className="h-3.5 w-3.5" />}
          {resending ? "Resending…" : "Resend code"}
        </Button>
        <p className="text-[11px] text-stone-400">
          In development, the code is printed in the API console.
        </p>
      </div>
    </AuthShell>
  );
}

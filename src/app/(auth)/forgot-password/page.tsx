"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation";

type Errors = { email?: string };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.flatten().fieldErrors.email?.[0] });
      return;
    }

    setPending(true);

    try {
      const result = await api.auth.forgotPassword(parsed.data.email);
      window.sessionStorage.setItem(
        "civicpulse-reset-email",
        parsed.data.email,
      );
      setExpiresIn(result.data?.expiresIn ?? 300);
      toast.success("Reset instructions processed.");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password."
      description="Enter your email and we will send a six-digit reset code if an active account exists."
      footer={
        <p className="text-center text-sm">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {expiresIn !== null ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Check your inbox.</p>
                <p className="mt-1 leading-6">
                  If an active CivicPulse account uses that email, a reset code
                  has been sent. The code expires in {expiresIn} seconds.
                </p>
              </div>
            </div>
          </div>
          <Link href="/reset-password">
            <Button size="lg" className="w-full">
              Enter reset code
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
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
              disabled={pending}
            />
          </FormField>

          {formError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            loading={pending}
            disabled={pending}
            className="mt-1 w-full"
          >
            {pending ? "Sending code…" : "Send reset code"}
            {pending ? null : <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

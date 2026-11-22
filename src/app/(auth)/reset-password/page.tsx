"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation";

type Errors = {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const savedEmail = window.sessionStorage.getItem("civicpulse-reset-email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    const parsed = resetPasswordSchema.safeParse({
      email,
      otp,
      newPassword,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0],
        newPassword: fieldErrors.newPassword?.[0],
      });
      return;
    }

    setPending(true);

    try {
      await api.auth.resetPassword(parsed.data);
      window.sessionStorage.removeItem("civicpulse-reset-email");
      toast.success("Password reset. You can now sign in.");
      router.push("/login");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password."
      description="Enter the six-digit code from your email and set a new password."
      footer={
        <p className="text-center text-sm">
          Need a new code?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-brand hover:text-brand-dark"
          >
            Request another reset
          </Link>
        </p>
      }
    >
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

        <FormField label="Reset code" htmlFor="otp" error={errors.otp} required>
          <Input
            id="otp"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            maxLength={6}
            disabled={pending}
          />
        </FormField>

        <FormField
          label="New password"
          htmlFor="new-password"
          error={errors.newPassword}
          required
        >
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="pr-11"
              maxLength={128}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-ink disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={pending}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="confirm-password"
          error={errors.confirmPassword}
          required
        >
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your new password"
            maxLength={128}
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
          {pending ? "Resetting password…" : "Reset password"}
          {pending ? null : <KeyRound className="h-4 w-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}

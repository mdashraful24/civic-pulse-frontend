"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export function GoogleComplete() {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const status = params.get("status");
  const reason = params.get("reason");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "error") {
      setError(
        reason === "unavailable"
          ? "Google sign-in is temporarily unavailable. Please try again later."
          : "Google sign-in could not be completed. Please try again.",
      );
      return;
    }

    if (status !== "success") {
      setError("Google sign-in did not return a valid response.");
      return;
    }

    let active = true;

    const complete = async () => {
      try {
        const response = await api.auth.me();
        if (!response.data) throw new Error("Session was not established.");
        if (!active) return;
        queryClient.clear();
        setUser(response.data);
        router.replace("/dashboard");
      } catch {
        if (active)
          setError("Google sign-in could not be completed. Please try again.");
      }
    };

    void complete();

    return () => {
      active = false;
    };
  }, [status, reason, queryClient, router, setUser]);

  return (
    <AuthShell
      title={error ? "Google sign-in failed." : "Finishing sign-in…"}
      description={
        error
          ? "We could not complete your Google sign-in."
          : "Please wait while we prepare your CivicPulse session."
      }
      footer={
        error ? (
          <p className="text-center text-sm">
            <Link
              href="/login"
              className="font-semibold text-brand hover:text-brand-dark"
            >
              Back to sign in
            </Link>
          </p>
        ) : null
      }
    >
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your account…
        </div>
      )}
    </AuthShell>
  );
}

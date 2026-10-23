"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { buttonStyles } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/feedback";
import type { Role } from "@/lib/types";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper">
        <PageLoader label="Checking your session" />
      </div>
    );
  }

  if (!user) return null;

  return children;
}

export function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  if (!allow.includes(user.role)) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
          This page is for a different role.
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
          Your account is signed in as {user.role.toLowerCase()}. Head back to
          your dashboard to continue.
        </p>
        <Link href="/dashboard" className={buttonStyles({ className: "mt-6" })}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  return children;
}

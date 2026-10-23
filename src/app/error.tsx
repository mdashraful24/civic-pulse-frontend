"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonStyles } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Logo className="mb-10" />

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200">
        <AlertTriangle className="h-8 w-8" />
      </span>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">
        Something went wrong
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        We hit an unexpected bump.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
        Try the page again. If it keeps happening, the API may be temporarily
        unavailable.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Link
          href="/"
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </main>
  );
}

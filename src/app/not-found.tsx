import { Compass, Home, ListFilter } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Logo className="mb-10" />

      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-inset ring-brand/15">
        <Compass className="h-8 w-8" />
      </span>

      <p className="mt-6 font-bold uppercase tracking-[0.18em] text-brand">
        404 · Off the map
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        This page isn&apos;t part of the neighbourhood.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
        The link may be old, mistyped, or the issue may have moved. Head back
        home or browse what the community is working on right now.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={buttonStyles({ size: "md" })}>
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link
          href="/issues"
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          <ListFilter className="h-4 w-4" />
          Browse issues
        </Link>
      </div>
    </main>
  );
}

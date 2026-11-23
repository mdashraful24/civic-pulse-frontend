import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonStyles } from "@/components/ui/button";
import { PUBLIC_PAGES } from "@/lib/public-pages";

export function PublicPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1">
      <section className="border-b border-line bg-surface-muted">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            {description}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
              Explore
            </p>
            <nav className="mt-3 grid gap-1">
              {PUBLIC_PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-ink/5 hover:text-ink"
                >
                  {page.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">Ready to act?</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Report an issue or see what is happening near you.
              </p>
              <Link
                href="/issues"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark"
              >
                Browse issues
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          <article className="min-w-0 space-y-10">{children}</article>
        </div>
      </div>
    </main>
  );
}

export function PublicSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-stone-600">
        {children}
      </div>
    </section>
  );
}

export function PublicList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span
            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PublicCallout({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-solid px-6 py-5 text-white">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/75">{description}</p>
      </div>
      <Link
        href={href}
        className={buttonStyles({ variant: "secondary", size: "sm" })}
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

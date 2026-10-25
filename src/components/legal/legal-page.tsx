import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_PAGES, LEGAL_UPDATED_AT } from "@/lib/legal";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1">
      <section className="border-b border-line bg-surface-muted">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            {description}
          </p>
          <p className="mt-4 text-xs text-stone-500">
            Last updated: {LEGAL_UPDATED_AT}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
              Policies
            </p>
            <nav className="mt-3 grid gap-1">
              {LEGAL_PAGES.map((page) => (
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
              <p className="text-sm font-semibold text-ink">Questions?</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Email{" "}
                <a
                  className="font-semibold text-brand hover:text-brand-dark"
                  href="mailto:hello@civicpulse.app"
                >
                  hello@civicpulse.app
                </a>{" "}
                and we will get back to you.
              </p>
            </div>
          </aside>

          <article className="min-w-0 space-y-10">{children}</article>
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
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

export function LegalList({ items }: { items: ReadonlyArray<string> }) {
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

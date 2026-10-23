import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  "Report an issue in under a minute",
  "Follow a public status timeline",
  "See field teams close the loop",
];

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(240,178,74,0.24),transparent_40%)]" />
        <div className="relative">
          <Logo className="text-white [&_span:last-child]:text-white" />
          <div className="mt-16 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              One shared civic record
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-5xl">
              A clearer way to fix what matters.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              CivicPulse connects the people who notice a problem with the
              people who can solve it.
            </p>
            <ul className="mt-8 grid gap-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/85"
                >
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MapPin className="h-5 w-5 text-accent" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                “The streetlight was fixed in four days.”
              </p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                Every report has a public timeline, an owner and a timestamp. No
                black holes.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-col bg-paper">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo className="lg:hidden" />
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to CivicPulse
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[420px]">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {description}
            </p>
            <div className="mt-7">{children}</div>
            {footer ? (
              <div className="mt-6 border-t border-line pt-5">{footer}</div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

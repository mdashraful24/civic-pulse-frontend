import {
  ArrowRight,
  Compass,
  Handshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const principles = [
  {
    icon: ShieldCheck,
    title: "Open by default",
    text: "Status changes belong in public view, not hidden in an inbox.",
  },
  {
    icon: Compass,
    title: "Clear next steps",
    text: "Every report should show who owns it and what happens next.",
  },
  {
    icon: Handshake,
    title: "Built together",
    text: "Residents, staff and field teams work from the same record.",
  },
];

const audiences = [
  {
    label: "Residents",
    text: "Report once, then follow the outcome without chasing updates.",
  },
  {
    label: "Administrators",
    text: "Triage, assign and measure work with a shared operational view.",
  },
  {
    label: "Field teams",
    text: "Arrive with location, context and a clear status to maintain.",
  },
  {
    label: "Neighbourhoods",
    text: "See local needs and progress in one public, trustworthy place.",
  },
];

export const metadata = {
  title: "About",
  description:
    "Learn why CivicPulse exists, who it serves and how it helps neighbourhoods move from report to resolution.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <section className="relative bg-surface-strong text-ink">
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_10%,var(--color-brand-solid)_0,transparent_38%),radial-gradient(circle_at_10%_90%,var(--color-accent-strong)_0,transparent_32%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                About CivicPulse
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                A shared record for the places we live.
              </h1>
            </div>
            <p className="max-w-md text-base leading-8 text-ink/70">
              CivicPulse turns a scattered local complaint into a visible,
              accountable process — from the first report to the final update.
            </p>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "See it", "Notice what needs attention in your area."],
              [
                "02",
                "Share it",
                "Add the details once, with location and photo.",
              ],
              [
                "03",
                "Resolve it",
                "Watch the status move to a public outcome.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-accent">
                  {number}
                </span>
                <p className="mt-3 text-lg font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="bg-paper">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Our story
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-4xl">
              Local problems deserve a public answer.
            </h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-stone-600">
              <p>
                A broken streetlight or damaged pavement is easy to notice. The
                hard part is finding out who can fix it, passing on the right
                details and knowing whether anything happened.
              </p>
              <p>
                CivicPulse was built to remove that uncertainty. Each report
                carries a place, a category and a timeline. Residents can see
                progress, administrators can prioritise real needs and field
                teams can act with context.
              </p>
              <p>
                The result is not just a ticket system. It is a shared civic
                record that makes everyday improvements easier to request and
                harder to forget.
              </p>
            </div>
          </div>

          <aside className="lg:pt-16">
            <div className="rounded-[32px] border border-accent/50 bg-accent/15 p-8 sm:p-10">
              <p className="text-2xl font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-3xl">
                “A report should never disappear into a black hole.”
              </p>
              <div className="mt-8 h-px w-16 bg-accent-strong" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-brand">
                The idea behind CivicPulse
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        id="principles"
        className="border-y border-line bg-surface-muted"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                Our principles
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink">
                Designed for trust.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-stone-500">
              Three commitments guide every feature we add to the platform.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
            {principles.map((item, index) => (
              <article key={item.title} className="bg-surface p-7">
                <span className="text-5xl font-semibold tracking-tight text-brand/20">
                  0{index + 1}
                </span>
                <item.icon className="mt-6 h-6 w-6 text-brand" />
                <h3 className="mt-4 text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand" />
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink">
              Built for everyone in the loop
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <div
                key={audience.label}
                className="rounded-2xl border-l-4 border-brand bg-surface-muted p-5"
              >
                <p className="font-bold text-ink">{audience.label}</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {audience.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-solid py-14 text-accent">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
              See what a shared record looks like.
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Explore current public reports in your neighbourhood.
            </p>
          </div>
          <Link
            href="/issues"
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Browse issues
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

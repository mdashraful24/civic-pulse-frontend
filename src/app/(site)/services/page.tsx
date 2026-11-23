import {
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const serviceGroups = [
  {
    id: "residents",
    icon: ClipboardList,
    label: "Residents",
    title: "Report without friction.",
    text: "Submit the essentials in a short form: what you saw, where it is and a photo if you have one. Then follow the same report from pending to resolved.",
    points: [
      "Guided categories",
      "Public status timeline",
      "Searchable history",
    ],
  },
  {
    id: "administrators",
    icon: LayoutDashboard,
    label: "Administrators",
    title: "Triage with confidence.",
    text: "Keep the public record accurate, review incoming reports and assign owners from one operational dashboard. Analytics show where demand is growing.",
    points: ["Moderation queue", "Assignment controls", "Category analytics"],
  },
  {
    id: "field",
    icon: Wrench,
    label: "Field teams",
    title: "Act with the right context.",
    text: "Assigned work arrives with location, notes and priority. Status updates and resolution notes keep everyone aligned without extra meetings.",
    points: ["Assigned worklist", "Location context", "AI-assisted updates"],
  },
];

const loop = [
  ["Capture", "A resident submits the issue with place and photo."],
  ["Review", "An administrator verifies and categorises it."],
  ["Resolve", "A field team updates the work and outcome."],
  ["Publish", "The public record shows the final status."],
];

export const metadata = {
  title: "Services",
  description:
    "Explore the reporting, moderation and coordination services available in CivicPulse.",
};

export default function ServicesPage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5 text-xs font-bold text-accent-ink">
              <Sparkles className="h-3.5 w-3.5" />
              One connected workflow
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-ink sm:text-6xl">
              Everything needed to run a clear civic workflow.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
              Reporting, triage, assignment and public updates live together —
              so every issue has an owner, a visible status and a recorded
              outcome.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={buttonStyles({ size: "lg" })}>
                Start reporting
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/issues"
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                View public reports
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-brand-soft" />
            <div className="relative rounded-[28px] border border-line bg-surface-muted p-4 shadow-xl shadow-ink/5 sm:p-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                    Live workflow
                  </p>
                  <p className="mt-1 font-semibold text-ink">Issue #CP-2048</p>
                </div>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                  In progress
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {loop.map(([title, text], index) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-2xl bg-surface p-4"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index < 2
                          ? "bg-brand-solid text-accent"
                          : "bg-surface-strong text-stone-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-stone-500">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="service-details" className="bg-paper">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div id="service-index" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Who it helps
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink">
              Three views, one loop.
            </h2>
            <nav className="mt-6 grid gap-2">
              {serviceGroups.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-ink/5 hover:text-ink"
                >
                  {group.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="grid gap-4">
            {serviceGroups.map((group) => (
              <article
                key={group.id}
                id={group.id}
                className="scroll-mt-24 rounded-3xl border border-line bg-surface p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <group.icon className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                      {group.label}
                    </p>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {group.title}
                  </h3>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-600">
                  {group.text}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {group.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-line bg-surface-muted px-3 py-1.5 text-xs font-semibold text-stone-600"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-strong text-ink">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                One shared system
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                Four visible steps. No lost updates.
              </h2>
            </div>
            <Search className="h-8 w-8 text-ink/30" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loop.map(([title, text], index) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-surface/70 p-5"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-accent">
                  0{index + 1}
                </span>
                <p className="mt-4 text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink">
              Put the workflow to work.
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Create an account and submit your first report in under a minute.
            </p>
          </div>
          <Link
            href="/register"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            Create an account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

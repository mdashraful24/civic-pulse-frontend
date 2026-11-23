import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const channels = [
  {
    icon: Mail,
    label: "General",
    address: "hello@civicpulse.app",
    text: "Feedback, partnerships and questions about the platform.",
  },
  {
    icon: MessageCircle,
    label: "Support",
    address: "support@civicpulse.app",
    text: "Account help and questions about a specific report.",
  },
];

const topics = [
  [
    "I cannot sign in",
    "Include the email address you use and what you expected to happen.",
  ],
  [
    "A report looks wrong",
    "Send the issue ID and a short note about what needs correcting.",
  ],
  [
    "I found a security issue",
    "Use the security page instead so it can be handled privately.",
  ],
];

export const metadata = {
  title: "Contact",
  description:
    "Contact the CivicPulse team for general questions, support, security concerns or privacy requests.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 overflow-x-hidden">
      <section className="border-b border-line bg-accent/20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Contact us
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-ink sm:text-6xl">
              We are here to help keep the loop moving.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
              Choose the right channel below and we will route your question to
              the team best placed to answer it.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -bottom-5 -right-3 h-32 w-32 rounded-full bg-brand-soft" />
            <div className="relative rounded-[32px] border border-line bg-surface p-7 shadow-xl shadow-ink/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-solid text-accent">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mt-6 text-xl font-semibold tracking-[-0.02em] text-ink">
                Serving neighbourhoods everywhere.
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                CivicPulse is built for local issues in any community, with one
                shared public record for every report.
              </p>
              <div className="mt-6 h-2 rounded-full bg-[linear-gradient(90deg,var(--color-brand-solid)_0%,var(--color-brand-solid)_33%,var(--color-line)_33%,var(--color-line)_66%,var(--color-accent)_66%)]" />
            </div>
          </div>
        </div>
      </section>

      <section id="channels" className="bg-surface-strong text-ink">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              Direct channels
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Talk to a real team.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-ink/60">
              We aim to acknowledge general and support enquiries within two
              business days. Security reports are reviewed as soon as they
              arrive.
            </p>
          </div>

          <div className="grid gap-4">
            {channels.map((channel) => (
              <a
                key={channel.address}
                href={`mailto:${channel.address}`}
                className="group flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-line bg-surface/70 p-6 transition hover:border-brand/30 hover:bg-surface sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
                    <channel.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
                      {channel.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold break-all">
                      {channel.address}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-ink/60">
                      {channel.text}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-accent transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="before-you-write" className="bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Before you write
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
              Three questions we can answer faster.
            </h2>
            <div className="mt-8 grid gap-3">
              {topics.map(([title, text], index) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-line bg-surface-muted p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-bold text-accent">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-line p-6">
              <Clock className="h-6 w-6 text-brand" />
              <p className="mt-5 text-lg font-semibold text-ink">
                Response times
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                General and support enquiries: two business days. Security
                reports: prioritised immediately.
              </p>
            </div>

            <div className="rounded-3xl bg-brand-soft p-6">
              <ShieldCheck className="h-6 w-6 text-brand" />
              <p className="mt-5 text-lg font-semibold text-ink">
                Security and privacy
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                For a suspected vulnerability, use our{" "}
                <Link
                  className="font-semibold text-brand hover:text-brand-dark"
                  href="/security"
                >
                  Security
                </Link>{" "}
                guidance. For data requests, read the{" "}
                <Link
                  className="font-semibold text-brand hover:text-brand-dark"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-surface-muted py-14">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink">
              Want to see the public record first?
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Browse current reports before getting in touch.
            </p>
          </div>
          <Link
            href="/issues"
            className={buttonStyles({ variant: "outline", size: "lg" })}
          >
            Browse issues
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

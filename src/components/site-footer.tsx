import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#ebe7dd]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
            A shared map of the things that need fixing in our neighbourhoods —
            reported by residents, resolved in public.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
            Explore
          </p>
          <ul className="mt-4 grid gap-2.5 text-sm text-stone-600">
            <li>
              <Link className="hover:text-brand" href="/issues">
                Browse issues
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" href="/#how-it-works">
                How it works
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" href="/register">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
            For teams
          </p>
          <ul className="mt-4 grid gap-2.5 text-sm text-stone-600">
            <li>
              <Link className="hover:text-brand" href="/dashboard">
                Staff dashboard
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" href="/login">
                Personnel login
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand" href="/login">
                Admin login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© CivicPulse. Built for better neighbourhoods.</p>
          <p>Report responsibly. Resolve together.</p>
        </div>
      </div>
    </footer>
  );
}

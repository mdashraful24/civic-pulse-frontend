"use client";

import { LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import { roleLabels } from "@/lib/constants";
import { cn } from "@/lib/format";

const links = [
  { href: "/issues", label: "Browse issues" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#categories", label: "Categories" },
];

export function SiteHeader() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = pathname?.replace(/\/$/, "") || "";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const href = link.href.replace(/\/$/, "");
            const active = href.startsWith("/#")
              ? current === "/" && typeof window !== "undefined"
                ? window.location.hash === href.slice(1)
                : false
              : current === href || current.startsWith(`${href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-stone-600 hover:bg-ink/5 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-10 w-36 animate-pulse rounded-xl bg-stone-200/70" />
          ) : user ? (
            <>
              <Link href="/dashboard" className={buttonStyles({ size: "sm" })}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-ink/5"
                title={`${user.name} · ${roleLabels[user.role]}`}
              >
                <Avatar name={user.name} src={user.imageUrl} size="sm" />
                {/* <span className="max-w-28 truncate text-sm font-semibold">
                  {user.name.split(" ")[0]}
                </span> */}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link href="/register" className={buttonStyles({ size: "sm" })}>
                Report an issue
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((current) => !current)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-paper px-4 py-4 md:hidden">
          <nav className="grid gap-1">
            {links.map((link) => {
              const href = link.href.replace(/\/$/, "");
              const active = href.startsWith("/#")
                ? current === "/" && typeof window !== "undefined"
                  ? window.location.hash === href.slice(1)
                  : false
                : current === href || current.startsWith(`${href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-stone-700 hover:bg-ink/5",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-line pt-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={buttonStyles({})}
                >
                  Open dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-1 py-2"
                >
                  <Avatar name={user.name} src={user.imageUrl} size="sm" />
                  <span className="text-sm font-semibold">{user.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonStyles({ variant: "outline" })}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className={buttonStyles({})}
                >
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

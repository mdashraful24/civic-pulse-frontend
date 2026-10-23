"use client";

import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Logo } from "@/components/brand/logo";
import { RoleBadge } from "@/components/issues/issue-badges";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/format";
import type { Role } from "@/lib/types";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}> = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["CITIZEN", "ADMIN", "PERSONNEL"],
  },
  {
    href: "/dashboard/report",
    label: "Report an issue",
    icon: PlusCircle,
    roles: ["CITIZEN"],
  },
  {
    href: "/dashboard/my-issues",
    label: "My issues",
    icon: ClipboardList,
    roles: ["CITIZEN"],
  },
  {
    href: "/dashboard/manage",
    label: "Manage issues",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/users",
    label: "People",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/assigned",
    label: "Assigned to me",
    icon: Wrench,
    roles: ["PERSONNEL"],
  },
  {
    href: "/dashboard/profile",
    label: "Profile & security",
    icon: Settings,
    roles: ["CITIZEN", "ADMIN", "PERSONNEL"],
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);

  if (!user) return null;

  const items = navItems.filter((item) => item.roles.includes(user.role));
  const current =
    items
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) =>
        item.href === "/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href),
      ) ?? items[0];

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm">
          <Avatar name={user.name} src={user.imageUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{user.name}</p>
            <div className="mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
          Workspace
        </p>
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition",
                active
                  ? "bg-brand-solid text-white shadow-sm shadow-brand/20"
                  : "text-stone-600 hover:bg-ink/5 hover:text-ink",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  active
                    ? "text-white"
                    : "text-stone-400 group-hover:text-brand",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 h-px bg-line" />
        <Link
          href="/issues"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-stone-600 transition hover:bg-ink/5 hover:text-ink"
        >
          <ExternalLink className="h-4 w-4 text-stone-400 group-hover:text-brand" />
          Public issue map
        </Link>
      </nav>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-stone-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-surface-muted lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="relative h-full w-[300px] max-w-[86vw] border-r border-line bg-surface-muted shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-dvh flex-col lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                CivicPulse workspace
              </p>
              <h1 className="text-sm font-bold text-ink">{current?.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/issues"
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-stone-500 transition hover:bg-ink/5 hover:text-ink sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public map
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-ink/5"
            >
              <Avatar name={user.name} src={user.imageUrl} size="sm" />
              <span className="hidden max-w-28 truncate text-xs font-semibold sm:block">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

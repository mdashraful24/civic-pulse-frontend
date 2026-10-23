import type { ReactNode } from "react";
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const instant = false;

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

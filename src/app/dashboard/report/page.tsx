"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { IssueForm } from "@/components/issues/issue-form";
import type { Issue } from "@/lib/types";

export default function ReportIssuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <RoleGate allow={["CITIZEN"]}>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="New report"
          title="Put it on the map."
          description="A good report gives the field team everything they need to find the problem and fix it."
        />

        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.7fr] lg:items-start">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <IssueForm
              mode="create"
              onSuccess={(issue: Issue) => {
                // Seed the cache so IssueDetail renders instantly (no re-fetch → no missing image flash)
                queryClient.setQueryData(["issue", issue.id], issue);
                router.push(`/issues/${issue.id}`);
              }}
            />
          </div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-brand/15 bg-brand-soft/60 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                Reporting tips
              </p>
              <ul className="mt-4 space-y-3">
                <Tip
                  icon={MapPin}
                  text="Be specific about the location — a landmark helps."
                />
                <Tip
                  icon={Camera}
                  text="Add a photo when it is safe to take one."
                />
                <Tip
                  icon={CheckCircle2}
                  text="Describe what is wrong, not who is to blame."
                />
                <Tip
                  icon={Clock3}
                  text="Reports are public immediately, with a status timeline."
                />
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm font-bold text-ink">What happens next?</p>
              <ol className="mt-3 space-y-3 text-xs leading-5 text-stone-500">
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
                    1
                  </span>
                  Your report appears as{" "}
                  <strong className="text-ink">Pending</strong>.
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
                    2
                  </span>
                  An administrator assigns a field team.
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
                    3
                  </span>
                  The team updates progress and leaves a resolution note.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}

function Tip({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-xs leading-5 text-stone-600">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
      {text}
    </li>
  );
}

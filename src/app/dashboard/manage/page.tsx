import { Suspense } from "react";
import { ManageIssues } from "@/components/dashboard/manage-issues";
import { PageLoader } from "@/components/ui/feedback";

export const metadata = {
  title: "Manage issues",
};

export default function ManageIssuesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading issue management" />}>
      <ManageIssues />
    </Suspense>
  );
}

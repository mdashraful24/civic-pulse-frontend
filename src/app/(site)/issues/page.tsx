import { Suspense } from "react";
import { IssueBrowser } from "@/components/issues/issue-browser";
import { PageLoader } from "@/components/ui/feedback";

export const metadata = {
  title: "Browse issues",
};

export default function IssuesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading the issue map" />}>
      <IssueBrowser />
    </Suspense>
  );
}

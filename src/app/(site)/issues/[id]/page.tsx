import { Suspense } from "react";
import { IssueDetail } from "@/components/issues/issue-detail";
import { PageLoader } from "@/components/ui/feedback";

export const metadata = {
  title: "Issue details",
};

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader label="Loading the issue" />}>
      <IssueDetailContent params={params} />
    </Suspense>
  );
}

async function IssueDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IssueDetail issueId={id} />;
}

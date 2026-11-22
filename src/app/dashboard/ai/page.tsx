import type { Metadata } from "next";
import { AIOverview } from "@/components/ai/ai-overview";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = {
  title: "AI insights",
  description:
    "Search reports by meaning and run a structured AI triage workflow.",
};

export default function AIPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow="Intelligence"
        title="AI insights"
        description="Use AI-assisted search and triage to make sense of civic reports faster. Results include the provider, fallback status and your remaining daily usage."
      />
      <AIOverview />
    </div>
  );
}

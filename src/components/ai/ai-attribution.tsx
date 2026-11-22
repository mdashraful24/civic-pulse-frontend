"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AIAttribution } from "@/lib/types";

export function AIAttributionLine({
  attribution,
}: {
  attribution: AIAttribution;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
      <Badge className="bg-brand-soft text-brand ring-brand/15">
        <Sparkles className="h-3 w-3" />
        {attribution.provider}
      </Badge>
      {attribution.degraded ? (
        <span className="rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Fallback used{attribution.reason ? `: ${attribution.reason}` : ""}
        </span>
      ) : null}
      {attribution.cached ? (
        <span className="rounded-lg bg-surface px-2 py-1">Cached result</span>
      ) : null}
      <span>
        {attribution.usage.remaining}/{attribution.usage.limit} AI requests left
        today
      </span>
    </div>
  );
}

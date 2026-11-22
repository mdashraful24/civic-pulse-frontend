"use client";

import { useQuery } from "@tanstack/react-query";
import { BrainCircuit, Sparkles } from "lucide-react";
import { SemanticSearch } from "@/components/ai/semantic-search";
import { TriageAssistant } from "@/components/ai/triage-assistant";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { api, getApiErrorMessage } from "@/lib/api";
import { cachePolicy } from "@/lib/query-cache";

export function AIOverview() {
  const capabilities = useQuery({
    queryKey: ["ai-capabilities"],
    queryFn: api.ai.capabilities,
    ...cachePolicy.stable,
  });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-brand/15 bg-linear-to-br from-brand-soft/80 to-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-brand">
          <BrainCircuit className="h-4 w-4" />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
            AI workspace
          </p>
        </div>

        {capabilities.isLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : null}

        {capabilities.isError ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {getApiErrorMessage(capabilities.error)}
          </p>
        ) : null}

        {capabilities.data ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-surface text-brand ring-brand/15">
                <Sparkles className="h-3 w-3" />
                Provider: {capabilities.data.provider}
              </Badge>
              <Badge className="bg-surface text-stone-600 ring-line">
                {capabilities.data.usage.remaining}/
                {capabilities.data.usage.limit} requests left today
              </Badge>
              <Badge className="bg-surface text-stone-600 ring-line">
                Caching {capabilities.data.cachingEnabled ? "on" : "off"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {capabilities.data.capabilities.map((capability) => (
                <div
                  key={capability.task}
                  className="rounded-xl border border-line bg-surface/80 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">
                      {capability.name}
                    </p>
                    {capability.advanced ? (
                      <Badge className="bg-brand-soft text-brand ring-brand/15">
                        Advanced
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-stone-500">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <SemanticSearch />
      <TriageAssistant />
    </div>
  );
}

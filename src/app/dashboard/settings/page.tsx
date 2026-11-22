"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoleGate } from "@/components/dashboard/auth-guard";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { FormField, Input } from "@/components/ui/field";
import { api, getApiErrorMessage } from "@/lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.admin.settings(),
  });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (query.data) {
      setDraft(
        Object.fromEntries(
          query.data.map((setting) => [setting.key, setting.value]),
        ),
      );
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.admin.saveSetting(key, value),
    onSuccess: (setting) => {
      toast.success(`Saved ${setting.key}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const settings = query.data ?? [];
  const save = (key: string, value: string) => mutation.mutate({ key, value });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <RoleGate allow={["ADMIN"]}>
        <PageHeader
          eyebrow="Administration"
          title="App settings"
          description="Manage small configuration values without a deployment."
        />

        {query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {query.isError ? (
          <EmptyState
            title="Settings unavailable"
            description={getApiErrorMessage(query.error)}
          />
        ) : null}

        {query.isSuccess ? (
          <div className="space-y-5">
            <div className="space-y-3">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <FormField label="Key" htmlFor={`key-${setting.key}`}>
                        <Input
                          id={`key-${setting.key}`}
                          value={setting.key}
                          disabled
                          readOnly
                        />
                      </FormField>
                    </div>
                    <div className="flex-[2]">
                      <FormField label="Value" htmlFor={`value-${setting.key}`}>
                        <Input
                          id={`value-${setting.key}`}
                          value={draft[setting.key] ?? setting.value}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [setting.key]: event.target.value,
                            }))
                          }
                          maxLength={2000}
                        />
                      </FormField>
                    </div>
                    <Button
                      size="sm"
                      loading={
                        mutation.isPending &&
                        mutation.variables?.key === setting.key
                      }
                      disabled={draft[setting.key] === setting.value}
                      onClick={() =>
                        save(setting.key, draft[setting.key] ?? setting.value)
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!settings.length ? (
              <EmptyState
                title="No settings yet"
                description="Add the first key and value below."
              />
            ) : null}

            <section className="rounded-2xl border border-dashed border-line bg-surface p-5">
              <h3 className="text-sm font-bold text-ink">Add a setting</h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <FormField
                  label="Key"
                  htmlFor="new-setting-key"
                  className="flex-1"
                >
                  <Input
                    id="new-setting-key"
                    value={newKey}
                    onChange={(event) => setNewKey(event.target.value)}
                    placeholder="site.notice"
                    maxLength={60}
                  />
                </FormField>
                <FormField
                  label="Value"
                  htmlFor="new-setting-value"
                  className="flex-1"
                >
                  <Input
                    id="new-setting-value"
                    value={newValue}
                    onChange={(event) => setNewValue(event.target.value)}
                    placeholder="Value"
                    maxLength={2000}
                  />
                </FormField>
                <Button
                  size="sm"
                  loading={
                    mutation.isPending && mutation.variables?.key === newKey
                  }
                  disabled={!newKey.trim() || !newValue.trim()}
                  onClick={() => {
                    save(newKey.trim(), newValue.trim());
                    setNewKey("");
                    setNewValue("");
                  }}
                >
                  Add
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </RoleGate>
    </div>
  );
}

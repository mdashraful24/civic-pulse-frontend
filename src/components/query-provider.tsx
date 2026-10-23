"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { cachePolicy } from "@/lib/query-cache";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...cachePolicy.list,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ duration: 4200 }}
      />
    </QueryClientProvider>
  );
}

"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { ApiRequestError } from "@/lib/api/client";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // 4xx는 다시 시도해도 결과가 같다
        retry: (count, error) =>
          !(error instanceof ApiRequestError && error.status >= 400 && error.status < 500) && count < 2,
      },
    },
  });
}

function getQueryClient() {
  // 서버 렌더마다 새 클라이언트, 브라우저에서는 하나를 재사용한다
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

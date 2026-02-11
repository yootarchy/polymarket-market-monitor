"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Provider Component
 * 
 * Wraps the application with TanStack Query (React Query) for:
 * - Server state management
 * - Automatic background refetching
 * - Caching and data synchronization
 * - Optimistic updates
 * 
 * Configuration:
 * - staleTime: Data considered fresh for 20 seconds before refetch
 * - gcTime: Cache garbage collected after 5 minutes of inactivity
 * - refetchOnWindowFocus: Auto-refetch when user returns to tab
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data stale after 20 seconds
            staleTime: 20 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Refetch when user focuses the window
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export const QueryClientProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 5000,
                    throwOnError: false,
                    refetchOnWindowFocus: false,
                    refetchOnReconnect: false,
                    refetchOnMount: false,
                    retry: false,
                }
            }
        })
    )

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}
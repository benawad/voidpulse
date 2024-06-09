import { httpLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "@voidpulse/api";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { toast } from "react-toastify";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export type DbChart = RouterOutput["getCharts"]["charts"][0];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(
        `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(
        `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    },
  }),
});

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      queryClient,
      links: [
        httpLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    };
  },
  ssr: false,
});

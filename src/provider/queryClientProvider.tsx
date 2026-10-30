import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import axios from "axios";
import type { ReactNode } from "react";

import { useAlertStore } from "@/store/alert.store";

// URLs or URL fragments that should not be persisted.
const EXCLUDED_CACHE_URLS: string[] = [
  "/auth/refresh",
  "/user/location",
  "/stream",
];

const CACHE_TIME = 1000 * 60 * 60 * 48; // 48 hours

const shouldPersistQuery = (query: {
  queryKey: readonly unknown[];
  state: { status: string };
}) => {
  if (query.state.status !== "success") {
    return false;
  }

  const queryKey = JSON.stringify(query.queryKey);

  return !EXCLUDED_CACHE_URLS.some((url) => queryKey.includes(url));
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error?.message === "string" && data.error.message.trim()) {
      return data.error.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const showGlobalError = (error: unknown) => {
  const message = getErrorMessage(error);

  // if (__DEV__) {
  //   console.error("[API ERROR]", {
  //     message,
  //     error,
  //   });
  // }

  useAlertStore.getState().error("Request Failed", message);
};

const client = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipGlobalError === true) {
        return;
      }

      showGlobalError(error);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalError === true) {
        return;
      }

      showGlobalError(error);
    },
  }),

  defaultOptions: {
    queries: {
      gcTime: CACHE_TIME,
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "RIFFLY_QUERY_CACHE",
  throttleTime: 1000,
});

type CQueryClientProviderProps = {
  children: ReactNode;
};

export const CQueryClientProvider = ({
  children,
}: CQueryClientProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: CACHE_TIME,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

// URLs or URL fragments that should not be persisted.
const EXCLUDED_CACHE_URLS: string[] = [
  "/auth/refresh",
  "/user/location",
  "/stream",
];

const CACHE_TIME = 1000 * 60 * 60 * 48; // 24 hours

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

const client = new QueryClient({
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

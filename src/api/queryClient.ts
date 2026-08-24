import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * React Query, told the truth about connectivity. Without this it assumes the
 * browser's online semantics and keeps firing requests into a dead radio; with
 * it, queries pause offline and resume the moment signal returns.
 */
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  }),
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Field work happens on bad signal: keep what we have, retry patiently.
      staleTime: 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

/**
 * The cache survives a cold start, so someone opening the app in a valley sees
 * yesterday's sites rather than a spinner.
 */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'carbcred.query-cache',
});

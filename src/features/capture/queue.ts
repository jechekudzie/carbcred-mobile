import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { QueuedWrite } from './types';

const STORAGE_KEY = 'carbcred.capture-queue';
/** client_ref → the id the server gave the record it created. */
const CREATED_KEY = 'carbcred.capture-created';

type QueueState = {
  items: QueuedWrite[];
  /** What each filed write became, so dependents can address themselves. */
  created: Record<string, number>;
  isHydrated: boolean;
  isDraining: boolean;

  hydrate: () => Promise<void>;
  enqueue: (write: Omit<QueuedWrite, 'status' | 'attempts' | 'lastError' | 'queuedAt'>) => Promise<void>;
  markSending: (clientRef: string) => Promise<void>;
  markFailed: (clientRef: string, error: string) => Promise<void>;
  remove: (clientRef: string) => Promise<void>;
  recordCreated: (clientRef: string, id: number) => Promise<void>;
  /** The endpoint to send to, or null while its dependency is unresolved. */
  resolveEndpoint: (write: QueuedWrite) => string | null;
  retry: (clientRef: string) => Promise<void>;
  setDraining: (draining: boolean) => void;
  pending: () => QueuedWrite[];
};

/**
 * The write queue. Every capture is written here first and sent from here —
 * there is no direct path to the network — so a form behaves the same on full
 * signal and none, and nothing is lost when the app is killed mid-trip.
 */
export const useQueueStore = create<QueueState>((set, get) => {
  const persist = async (items: QueuedWrite[]) => {
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const patch = (clientRef: string, change: Partial<QueuedWrite>) =>
    persist(
      get().items.map((item) =>
        item.payload.client_ref === clientRef ? { ...item, ...change } : item,
      ),
    );

  return {
    items: [],
    created: {},
    isHydrated: false,
    isDraining: false,

    hydrate: async () => {
      const [raw, createdRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(CREATED_KEY),
      ]);
      const items: QueuedWrite[] = raw ? JSON.parse(raw) : [];

      set({ created: createdRaw ? JSON.parse(createdRaw) : {} });

      // Anything caught mid-flight by a crash goes back to pending: the
      // client_ref makes a re-send safe even if the server did receive it.
      set({
        items: items.map((item) => (item.status === 'sending' ? { ...item, status: 'pending' } : item)),
        isHydrated: true,
      });
    },

    enqueue: async (write) =>
      persist([
        ...get().items,
        { ...write, status: 'pending', attempts: 0, lastError: null, queuedAt: new Date().toISOString() },
      ]),

    markSending: async (clientRef) => {
      const item = get().items.find((candidate) => candidate.payload.client_ref === clientRef);

      await patch(clientRef, { status: 'sending', attempts: (item?.attempts ?? 0) + 1 });
    },

    markFailed: async (clientRef, error) => patch(clientRef, { status: 'failed', lastError: error }),

    remove: async (clientRef) =>
      persist(get().items.filter((item) => item.payload.client_ref !== clientRef)),

    recordCreated: async (clientRef, id) => {
      const created = { ...get().created, [clientRef]: id };

      set({ created });
      await AsyncStorage.setItem(CREATED_KEY, JSON.stringify(created));
    },

    resolveEndpoint: (write) => {
      if (!write.endpoint.includes('{parent}')) {
        return write.endpoint;
      }

      const parent = write.dependsOn ? get().created[write.dependsOn] : undefined;

      // Its parent has not filed yet; the drain will come back to it.
      return parent === undefined ? null : write.endpoint.replace('{parent}', String(parent));
    },

    /** Put a failed row back in line — used when the officer fixes the cause. */
    retry: async (clientRef) => patch(clientRef, { status: 'pending', lastError: null }),

    setDraining: (isDraining) => set({ isDraining }),

    pending: () => get().items.filter((item) => item.status !== 'sending'),
  };
});

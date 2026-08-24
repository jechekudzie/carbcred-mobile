import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { FieldSubmissionPayload, QueuedCapture } from './types';

const STORAGE_KEY = 'carbcred.capture-queue';

type QueueState = {
  items: QueuedCapture[];
  isHydrated: boolean;
  isDraining: boolean;

  hydrate: () => Promise<void>;
  enqueue: (payload: FieldSubmissionPayload, siteName: string) => Promise<void>;
  /** Mark one in flight, so a second drain never sends it twice. */
  markSending: (clientRef: string) => Promise<void>;
  markFailed: (clientRef: string, error: string) => Promise<void>;
  remove: (clientRef: string) => Promise<void>;
  setDraining: (draining: boolean) => void;
  pending: () => QueuedCapture[];
};

/**
 * The write queue. Every capture is written here first and sent from here —
 * there is no direct path to the network — so the screen behaves the same on
 * full signal and none, and a submission survives the app being killed.
 */
export const useQueueStore = create<QueueState>((set, get) => {
  const persist = async (items: QueuedCapture[]) => {
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  return {
    items: [],
    isHydrated: false,
    isDraining: false,

    hydrate: async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const items: QueuedCapture[] = raw ? JSON.parse(raw) : [];

      // Anything caught mid-flight by a crash goes back to pending: the
      // client_ref makes a re-send safe even if the server did receive it.
      set({
        items: items.map((item) => (item.status === 'sending' ? { ...item, status: 'pending' } : item)),
        isHydrated: true,
      });
    },

    enqueue: async (payload, siteName) => {
      await persist([
        ...get().items,
        { payload, siteName, status: 'pending', attempts: 0, lastError: null, queuedAt: new Date().toISOString() },
      ]);
    },

    markSending: async (clientRef) => {
      await persist(
        get().items.map((item) =>
          item.payload.client_ref === clientRef
            ? { ...item, status: 'sending', attempts: item.attempts + 1 }
            : item,
        ),
      );
    },

    markFailed: async (clientRef, error) => {
      await persist(
        get().items.map((item) =>
          item.payload.client_ref === clientRef ? { ...item, status: 'failed', lastError: error } : item,
        ),
      );
    },

    remove: async (clientRef) => {
      await persist(get().items.filter((item) => item.payload.client_ref !== clientRef));
    },

    setDraining: (isDraining) => set({ isDraining }),

    pending: () => get().items.filter((item) => item.status !== 'sending'),
  };
});

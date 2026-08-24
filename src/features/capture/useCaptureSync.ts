import { useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { errorMessage, isPermanentFailure, submitCapture } from './api';
import { useQueueStore } from './queue';

/**
 * Drains the write queue whenever there is signal.
 *
 * Sends one at a time and stops on the first retryable failure: if the network
 * dropped again there is no sense marching the rest of the queue into the same
 * wall. A permanent failure — a validation error, a permission refusal — is
 * marked failed and left visible rather than retried forever.
 */
export function useCaptureSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const drain = async () => {
      const store = useQueueStore.getState();

      if (!store.isHydrated || store.isDraining || !onlineManager.isOnline()) {
        return;
      }

      const queue = store.pending();

      if (queue.length === 0) {
        return;
      }

      store.setDraining(true);

      try {
        for (const item of queue) {
          if (cancelled || !onlineManager.isOnline()) {
            break;
          }

          const ref = item.payload.client_ref;
          await useQueueStore.getState().markSending(ref);

          try {
            await submitCapture(item.payload);
            // Accepted, or already had it — either way it is filed.
            await useQueueStore.getState().remove(ref);
          } catch (error) {
            const message = errorMessage(error, 'Could not file this capture.');

            if (isPermanentFailure(error)) {
              await useQueueStore.getState().markFailed(ref, message);
              continue;
            }

            // Retryable: put it back and stop for now.
            await useQueueStore.getState().markFailed(ref, message);
            break;
          }
        }

        await queryClient.invalidateQueries({ queryKey: ['field-submissions'] });
      } finally {
        useQueueStore.getState().setDraining(false);
      }
    };

    void drain();

    const unsubscribe = onlineManager.subscribe(() => {
      void drain();
    });

    const unsubscribeQueue = useQueueStore.subscribe(() => {
      void drain();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      unsubscribeQueue();
    };
  }, [queryClient]);
}

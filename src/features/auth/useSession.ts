import { useEffect } from 'react';
import { api } from '@api/client';
import { useAuthStore, type AuthUser, type Organisation } from '@stores/authStore';

/**
 * Fills in who the restored token belongs to.
 *
 * A token on its own says someone is signed in and nothing about who — and the
 * app decides what to show from their permissions, so a relaunch without this
 * silently hides every permission-gated screen. Lives here rather than in the
 * store because the store must not depend on the HTTP client that depends on it.
 */
export function useSession() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { data } = await api.get<{ data: { user: AuthUser; organisations: Organisation[] } }>('/me');

        if (!cancelled) {
          await hydrate(data.data.user, data.data.organisations);
        }
      } catch {
        // A dead token is handled by the client's 401 interceptor, which signs
        // out. Anything else — offline, server down — leaves the token alone so
        // the app can try again rather than throwing the person out.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user, hydrate]);
}

import { useCallback } from 'react';
import { useAuthStore } from '@stores/authStore';

/**
 * What the signed-in person may do in the organisation they are working in.
 *
 * Subscribes to the permissions themselves rather than to the store's `can`
 * helper: a function reference never changes, so a component selecting it never
 * re-renders when the session arrives — which silently left the tab bar built
 * from an empty permission set on every relaunch.
 */
export function usePermissions(): (permission: string) => boolean {
  const organisations = useAuthStore((state) => state.organisations);
  const slug = useAuthStore((state) => state.organisationSlug);

  const permissions =
    organisations.find((organisation) => organisation.slug === slug)?.permissions ?? [];

  return useCallback(
    (permission: string) => permissions.includes(permission),
    // The array identity changes with the session, which is exactly when the
    // answer changes.
    [permissions],
  );
}

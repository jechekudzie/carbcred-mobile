import { useQuery } from '@tanstack/react-query';
import { fetchInbox } from '@features/tasks/api';
import { useAuthStore } from '@stores/authStore';

/**
 * How many things are waiting on this person, for the bell.
 *
 * Shares its key with the Tasks screen, so the two never disagree and opening
 * the inbox costs no extra request.
 */
export function useInboxCount(): number {
  const token = useAuthStore((state) => state.token);

  const { data } = useQuery({
    queryKey: ['approvals', null],
    queryFn: () => fetchInbox(),
    enabled: Boolean(token),
    staleTime: 60 * 1000,
  });

  return data?.counts.total ?? 0;
}

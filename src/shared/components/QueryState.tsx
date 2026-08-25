import type { ReactNode } from 'react';
import { CloudOff, Inbox, TriangleAlert } from 'lucide-react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import { errorMessage } from '@api/client';
import { useIsOnline } from '@shared/hooks/useIsOnline';
import { useTheme } from '@theme/useTheme';
import { SkeletonList } from './Skeleton';
import { StateMessage } from './StateMessage';

/**
 * The three answers a screen can give before it has content: still asking,
 * could not ask, and nothing to show.
 *
 * Written once because getting it wrong is invisible — a screen that fails
 * quietly looks like a screen with no data, and the person stands there
 * believing the site has no inspections when the request simply died.
 */
export function QueryState<T>({
  query,
  isEmpty,
  emptyTitle,
  emptyBody,
  skeletonRows,
  children,
}: {
  query: UseQueryResult<T>;
  isEmpty?: (data: T) => boolean;
  emptyTitle: string;
  emptyBody?: string;
  skeletonRows?: number;
  children: (data: T) => ReactNode;
}) {
  const { scheme } = useTheme();
  const online = useIsOnline();

  // Cached data beats every message here: if there is something to show, show
  // it, even while a refetch is failing in the background.
  if (query.data !== undefined) {
    if (isEmpty?.(query.data)) {
      return <StateMessage icon={<Inbox color={scheme.textMuted} size={30} />} title={emptyTitle} body={emptyBody} />;
    }

    return <>{children(query.data)}</>;
  }

  if (query.isLoading) {
    return <SkeletonList rows={skeletonRows ?? 3} />;
  }

  if (query.isError) {
    return online ? (
      <StateMessage
        icon={<TriangleAlert color={scheme.danger} size={30} />}
        tone="problem"
        title="That did not load"
        body={errorMessage(query.error, 'The server did not answer.')}
        action="Try again"
        onAction={() => query.refetch()}
      />
    ) : (
      <StateMessage
        icon={<CloudOff color={scheme.textMuted} size={30} />}
        title="Nothing saved for this yet"
        body="This phone has not seen this screen while online, so there is nothing to show until you have signal."
      />
    );
  }

  return null;
}

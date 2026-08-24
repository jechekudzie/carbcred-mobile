import { useEffect, useState } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Whether there is signal, from the same source the query layer uses — so the
 * banner the officer sees and the behaviour of the app can never disagree.
 */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(onlineManager.isOnline());

  useEffect(() => onlineManager.subscribe(setOnline), []);

  return online;
}

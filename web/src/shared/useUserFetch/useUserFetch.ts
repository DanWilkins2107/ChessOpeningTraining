import { useEffect, useEffectEvent, useState } from 'react';
import { useUser } from '../useUser/useUser';

// `fetch` must be stable (e.g. module-level): a new one each render refetches
// each render.
export function useUserFetch<T>(fetch: () => PromiseLike<T>) {
  const userId = useUser()?.id;
  const [version, setVersion] = useState({});
  const refresh = () => setVersion({});
  const [loaded, setLoaded] = useState<{ userId?: string; value?: T }>({});

  // Called from the response, not from the effect, so it reads the user of that
  // later moment: a response for a user who has since changed is dropped here,
  // rather than by the effect carrying a flag its cleanup has to flip.
  const onResponse = useEffectEvent((requestedFor: string, value: T) => {
    if (requestedFor === userId) setLoaded({ userId, value });
  });

  useEffect(() => {
    if (userId === undefined) return;

    fetch().then((value) => onResponse(userId, value));
  }, [fetch, userId, version]);

  return {
    value: loaded.userId === userId ? loaded.value : undefined,
    refresh,
  };
}

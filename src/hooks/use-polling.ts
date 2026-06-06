import { useState, useEffect, useRef } from "react";
import i18n from "i18next";

interface PollingOptions<T> {
  fetchFn: () => Promise<T>;
  isDone: (data: T) => boolean;
  interval?: number;
  maxRetries?: number;
  enabled?: boolean;
}

export function usePolling<T>({
  fetchFn,
  isDone,
  interval = 2000,
  maxRetries = 300,
  enabled = true,
}: PollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fetchFnRef = useRef(fetchFn);
  const isDoneRef = useRef(isDone);
  const enabledRef = useRef(enabled);

  const loading = enabled && data === null && error === null;

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    isDoneRef.current = isDone;
  });

  useEffect(() => {
    enabledRef.current = enabled;

    if (!enabled) {
      setData(null);
      setError(null);
      return;
    }

    retriesRef.current = 0;
    setData(null);
    setError(null);

    let cancelled = false;

    const poll = async () => {
      if (cancelled || !enabledRef.current) return;

      try {
        const result = await fetchFnRef.current();
        if (cancelled || !enabledRef.current) return;

        const done = isDoneRef.current(result);
        if (!cancelled) {
          setData(result);
          setError(null);
        }

        if (!done && retriesRef.current < maxRetries && !cancelled) {
          retriesRef.current += 1;
          timerRef.current = setTimeout(poll, interval);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : i18n.t("common.unknownError"),
          );
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, interval, maxRetries]);

  return { data, error, loading };
}

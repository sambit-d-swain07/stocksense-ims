import { useState, useEffect, useCallback } from 'react';

export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  deps: any[] = []
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, reload: execute };
}

import { useState, useEffect, useRef, useCallback } from "react";

// Custom hook for polling data
export function usePolling<T>(
  fetchFunction: () => Promise<T>,
  interval: number = 5000,
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setPollCount((prev) => prev + 1);
    } catch (err) {
      setError(err as Error);
      console.error("Polling error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      stopPolling(); // Stop existing polling first
    }

    // Fetch immediately
    fetchData();

    // Set up interval
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Restart polling - stops current polling and starts fresh
  const restartPolling = useCallback(() => {
    stopPolling();
    setPollCount(0);
    setError(null);
    startPolling();
  }, [stopPolling, startPolling]);

  // Restart with new parameters
  const restartWithNewParams = useCallback(
    (newFetchFunction?: () => Promise<T>, newInterval?: number) => {
      stopPolling();
      setPollCount(0);
      setError(null);
      setData(null);
      setIsLoading(true);

      // Use new parameters if provided, otherwise use existing ones
      const effectiveFetchFunction = newFetchFunction || fetchFunction;
      const effectiveInterval =
        newInterval !== undefined ? newInterval : interval;

      // Fetch immediately with new parameters
      effectiveFetchFunction()
        .then((result) => {
          setData(result);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err as Error);
          setIsLoading(false);
        });

      // Set up new interval
      intervalRef.current = setInterval(async () => {
        try {
          const result = await effectiveFetchFunction();
          setData(result);
          setPollCount((prev) => prev + 1);
        } catch (err) {
          setError(err as Error);
        }
      }, effectiveInterval);
    },
    [stopPolling, fetchFunction, interval]
  );

  useEffect(() => {
    if (immediate) {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, immediate]);

  return {
    data,
    isLoading,
    error,
    pollCount,
    startPolling,
    stopPolling,
    restartPolling,
    restartWithNewParams,
    refetch: fetchData,
    isPolling: !!intervalRef.current,
  };
}

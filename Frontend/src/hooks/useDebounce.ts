import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  return debouncedCallback;
}

/**
 * Custom hook for debouncing function calls with per-key debouncing
 * Useful for debouncing operations on multiple items independently
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback that accepts a key as first parameter
 */
export function useKeyedDebounce<
  T extends (key: string, ...args: unknown[]) => unknown,
>(
  callback: T,
  delay: number,
): (
  key: string,
  ...args: Parameters<T> extends [string, ...infer Rest] ? Rest : never
) => void {
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeoutsRef.current = {};
    };
  }, []);

  const debouncedCallback = useCallback(
    (
      key: string,
      ...args: Parameters<T> extends [string, ...infer Rest] ? Rest : unknown[]
    ) => {
      // Clear existing timer for this key
      if (timeoutsRef.current[key]) {
        clearTimeout(timeoutsRef.current[key]);
      }

      // Set new timer
      timeoutsRef.current[key] = setTimeout(() => {
        callbackRef.current(key, ...args);
        delete timeoutsRef.current[key];
      }, delay);
    },
    [delay],
  );

  return debouncedCallback;
}

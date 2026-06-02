import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage state that should be wiped from memory
 * when it is no longer needed (e.g., on component unmount or explicit closure).
 */
export function useSanitizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  const wipe = useCallback(() => {
    setState(initialValue);
  }, [initialValue]);

  // Wipe state on unmount for security
  useEffect(() => {
    return () => {
      setState(initialValue);
    };
  }, [initialValue]);

  return [state, setState, wipe] as const;
}
